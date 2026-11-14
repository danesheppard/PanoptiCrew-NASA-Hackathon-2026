/**
 * Radar Scope component for visualizing satellite evidence
 * @component
 *
 * @returns {JSX.Element} The radar scope component
 */

export default function RadarScope() {
  return (
    <div
      className="radar-scope"
      role="img"
      aria-label="Radar scope scanning satellite evidence"
    >
      <div className="radar-grid" aria-hidden="true" />
      <div className="radar-circle radar-circle-outer" aria-hidden="true" />
      <div className="radar-circle radar-circle-middle" aria-hidden="true" />
      <div className="radar-circle radar-circle-inner" aria-hidden="true" />
      <div
        className="radar-crosshair radar-crosshair-horizontal"
        aria-hidden="true"
      />
      <div
        className="radar-crosshair radar-crosshair-vertical"
        aria-hidden="true"
      />
      <div className="radar-sweep" aria-hidden="true" />
      <span className="radar-dot radar-dot-one" aria-hidden="true" />
      <span className="radar-dot radar-dot-two" aria-hidden="true" />
      <span className="radar-dot radar-dot-three" aria-hidden="true" />
      {/* <span className="radar-readout">LIVE OBSERVATION</span> */}
    </div>
  );
}
