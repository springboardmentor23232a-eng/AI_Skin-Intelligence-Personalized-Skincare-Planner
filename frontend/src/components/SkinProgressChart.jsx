// A lightweight, dependency-free line chart for skin health score history.
// Deliberately avoids pulling in a charting library since this project has
// none installed — just plain SVG, styled with the app's CSS variables.
export default function SkinProgressChart({ reports = [] }) {
  // Oldest-to-newest for a left-to-right timeline.
  const points = [...reports]
    .filter((r) => typeof r.skin_health_score === 'number')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  if (points.length < 2) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: 30 }}>📈</div>
        <p>Complete more skin assessments to see your progress over time.</p>
      </div>
    );
  }

  const width = 640;
  const height = 220;
  const padX = 36;
  const padY = 24;
  const scores = points.map((p) => p.skin_health_score);
  const minScore = Math.max(0, Math.min(...scores) - 8);
  const maxScore = Math.min(100, Math.max(...scores) + 8);
  const range = maxScore - minScore || 1;

  const xFor = (i) => padX + (i * (width - padX * 2)) / (points.length - 1);
  const yFor = (score) => height - padY - ((score - minScore) / range) * (height - padY * 2);

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(p.skin_health_score)}`).join(' ');
  const areaPath = `${linePath} L ${xFor(points.length - 1)} ${height - padY} L ${xFor(0)} ${height - padY} Z`;

  const first = points[0].skin_health_score;
  const last = points[points.length - 1].skin_health_score;
  const trend = last - first;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-primary-dark)' }}>{last}</span>
        <span className="text-muted" style={{ fontSize: 13.5 }}>current score</span>
        {trend !== 0 && (
          <span className={`badge ${trend > 0 ? 'badge-green' : 'badge-amber'}`}>
            {trend > 0 ? '▲' : '▼'} {Math.abs(trend)} since first assessment
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={width - padX}
            y1={padY + f * (height - padY * 2)}
            y2={padY + f * (height - padY * 2)}
            stroke="var(--color-border)"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill="url(#progressFill)" stroke="none" />
        <path d={linePath} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => (
          <circle key={i} cx={xFor(i)} cy={yFor(p.skin_health_score)} r="4" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="2.5" />
        ))}
      </svg>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span className="text-soft" style={{ fontSize: 11.5 }}>
          {new Date(points[0].created_at).toLocaleDateString()}
        </span>
        <span className="text-soft" style={{ fontSize: 11.5 }}>
          {new Date(points[points.length - 1].created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
