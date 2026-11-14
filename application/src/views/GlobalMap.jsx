import DeckGL from "@deck.gl/react";
import { _GlobeView as GlobeView } from "@deck.gl/core";
import { TileLayer } from "@deck.gl/geo-layers";
import { BitmapLayer, ScatterplotLayer } from "@deck.gl/layers";
import { caseStudies } from "../data/caseStudies.js";

const globe = new GlobeView({ resolution: 10 });
const initialView = { longitude: 20, latitude: 20, zoom: 3 };

const basemap = new TileLayer({
  id: "basemap",
  data: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
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

export default function GlobalMap({ selected, onSelect, onLaunch, onHome }) {
  const markers = new ScatterplotLayer({
    id: "case-studies",
    data: caseStudies,
    getPosition: (d) => d.coordinates,
    getFillColor: (d) =>
      d.id === selected?.id ? [255, 140, 0] : [11, 61, 145],
    getLineColor: [255, 255, 255],
    stroked: true,
    lineWidthMinPixels: 2,
    radiusMinPixels: 9,
    pickable: true,
    onClick: ({ object }) => onSelect(object),
    updateTriggers: { getFillColor: selected?.id },
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
            <p>{selected.stages.takeaway.summary}</p>
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
          layers={[basemap, markers]}
          getCursor={({ isHovering }) => (isHovering ? "pointer" : "grab")}
        />
        <span className="attribution">© OpenStreetMap contributors</span>
      </div>
    </div>
  );
}
