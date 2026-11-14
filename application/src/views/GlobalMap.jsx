import { useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import { _GlobeView as GlobeView } from "@deck.gl/core";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, IconLayer, ScatterplotLayer } from "@deck.gl/layers";
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
  opacity: 0.01,
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
const ICON_ALTITUDE_METERS = 2000;

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

  useEffect(() => {
    Promise.all(
      caseStudies.map(async (study) => [study.id, await circleIcon(study)]),
    ).then((entries) => setIcons(Object.fromEntries(entries)));
  }, []);

  const markerFallback = new ScatterplotLayer({
    id: "case-study-marker-fallback",
    data: caseStudies,
      getPosition: ({ coordinates }) => [
        ...calculateCentroid(coordinates),
        ICON_ALTITUDE_METERS,
      ],
    getFillColor: [11, 61, 145, 255],
    getLineColor: [255, 255, 255, 255],
    getRadius: ({ id }) => (id === selected?.id ? 9 : 7),
    radiusUnits: "pixels",
    billboard: true,
    parameters: { depthTest: false },
    stroked: true,
    lineWidthMinPixels: 2,
    pickable: true,
    onClick: ({ object }) => onSelect(object),
    updateTriggers: { getRadius: selected?.id },
  });

  const markers =
    icons &&
    new IconLayer({
      id: "case-studies",
      data: caseStudies,
      getPosition: ({ coordinates }) => [
        ...calculateCentroid(coordinates),
        ICON_ALTITUDE_METERS,
      ],
      getIcon: ({ id }) => ({
        id,
        url: icons[id],
        width: ICON_PX,
        height: ICON_PX,
      }),
      getSize: ({ id }) => (id === selected?.id ? 64 : 44),
      parameters: { depthTest: false },
      pickable: true,
      onClick: ({ object }) => onSelect(object),
      updateTriggers: { getSize: selected?.id },
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
          initialViewState={initialView}
          controller
          layers={[basemap, markerFallback, markers]}
          getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
        />
        <span className="attribution">© OpenStreetMap contributors</span>
      </div>
    </div>
  );
}
