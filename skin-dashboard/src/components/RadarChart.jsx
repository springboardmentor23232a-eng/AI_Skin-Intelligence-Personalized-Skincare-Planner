import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

function RadarChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-64 my-2">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={10} />
          <Radar
            name="Skin Metric"
            dataKey="value"
            stroke="#4F46E5"
            fill="#4F46E5"
            fillOpacity={0.3}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E293B',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#F8FAFC',
              fontSize: '12px',
              padding: '6px 12px'
            }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}

export default RadarChart;
