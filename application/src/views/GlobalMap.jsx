import { useEffect, useState } from "react";
import { useLocalStorage } from "../customHooks.ts";
import DeckGL from "@deck.gl/react";
import { MapView, _GlobeView as GlobeView } from "@deck.gl/core";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, IconLayer, LineLayer } from "@deck.gl/layers";
import { IconWorld, IconMap } from "@tabler/icons-react";
import { caseStudies } from "../data/caseStudies.ts";
import { calculateCentroid } from "../utilities.ts";

const globe = new GlobeView({ resolution: 10 });
const initialView = { longitude: 70, latitude: 25, zoom: 2 };
const mapView = new MapView({ repeat: true });

const ICON_PX = 128;
const RING = 6;
const BASE_ICON_ALTITUDE_METERS = 600000;
const MIN_ICON_ALTITUDE_METERS = 5000;
const MIN_ZOOM = 2;
const MAX_ZOOM = 8;

// Center-crops the image into a circle with a white ring; a missing image leaves a blue disc.
async function circleIcon({ iconImage }) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = ICON_PX;
  const ctx = canvas.getContext("2d");
  const r = ICON_PX / 2;

  ctx.beginPath();
  ctx.arc(r, r, r - RING / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#0b3d91";
  ctx.fill();
  try {
    const img = new Image();
    img.src = `/assets/eventIcons/${iconImage}`;
    await img.decode();
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
    // keep the plain disc
  }
  ctx.lineWidth = RING;
  ctx.strokeStyle = "#fff";
  ctx.stroke();
  return canvas.toDataURL();
}

export default function GlobalMap({ selected, onSelect, onLaunch, onHome }) {
  const [icons, setIcons] = useState(null);
  const [viewState, setViewState] = useLocalStorage("viewState", initialView);
  const zoom = viewState.zoom;
  const iconAltitude = Math.max(
    MIN_ICON_ALTITUDE_METERS,
    BASE_ICON_ALTITUDE_METERS * 2 ** (initialView.zoom - zoom),
  );
  const [isGlobe, setIsGlobe] = useLocalStorage("isGlobe", false);
  // Change from projected to globe view changes TileLayer id to for a fresh retrieval of tiles. Otherwise,
  // old tiles may persist as off-putting rectangular patches on the globe.
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

  useEffect(() => {
    // When globe is toggled on, make sure that the new max zoom state is applied,
    // and reset pitch and bearing to 0
    setViewState((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom, isGlobe ? MAX_ZOOM : MIN_ZOOM),
      pitch: 0,
      bearing: 0,
    }));
  }, [isGlobe]);

  useEffect(() => {
    Promise.all(
      caseStudies.map(async (study) => [study.id, await circleIcon(study)]),
    ).then((entries) => setIcons(Object.fromEntries(entries)));
  }, []);

  const pointers = new LineLayer({
    id: "case-study-pointers",
    data: caseStudies,
    getSourcePosition: ({ coordinates }) => [
      ...calculateCentroid(coordinates),
      0,
    ],
    getTargetPosition: ({ coordinates }) => [
      ...calculateCentroid(coordinates),
      iconAltitude,
    ],
    getColor: [255, 255, 255, 200],
    getWidth: 2,
    widthUnits: "pixels",
    parameters: { depthTest: true, cullMode: "none" },
    updateTriggers: { getTargetPosition: iconAltitude },
  });

  const markers =
    icons &&
    new IconLayer({
      id: "case-studies",
      data: caseStudies,
      getPosition: ({ coordinates }) => [
        ...calculateCentroid(coordinates),
        iconAltitude,
      ],
      getIcon: ({ id }) => ({
        id,
        url: icons[id],
        width: ICON_PX,
        height: ICON_PX,
      }),
      getSize: ({ id }) => (id === selected?.id ? 64 : 44),
      parameters: { depthTest: true, cullMode: "none" },
      pickable: true,
      onClick: ({ object }) => onSelect(object),
      updateTriggers: {
        getPosition: iconAltitude,
        getSize: selected?.id,
      },
    });

  return (
    <div className="map-view">
      <aside className="panel">
        <button className="link" onClick={onHome}>
          ← Home
        </button>
        {selected ? (
          <>
            <span className="badge">Sample content</span>
            <h2>{selected.title}</h2>
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
      <div className="map">
        <DeckGL
          views={isGlobe ? globe : mapView}
          viewState={viewState}
          parameters={{ clearColor: [0, 0, 0, 0] }}
          controller={{
            minZoom: MIN_ZOOM,
            maxZoom: isGlobe ? MAX_ZOOM / 2 : MAX_ZOOM,
          }}
          onViewStateChange={({ viewState: nextViewState }) => {
            const { longitude, latitude, zoom, pitch, bearing } = nextViewState;
            setViewState({
              longitude,
              latitude,
              zoom,
              pitch: isGlobe ? 0 : pitch,
              bearing: isGlobe ? 0 : bearing,
            });
          }}
          layers={[basemap, pointers, markers]}
          getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
        />
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
        <span className="attribution">© OpenStreetMap contributors</span>
      </div>
    </div>
  );
}
