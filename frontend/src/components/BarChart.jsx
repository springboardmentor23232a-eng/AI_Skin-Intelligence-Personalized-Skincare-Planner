// A dependency-free horizontal bar chart, in the same spirit as
// SkinProgressChart — plain markup styled with the app's CSS variables,
// no charting library. `data` is [{ label, value }], already sorted by
// the caller if a particular order is wanted.
export default function BarChart({ data = [], maxValue }) {
  if (!data.length) return null;
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      {data.map((d) => (
        <div className="bar-chart-row" key={d.label}>
          <div className="bar-chart-label" title={d.label}>{d.label}</div>
          <div className="bar-chart-track">
            <div className="bar-chart-fill" style={{ width: `${Math.max(4, (d.value / max) * 100)}%` }} />
          </div>
          <div className="bar-chart-value">{d.value}</div>
        </div>
      ))}
    </div>
  );
}
