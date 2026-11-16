export default function buildLegend(
  legend,
  { className, title, ariaLabel, showFloodPath = false },
) {
  if (!legend) return null;

  const categories =
    legend.type === "categories" &&
    Array.isArray(legend.categories) &&
    legend.categories.length > 0;
  const hasGradient =
    Array.isArray(legend.gradient) &&
    legend.gradient.length >= 2 &&
    typeof legend.labels?.lowEnd === "string" &&
    typeof legend.labels?.highEnd === "string";

  if (!categories && !hasGradient) return null;

  const legendGradient = hasGradient
    ? `linear-gradient(to right, ${legend.gradient
        .map(([red, green, blue]) => `rgb(${red} ${green} ${blue})`)
        .join(", ")})`
    : undefined;

  return (
    <div
      className={`stage-legend ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      <span className="stage-legend-title">{title}</span>
      {categories ? (
        <div className="stage-legend-categories">
          {legend.categories.map(({ color, label }, index) => (
            <div className="stage-legend-category" key={`${label}-${index}`}>
              <span
                className="stage-legend-color"
                style={{
                  background: Array.isArray(color)
                    ? `rgb(${color.join(" ")})`
                    : color,
                }}
                aria-hidden="true"
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div
            className="stage-legend-gradient"
            style={{ background: legendGradient }}
            aria-hidden="true"
          />
          <div className="stage-legend-labels">
            <span>{legend.labels.lowEnd}</span>
            <span>{legend.labels.highEnd}</span>
          </div>
          {showFloodPath && (
            <div className="stage-legend-path">
              <span className="stage-legend-line" aria-hidden="true" />
              Traced flood path
            </div>
          )}
        </>
      )}
    </div>
  );
}
