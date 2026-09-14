function RadarChart({ data }) {
  // data: array of { label: string, value: number (0-100) }
  if (!data || data.length === 0) return null;

  const size = 260;
  const center = size / 2;
  const radius = center - 40;
  const total = data.length;

  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate grid circles/polygons
  const levels = [0.25, 0.5, 0.75, 1.0];
  const gridPolygons = levels.map((level) => {
    return data
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level * 100);
        return `${x},${y}`;
      })
      .join(" ");
  });

  // Generate data polygon
  const points = data
    .map((item, i) => {
      const { x, y } = getCoordinates(i, item.value);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="d-flex justify-content-center my-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid Background */}
        {gridPolygons.map((polygonPoints, idx) => (
          <polygon
            key={idx}
            points={polygonPoints}
            fill="none"
            stroke="var(--border-strong)"
            strokeDasharray={idx < 3 ? "3 3" : "none"}
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        {data.map((item, i) => {
          const { x, y } = getCoordinates(i, 100);
          const labelCoords = getCoordinates(i, 118);
          return (
            <g key={i}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="var(--border-strong)"
                strokeWidth="1"
              />
              <text
                x={labelCoords.x}
                y={labelCoords.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize="10"
                fontWeight="600"
              >
                {item.label}
              </text>
            </g>
          );
        })}

        {/* Data Area */}
        <polygon
          points={points}
          fill="rgba(56, 189, 248, 0.25)"
          stroke="var(--accent-primary)"
          strokeWidth="2.5"
        />

        {/* Data Dots */}
        {data.map((item, i) => {
          const { x, y } = getCoordinates(i, item.value);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="var(--accent-primary)"
              stroke="var(--bg-surface)"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
}

export default RadarChart;
