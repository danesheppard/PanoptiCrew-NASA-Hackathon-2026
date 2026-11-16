// SI Acknowledgment: This file was refactored and debugged with assistance for GPT-6 Luna and Claude Sonnet 5.5
import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "../customHooks.ts";
import DeckGL from "@deck.gl/react";
import {
  FlyToInterpolator,
  MapView,
  _GlobeView as GlobeView,
} from "@deck.gl/core";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, LineLayer, ScatterplotLayer } from "@deck.gl/layers";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconWorld,
  IconMap,
} from "@tabler/icons-react";
import { caseStudies } from "../data/caseStudies.ts";
import { calculateCentroid } from "../utilities/utilities.ts";
import buildLegend from "../utilities/buildLegend.jsx";
import Header from "./Header/Header.jsx";
import "./GlobalMap.css";

const TILE_URL = import.meta.env.VITE_SAT_TILES;

const globe = new GlobeView({ resolution: 10 });
const mapView = new MapView({ repeat: true });
const initialView = { longitude: 70, latitude: 25, zoom: 2 };

const BASE_ICON_ALTITUDE_METERS = 600000;
const MIN_ICON_ALTITUDE_METERS = 5000;
const MIN_ZOOM = 2;
const MAX_ZOOM = 13;
const GLOBE_MIN_ZOOM = 4;
const PING_MS = 2200;

// Story stages in order; `date` maps to a key in study.key_dates.
const STAGE_LABELS = [
  { type: "leadUp", label: "Lead-up", date: "before" },
  { type: "event", label: "Event", date: "event" },
  { type: "takeaway", label: "Takeaway", date: "after" },
];

// Case studies are static, so their centroids are computed once instead of on every render.
const centroids = new Map(
  caseStudies.map((study) => [
    study.case,
    calculateCentroid(study.coordinates),
  ]),
);

/**
 * Checks whether coordinates describe a bounding box rather than a point.
 *
 * @param {number[]} coordinates - A point or [west, south, east, north].
 * @returns {boolean} Whether the coordinates describe an area.
 */
const isArea = (coordinates) => coordinates.length === 4;

/**
 * Reads a CSS theme variable (e.g. "--accent") from the document root.
 *
 * @param {string} token - The CSS variable name.
 * @returns {string} The computed colour value.
 */
const getThemeColor = (token) =>
  getComputedStyle(document.documentElement).getPropertyValue(token).trim();

/**
 * Converts a hex CSS theme colour to an [r, g, b] array for deck.gl.
 *
 * @param {string} token - The CSS variable name.
 * @returns {number[]} The RGB components.
 */
const getThemeRgb = (token) => {
  const hex = getThemeColor(token).slice(1);
  return [0, 2, 4].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
};

/**
 * Returns the longitude equivalent to `target` that is closest to `current`,
 * so the globe spins the short way round instead of the long way.
 *
 * @param {number} current - The current longitude.
 * @param {number} target - The desired longitude.
 * @returns {number} The adjusted target longitude.
 */
const nearestLongitude = (current, target) =>
  current + (((target - current + 540) % 360) - 180);

/**
 * Draws one satellite tile. Returns null when the tile was cancelled or failed,
 * because a BitmapLayer without an image throws "deck.gl: assertion failed".
 *
 * @param {Object} props - Sub-layer props provided by TileLayer.
 * @returns {BitmapLayer|null} The tile layer, or null if there's no image.
 */
const renderTile = (props) => {
  if (!props.data) return null;
  const { west, south, east, north } = props.tile.bbox;
  return new BitmapLayer(props, {
    data: null,
    image: props.data,
    bounds: [west, south, east, north],
  });
};

/**
 * Converts a longitude/latitude to the x/y index of the Web Mercator tile containing it.
 *
 * @param {number} lon - Longitude in degrees.
 * @param {number} lat - Latitude in degrees.
 * @param {number} z - Zoom level.
 * @returns {number[]} The [x, y] tile index.
 */
const tileIndex = (lon, lat, z) => {
  const n = 2 ** z;
  const rad = (lat * Math.PI) / 180;
  return [
    Math.floor(((lon + 180) / 360) * n),
    Math.floor(
      ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n,
    ),
  ];
};

// Tile zoom levels to prefetch, as [zoom, radius in tiles].
// Point studies are viewed around zoom 6; area studies are viewed closer, around zoom 10.
const POINT_PREFETCH_LEVELS = [
  [3, 1],
  [6, 2],
];
const AREA_PREFETCH_LEVELS = [
  [3, 1],
  [10, 2],
];
let hasPrefetched = false;

/**
 * Downloads the tiles around each case study in the background. Esri allows
 * tiles to be cached for 24 hours, so when deck.gl later requests the same URLs
 * they come from the browser cache and the map lands sharp, with no blur.
 * Runs once per page load, even if the map screen is opened again.
 */
const prefetchStudyTiles = () => {
  if (hasPrefetched || !TILE_URL) return;
  hasPrefetched = true;

  // Prefetch the full zoom-2 world so clearing the selection lands on a complete map.
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      fetch(
        TILE_URL.replace("{z}", 2).replace("{x}", x).replace("{y}", y),
      ).catch(() => {});
    }
  }
  // Prefetch tiles around each case study to improve map loading performance.
  for (const study of caseStudies) {
    const [lon, lat] = centroids.get(study.case);
    const levels = isArea(study.coordinates)
      ? AREA_PREFETCH_LEVELS
      : POINT_PREFETCH_LEVELS;
    for (const [z, r] of levels) {
      const [cx, cy] = tileIndex(lon, lat, z);
      for (let x = cx - r; x <= cx + r; x++) {
        for (let y = cy - r; y <= cy + r; y++) {
          fetch(
            TILE_URL.replace("{z}", z).replace("{x}", x).replace("{y}", y),
          ).catch(() => {});
        }
      }
    }
  }
};

/**
 * Renders the interactive case-study map in globe or flat-map mode.
 *
 * @param {Object} props - Map content and navigation callbacks.
 * @param {Object|null} props.selected - The selected case study, if any.
 * @param {function(Object|null): void} props.onSelect - Selects a case study.
 * @param {function(): void} props.onLaunch - Opens the selected case study.
 * @param {function(): void} props.onHome - Returns to the welcome view.
 */
export default function GlobalMap({ selected, onSelect, onLaunch, onHome }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGlobe, setIsGlobe] = useLocalStorage("isGlobe", false);
  // Drop deck's extra controller fields (e.g. maxBounds): JSON turns its Infinity into null, which locks panning.
  const [viewState, setViewState] = useLocalStorage(
    "viewState",
    initialView,
    ({ longitude, latitude, zoom, pitch, bearing }) => ({
      longitude,
      latitude,
      zoom,
      pitch,
      bearing,
    }),
  );
  const [radarStageType, setRadarStageType] = useState("leadUp");
  const [pingProgress, setPingProgress] = useState(0);

  // Marker colour is the same in every theme, so it is read once.
  const accentRgb = useMemo(() => getThemeRgb("--marker"), []);

  // Markers float above the surface; the height shrinks as you zoom in so they stay close to their spot
  const iconAltitude = Math.max(
    MIN_ICON_ALTITUDE_METERS,
    BASE_ICON_ALTITUDE_METERS * 2 ** (initialView.zoom - viewState.zoom),
  );
  // Radar imagery requires an area and a browser-supported image file.
  const radarStages =
    selected && isArea(selected.coordinates)
      ? (selected.layers ?? []).filter(
          (stage) => stage.file && /\.(png|jpe?g|webp)$/i.test(stage.file),
        )
      : [];
  const radarStage =
    radarStages.find((stage) => stage.name.includes(radarStageType)) ??
    radarStages[0];
  const radarLegend = radarStage?.legend;
  const eventStage = selected?.stages.find((s) => s.type === "event");
  const takeawayStage = selected?.stages.find((s) => s.type === "takeaway");
  /**
   * Builds the main basemap layer for high-detail tiles.
   * Change from projected to globe view requires updating the TileLayer id for a fresh retrieval of tiles.
   */
  const basemap = new TileLayer({
    id: isGlobe ? "basemap-globe" : "basemap-map",
    data: TILE_URL,
    maxZoom: 19,
    tileSize: 256,
    refinementStrategy: isGlobe ? "never" : "best-available",
    renderSubLayers: renderTile, // skips cancelled tiles (avoids "assertion failed")
  });

  // On switching views: clamp zoom to that view's limits and reset any tilt or rotation.
  // Only the basic fields are kept, so leftover FlyTo settings are dropped.
  useEffect(() => {
    setViewState(({ longitude, latitude, zoom }) => ({
      longitude,
      latitude,
      zoom: Math.max(
        isGlobe ? GLOBE_MIN_ZOOM : MIN_ZOOM,
        Math.min(zoom, MAX_ZOOM),
      ),
      pitch: 0,
      bearing: 0,
    }));
  }, [isGlobe]);

  // Ping pulse timer; skipped when the user has turned on reduced motion
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame;
    const tick = (time) => {
      setPingProgress((time % PING_MS) / PING_MS);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Prefetch case study tiles once the first frame has painted
  useEffect(() => {
    const timer = setTimeout(prefetchStudyTiles, 1500);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Animates the camera to a target: a spin on the globe, a fly-to on the flat map.
   *
   * @param {Object} target - { longitude, latitude, zoom } to move to.
   * @param {number} duration - Animation length in milliseconds.
   */
  const moveCamera = (target, duration) => {
    // When moving the camera, enforce a minimum zoom to ensure a good view of the target area
    target.zoom = Math.max(target.zoom ?? 0, MAX_ZOOM / 1.5);
    setViewState((prev) => ({
      ...prev,
      ...target,
      longitude: isGlobe
        ? nearestLongitude(prev.longitude, target.longitude)
        : target.longitude,
      pitch: 0,
      bearing: 0,
      zoom: target.zoom,
      transitionInterpolator: new FlyToInterpolator({ speed: 1.2 }),
      transitionDuration: duration,
    }));
  };

  /**
   * Selects a case study and moves the camera to it, or back out to the
   * starting view when the selection is cleared.
   *
   * @param {Object|null} study - The case study to select, or null to clear.
   */
  const selectStudy = (study) => {
    onSelect(study);
    if (!study) return moveCamera(initialView, 2000);
    const [longitude, latitude] = centroids.get(study.case);
    moveCamera({ longitude, latitude }, 2000);
  };

  // Radar image for the selected layer, stretched over the study's bounding box.
  // On the globe it's lifted 300 m so its middle doesn't dip below the curved Earth.
  const radarLayer =
    radarStage &&
    new BitmapLayer({
      id: `radar-layer-${selected.case}-${radarStage.name}-${isGlobe ? "globe" : "map"}`,
      data: null,
      image: radarStage.file.startsWith("/")
        ? radarStage.file
        : `/assets/geospatial/${radarStage.file}`,
      bounds: isGlobe
        ? (([west, south, east, north]) => [
            [west, south, 300],
            [west, north, 300],
            [east, north, 300],
            [east, south, 300],
          ])(selected.coordinates)
        : selected.coordinates,
      opacity: 0.75,
      parameters: { depthTest: isGlobe }, // globe: keeps the far side of the Earth hidden
    });

  // Hide the selected study's ping while its radar image is showing. Keep this
  // data stable across animation frames so marker attributes aren't needlessly rebuilt.
  const hasRadarLayer = Boolean(radarStage);
  const markerData = useMemo(
    () =>
      hasRadarLayer
        ? caseStudies.filter(({ case: c }) => c !== selected?.case)
        : caseStudies,
    [hasRadarLayer, selected?.case],
  );

  const pingPosition = ({ case: c }) => [...centroids.get(c), iconAltitude];

  // Vertical line from the ground up to each floating ping
  const pointers = new LineLayer({
    id: "case-study-pointers",
    data: markerData,
    getSourcePosition: ({ case: c }) => [...centroids.get(c), 0],
    getTargetPosition: pingPosition,
    getColor: [...accentRgb, 200],
    getWidth: 2,
    widthUnits: "pixels",
    parameters: { depthTest: true, cullMode: "none" },
    updateTriggers: { getTargetPosition: iconAltitude },
  });

  // Expanding ring that fades as it grows, like a radar ping
  const pingRings = new ScatterplotLayer({
    id: "case-study-ping-rings",
    data: markerData,
    getPosition: pingPosition,
    getRadius: 12 + pingProgress * 30,
    radiusUnits: "pixels",
    filled: false,
    stroked: true,
    getLineColor: [232, 235, 243, Math.round(255 * (1 - pingProgress))],
    getLineWidth: 3,
    lineWidthUnits: "pixels",
    billboard: true, // always faces the camera, so it stays round on the globe
    parameters: { depthTest: isGlobe }, // globe: hidden when on the far side of the Earth
    updateTriggers: { getPosition: iconAltitude },
  });

  // Solid lime dot with a dark outline; bigger when selected. This is what users click.
  const pingDots = new ScatterplotLayer({
    id: "case-study-pings",
    data: markerData,
    getPosition: pingPosition,
    getRadius: ({ case: c }) => (c === selected?.case ? 15 : 11),
    radiusUnits: "pixels",
    getFillColor: accentRgb,
    stroked: true,
    getLineColor: [11, 16, 32],
    getLineWidth: 3,
    lineWidthUnits: "pixels",
    billboard: true,
    parameters: { depthTest: isGlobe },
    pickable: true,
    onClick: ({ object }) => selectStudy(object),
    updateTriggers: { getPosition: iconAltitude, getRadius: selected?.case },
  });

  return (
    <div className="map-screen">
      {/* Project navigation */}
      <Header onHome={onHome} />

      <div className="map-view">
        {/* Selected case study details */}
        {isSidebarOpen && (
          <aside className="panel">
            <div className="panel-heading">
              <h2>Case study</h2>
              <button
                className="sidebar-toggle"
                type="button"
                aria-label="Close case study sidebar"
                title="Close sidebar"
                onClick={() => setIsSidebarOpen(false)}
              >
                <IconChevronLeft aria-hidden="true" focusable="false" />
              </button>
            </div>
            {selected ? (
              <>
                <h2>{selected.title}</h2>
                <p className="panel-meta">
                  {[selected.type, selected.location]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {eventStage && (
                  <p className="metric">
                    <strong>{eventStage.metric.value}</strong>{" "}
                    {eventStage.metric.label}
                  </p>
                )}
                {takeawayStage && (
                  <section aria-labelledby="why-it-matters">
                    <h3 id="why-it-matters">Why it matters</h3>
                    <p className="panel-headline">{takeawayStage.headline}</p>
                    <p>{takeawayStage.summary}</p>
                  </section>
                )}
                <h3>The story</h3>
                <ol className="stage-preview">
                  {STAGE_LABELS.map(({ type, label, date }) => {
                    const stage = selected.stages.find((s) => s.type === type);
                    return (
                      stage && (
                        <li key={type}>
                          <span className="stage-preview-label">
                            {label} · {selected.key_dates[date]}
                          </span>
                          {stage.headline}
                        </li>
                      )
                    );
                  })}
                </ol>
                <label className="radar-layer-select">
                  <span>Radar layer</span>
                  <div className="map-study-select-control">
                    <select
                      value={radarStage?.name ?? ""}
                      disabled={!radarStages.length}
                      aria-label="Radar layer"
                      onChange={(e) => setRadarStageType(e.target.value)}
                    >
                      {radarStages.length ? (
                        radarStages.map((stage) => (
                          <option key={stage.name} value={stage.name}>
                            {stage.name}
                          </option>
                        ))
                      ) : (
                        <option value="">No imagery available</option>
                      )}
                    </select>
                    <IconChevronDown
                      className="map-study-chevron"
                      aria-hidden="true"
                      focusable="false"
                    />
                  </div>
                </label>
                <div className="panel-footer">
                  <button className="launch" onClick={onLaunch}>
                    Launch Case Study
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>Select a case study on the map or from the list below.</p>
                <ul className="study-list">
                  {caseStudies.map((study) => (
                    <li key={study.case}>
                      <button
                        className="study-list-item"
                        type="button"
                        onClick={() => selectStudy(study)}
                      >
                        {study.iconImage && (
                          <img
                            src={`/assets/eventIcons/${study.iconImage}`}
                            alt=""
                          />
                        )}
                        <span>
                          <strong>{study.title}</strong>
                          <small>
                            {[study.type, study.location]
                              .filter(Boolean)
                              .join(" · ")}
                          </small>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        )}

        <main className="map-main">
          {/* Case study selection and sidebar controls */}
          <div className="map-toolbar">
            {!isSidebarOpen && (
              <button
                className="sidebar-toggle"
                type="button"
                aria-label="Open case study sidebar"
                title="Open sidebar"
                onClick={() => setIsSidebarOpen(true)}
              >
                <IconChevronRight aria-hidden="true" focusable="false" />
              </button>
            )}
            <label className="map-study-select">
              <div className="map-study-select-control">
                <select
                  aria-label="Select a case study"
                  value={selected?.case ?? ""}
                  onChange={(event) =>
                    selectStudy(
                      caseStudies.find(
                        ({ case: studyCase }) =>
                          studyCase === event.target.value,
                      ) ?? null,
                    )
                  }
                >
                  <option value="">Choose a case study</option>
                  {caseStudies.map((study) => (
                    <option key={study.case} value={study.case}>
                      {study.title}
                    </option>
                  ))}
                </select>
                <IconChevronDown
                  className="map-study-chevron"
                  aria-hidden="true"
                  focusable="false"
                />
              </div>
            </label>
          </div>

          {/* Interactive map and view controls */}
          <div className="map">
            <DeckGL
              views={isGlobe ? globe : mapView}
              viewState={viewState}
              parameters={{ clearColor: [0, 0, 0, 0] }}
              controller={{
                minZoom: isGlobe ? GLOBE_MIN_ZOOM : MIN_ZOOM,
                maxZoom: MAX_ZOOM,
                dragRotate: !isGlobe,
                smooth: true,
              }}
              // Stored unmodified: deck cancels a flight if the state differs from its current frame
              onViewStateChange={({ viewState: next }) => setViewState(next)}
              layers={[basemap, radarLayer, pointers, pingRings, pingDots]}
              getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
            />
            {buildLegend(radarLegend, {
              className: "map-legend",
              title: "Map legend",
              ariaLabel: `${radarStage} map legend`,
            })}
            <div className="toggle-view" role="group" aria-label="Map view">
              <button
                className="toggle-view-option"
                type="button"
                aria-label="Map view"
                aria-pressed={!isGlobe}
                onClick={() => setIsGlobe(false)}
              >
                <IconMap aria-hidden="true" focusable="false" />
              </button>
              <span className="toggle-view-divider" aria-hidden="true" />
              <button
                className="toggle-view-option"
                type="button"
                aria-label="Globe view"
                aria-pressed={isGlobe}
                onClick={() => setIsGlobe(true)}
              >
                <IconWorld aria-hidden="true" focusable="false" />
              </button>
            </div>
            <span className="attribution">
              Imagery: Esri, Maxar, Earthstar Geographics, and the GIS User
              Community
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
