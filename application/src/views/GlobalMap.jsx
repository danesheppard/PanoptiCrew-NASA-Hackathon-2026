import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "../customHooks.ts";
import DeckGL from "@deck.gl/react";
import {
  FlyToInterpolator,
  LinearInterpolator,
  MapView,
  _GlobeView as GlobeView,
} from "@deck.gl/core";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, IconLayer, LineLayer } from "@deck.gl/layers";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconWorld,
  IconMap,
} from "@tabler/icons-react";
import { caseStudies } from "../data/caseStudies.ts";
import { calculateCentroid } from "../utilities.ts";
import Header from "./Header/Header.jsx";
import "./GlobalMap.css";

const TILE_URL = import.meta.env.VITE_SAT_TILES;

const globe = new GlobeView({ resolution: 10 });
const mapView = new MapView({ repeat: true });
const initialView = { longitude: 70, latitude: 25, zoom: 2 };

const ICON_PX = 128;
const RING = 6;
const BASE_ICON_ALTITUDE_METERS = 600000;
const MIN_ICON_ALTITUDE_METERS = 5000;
const MIN_ZOOM = 2;
const MAX_ZOOM = 13;
const GLOBE_MIN_ZOOM = 4; // was MAX_ZOOM / 2 (4)

// Interpolators are stateless, so one instance of each is reused for every transition.
// Globe: plain rotation. Flat map: FlyTo (zoom out, pan, zoom in), which is built for Web Mercator.
const globeInterpolator = new LinearInterpolator([
  "longitude",
  "latitude",
  "zoom",
]);
const flatInterpolator = new FlyToInterpolator();
const easeInOut = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

// Case studies are static, so their centroids are computed once instead of on every render.
const centroids = new Map(
  caseStudies.map((study) => [
    study.case,
    calculateCentroid(study.coordinates),
  ]),
);

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

// Zoom levels to prefetch around each case study, with the tile radius for each:
// zoom 3 is where the globe lands, zoom 6 is where the flat map lands.
const PREFETCH_LEVELS = [
  [3, 1],
  [6, 2],
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
  for (const [lon, lat] of centroids.values()) {
    for (const [z, r] of PREFETCH_LEVELS) {
      const [cx, cy] = tileIndex(lon, lat, z);
      for (let x = cx - r; x <= cx + r; x++)
        for (let y = cy - r; y <= cy + r; y++)
          fetch(
            TILE_URL.replace("{z}", z).replace("{x}", x).replace("{y}", y),
          ).catch(() => {});
    }
  }
};

/**
 * Creates a circular marker icon for a case study, with its photo cropped inside.
 * Falls back to a plain accent-coloured disc if the image can't be loaded.
 *
 * @param {Object} options
 * @param {string} options.iconImage - Filename in /public/assets/eventIcons.
 * @returns {Promise<string>} A data URL of the generated icon.
 */
async function circleIcon({ iconImage }) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = ICON_PX;
  const ctx = canvas.getContext("2d");
  const r = ICON_PX / 2;

  ctx.beginPath();
  ctx.arc(r, r, r - RING / 2, 0, Math.PI * 2);
  ctx.fillStyle = getThemeColor("--accent");
  ctx.fill();
  try {
    const img = new Image();
    img.src = `/assets/eventIcons/${iconImage}`;
    await img.decode();
    // Centre-crop to a square so the photo fills the circle without stretching
    const side = Math.min(img.width, img.height);
    ctx.save();
    ctx.clip();
    ctx.drawImage(
      img,
      (img.width - side) / 2,
      (img.height - side) / 2,
      side,
      side,
      0,
      0,
      ICON_PX,
      ICON_PX,
    );
    ctx.restore();
  } catch {
    // Keep the plain disc
  }
  ctx.lineWidth = RING;
  ctx.strokeStyle = getThemeColor("--text");
  ctx.stroke();
  return canvas.toDataURL();
}

export default function GlobalMap({ selected, onSelect, onLaunch, onHome }) {
  const [icons, setIcons] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGlobe, setIsGlobe] = useLocalStorage("isGlobe", false);
  const [viewState, setViewState] = useLocalStorage("viewState", initialView);
  const [radarStageType, setRadarStageType] = useState("leadUp");
  const [transitionProps, setTransitionProps] = useState(null);

  // Theme colours only change on reload, so read them once
  const accentRgb = useMemo(() => getThemeRgb("--accent"), []);

  // Markers float above the surface; the height shrinks as you zoom in so they stay close to their spot
  const iconAltitude = Math.max(
    MIN_ICON_ALTITUDE_METERS,
    BASE_ICON_ALTITUDE_METERS * 2 ** (initialView.zoom - viewState.zoom),
  );
  const radarStages = selected?.coordinates
    ? selected.stages.filter(
        (stage) => stage.imagery && !stage.imagery.startsWith("Placeholder:"),
      )
    : [];
  const radarStage =
    radarStages.find((stage) => stage.type === radarStageType) ??
    radarStages[0];
  const radarLegend = radarStage?.legend;
  const hasRadarLegend =
    Array.isArray(radarLegend?.gradient) &&
    radarLegend.gradient.length >= 2 &&
    typeof radarLegend.labels?.lowEnd === "string" &&
    typeof radarLegend.labels?.highEnd === "string";
  const radarGradient = hasRadarLegend
    ? `linear-gradient(to right, ${radarLegend.gradient
        .map(([red, green, blue]) => `rgb(${red} ${green} ${blue})`)
        .join(", ")})`
    : undefined;
  /**
   * Builds the main basemap layer for high-detail tiles.
   * Change from projected to globe view requires updating the TileLayer id for a fresh retrieval of tiles.
   */
  const basemap = new TileLayer({
    id: isGlobe ? "basemap-globe" : "basemap-map",
    data: import.meta.env.VITE_SAT_TILES,
    maxZoom: 19,
    tileSize: 256,
    refinementStrategy: isGlobe ? "never" : "best-available",
    renderSubLayers: (props) => {
      const { west, south, east, north } = props.tile.bbox;
      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north],
      });
    },
  });

  // On switching views: clamp zoom to that view's limit and reset any tilt or rotation
  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom, isGlobe ? MAX_ZOOM : MIN_ZOOM),
      pitch: 0,
      bearing: 0,
    }));
  }, [isGlobe]);

  // Build the marker icons, then prefetch case study tiles once the first frame has painted
  useEffect(() => {
    Promise.all(
      caseStudies.map(async (study) => [study.case, await circleIcon(study)]),
    ).then((entries) => setIcons(Object.fromEntries(entries)));
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
    setTransitionProps({
      transitionDuration: duration,
      transitionInterpolator: isGlobe ? globeInterpolator : flatInterpolator,
      transitionEasing: easeInOut,
    });
    setViewState((prev) => ({
      ...prev,
      ...target,
      longitude: isGlobe
        ? nearestLongitude(prev.longitude, target.longitude)
        : target.longitude,
      pitch: 0,
      bearing: 0,
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
    if (!study) return moveCamera(initialView, 1000);
    const [longitude, latitude] = centroids.get(study.case);
    const zoom = isGlobe ? 3 : study.coordinates ? 9.5 : 6; // was 6 on the flat map
    moveCamera({ longitude, latitude, zoom }, 1200);
  };

  /**
   * Builds the fallback basemap layer for low-detail tiles.
   */
  const fallbackBasemap = new TileLayer({
    id: "basemap-fallback",
    data: TILE_URL,
    minZoom: 0,
    maxZoom: 2, // above zoom 2 these tiles are stretched, never re-downloaded
    tileSize: 256,
    maxCacheSize: 50,
    parameters: { depthTest: isGlobe }, // Enable depth testing only for the globe to hide the far side of the Earth.
    renderSubLayers: renderTile,
  });

  /**
   * Builds the radar layer for the selected case study, if available.
   *
   * @returns {BitmapLayer|null} The radar layer, or null if not available.
   */
  const radarLayer =
    selected?.coordinates && radarStage
      ? new BitmapLayer({
          id: `radar-layer-${selected.case}-${radarStage.type}`,
          data: null,
          image: radarStage.imagery.startsWith("/")
            ? radarStage.imagery
            : `/assets/geospatial/${radarStage.imagery}`,
          bounds: selected.coordinates,
          opacity: 0.75,
          parameters: {
            depthTest: isGlobe,
            polygonOffsetFill: true,
            polygonOffset: [-1, -1],
          },
        })
      : null;

  // Filter out the selected case study from the marker data if a radar layer is present.
  const markerData = radarLayer
    ? caseStudies.filter(({ case: c }) => c !== selected?.case)
    : caseStudies;

  /**
   * Builds the vertical line layer from the ground up to each floating marker.
   */
  const pointers = new LineLayer({
    id: "case-study-pointers",
    data: markerData,
    getSourcePosition: ({ case: c }) => [...centroids.get(c), 0],
    getTargetPosition: ({ case: c }) => [...centroids.get(c), iconAltitude],
    getColor: [...accentRgb, 200],
    getWidth: 2,
    widthUnits: "pixels",
    parameters: { depthTest: true, cullMode: "none" },
    updateTriggers: { getTargetPosition: iconAltitude },
  });

  /**
   * Builds the photo marker layer for each case study.
   * Skipped until the icons have been generated.
   */
  const markers =
    icons &&
    new IconLayer({
      id: "case-studies",
      data: markerData,
      getPosition: ({ case: c }) => [...centroids.get(c), iconAltitude],
      getIcon: ({ case: c }) => ({
        id: c,
        url: icons[c],
        width: ICON_PX,
        height: ICON_PX,
      }),
      getSize: ({ case: c }) => (c === selected?.case ? 64 : 44),
      parameters: { depthTest: true, cullMode: "none" },
      pickable: true,
      onClick: ({ object }) => selectStudy(object),
      updateTriggers: {
        getPosition: iconAltitude,
        getSize: selected?.case,
      },
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
                <label className="radar-layer-select">
                  <span>Radar layer</span>
                  <div className="map-study-select-control">
                    <select
                      value={radarStage?.type ?? ""}
                      disabled={!radarStages.length}
                      aria-label="Radar layer"
                      onChange={(event) =>
                        setRadarStageType(event.target.value)
                      }
                    >
                      {radarStages.length ? (
                        radarStages.map((stage) => (
                          <option key={stage.type} value={stage.type}>
                            {stage.type === "leadUp"
                              ? "Before"
                              : stage.type === "event"
                                ? "During"
                                : "After"}
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
                <dl>
                  <dt>Type</dt>
                  <dd>{selected.type}</dd>
                  <dt>Location</dt>
                  <dd>{selected.location}</dd>
                  <dt>Timeline</dt>
                  <dd>
                    {selected.timeline.start} → {selected.timeline.end}
                  </dd>
                </dl>
                <p>
                  {
                    selected.stages.find((stage) => stage.type === "takeaway")
                      ?.summary
                  }
                </p>
                <button className="launch" onClick={onLaunch}>
                  Launch Case Study
                </button>
              </>
            ) : (
              <p>Select a case study on the map to see its summary.</p>
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
                      caseStudies.find(({ id }) => id === event.target.value) ??
                        null,
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
              }}
              /**
               * Handles view state changes for the map or globe.
               * Updates the view state unless the interaction is in transition.
               */
              onViewStateChange={({ viewState: nextViewState }) => {
                const { longitude, latitude, zoom, pitch, bearing } =
                  nextViewState;
                setViewState({
                  longitude,
                  latitude,
                  zoom: isGlobe
                    ? Math.max(zoom, GLOBE_MIN_ZOOM)
                    : Math.max(zoom, MIN_ZOOM),
                  pitch: isGlobe ? 0 : pitch,
                  bearing: isGlobe ? 0 : bearing,
                });
              }}
              layers={[fallbackBasemap, basemap, radarLayer, pointers, markers]}
              getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
            />
            {hasRadarLegend && (
              <div
                className="stage-legend map-legend"
                role="group"
                aria-label={`${radarStage.type} map legend`}
              >
                <span className="stage-legend-title">Map legend</span>
                <div
                  className="stage-legend-gradient"
                  style={{ background: radarGradient }}
                  aria-hidden="true"
                />
                <div className="stage-legend-labels">
                  <span>{radarLegend.labels.lowEnd}</span>
                  <span>{radarLegend.labels.highEnd}</span>
                </div>
              </div>
            )}
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
