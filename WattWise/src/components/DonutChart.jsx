/**
 * Donut chart drawn with plain SVG — no charting library needed.
 * Geometry matches the design: 146px box, 73px outer radius, 23px ring.
 */

const SIZE = 146;
const RADIUS = 61.5;
const STROKE = 23;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DonutChart({ slices, centerValue, centerLabel, title, activeId }) {
  // Each arc starts where the previous one ended.
  const arcs = slices.reduce((acc, slice) => {
    const previous = acc[acc.length - 1];
    const start = previous ? previous.start + previous.length : 0;
    return [...acc, { ...slice, start, length: (slice.percent / 100) * CIRCUMFERENCE }];
  }, []);

  return (
    <figure className="donut">
      <svg
        className="donut__svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        role="img"
        aria-label={title}
      >
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--bar-track)"
            strokeWidth={STROKE}
          />
          {arcs.map((arc) => {
            const dimmed = activeId && activeId !== arc.id;
            return (
              <circle
                key={arc.id}
                className="donut__arc"
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={arc.color}
                // The highlighted segment thickens slightly and the rest fade,
                // so the link between legend row and slice is unmistakable.
                strokeWidth={activeId === arc.id ? STROKE + 6 : STROKE}
                strokeOpacity={dimmed ? 0.32 : 1}
                strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
                strokeDashoffset={-arc.start}
              />
            );
          })}
        </g>
      </svg>

      <figcaption className="donut__center">
        <span className="donut__value">{centerValue}</span>
        <span className="donut__label">{centerLabel}</span>
      </figcaption>
    </figure>
  );
}
