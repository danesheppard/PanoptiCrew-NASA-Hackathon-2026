import { useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import { _GlobeView as GlobeView } from "@deck.gl/core";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, IconLayer, LineLayer } from "@deck.gl/layers";
import { caseStudies } from "../data/caseStudies.ts";

const globe = new GlobeView({ resolution: 10 });
const initialView = { longitude: 70, latitude: 25, zoom: 2 };

const calculateCentroid = (coordinates) => {
  if (coordinates.length === 2) return coordinates;
  const [minLng, minLat, maxLng, maxLat] = coordinates;
  return [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
};

const basemap = new TileLayer({
  id: "basemap",
  data: import.meta.env.VITE_SAT_TILES,
  maxZoom: 19,
  tileSize: 256,
  renderSubLayers: (props) => {
    const { west, south, east, north } = props.tile.bbox;
    return new BitmapLayer(props, {
      data: null,
      image: props.data,
      bounds: [west, south, east, north],
    });
  },
});

const ICON_PX = 128;
const RING = 6;
const BASE_ICON_ALTITUDE_METERS = 600000;
const MIN_ICON_ALTITUDE_METERS = 5000;
const MIN_ZOOM = 2;
const MAX_ZOOM = 10;

/**
 * Theme for the map icons and other UI elements.
 *
 * @param {string} token - The CSS variable token representing the theme color.
 * @returns {string} The computed color value.
 */
const getThemeColor = (token) =>
  getComputedStyle(document.documentElement).getPropertyValue(token).trim();

/**
 * Converts a CSS theme color to its RGB representation.
 *
 * @param {string} token - The CSS variable token representing the theme color.
 *
 * @returns {Array<number>} The RGB representation of the theme color.
 */
const getThemeRgb = (token) => {
  const hex = getThemeColor(token).slice(1);
  return [0, 2, 4].map((index) =>
    Number.parseInt(hex.slice(index, index + 2), 16),
  );
};

/**
 * Creates a circular icon for a case study, optionally overlaying an image.
 *
 * @param {Object} options
 * @param {string} options.iconImage - The filename of the image to overlay on the icon.
 * @returns {Promise<string>} A data URL representing the generated icon.
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
  ctx.strokeStyle = getThemeColor("--text");
  ctx.stroke();
  return canvas.toDataURL();
}

export default function GlobalMap({ selected, onSelect, onLaunch, onHome }) {
  const [icons, setIcons] = useState(null);
  const [viewState, setViewState] = useState(initialView);
  const zoom = viewState.zoom;
  const iconAltitude = Math.max(
    MIN_ICON_ALTITUDE_METERS,
    BASE_ICON_ALTITUDE_METERS * 2 ** (initialView.zoom - zoom),
  );

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
    getColor: [...getThemeRgb("--accent"), 200],
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
          views={globe}
          viewState={viewState}
          controller={{ minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM }}
          onViewStateChange={({ viewState: nextViewState }) =>
            setViewState(nextViewState)
          }
          layers={[basemap, pointers, markers]}
          getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
        />
        <span className="attribution">© OpenStreetMap contributors</span>
      </div>
    </div>
  );
}
