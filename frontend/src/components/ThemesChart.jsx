import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SENTIMENT_COLORS = {
  positive: '#22c55e',
  negative: '#f43f5e',
  mixed:    '#f59e0b',
  neutral:  '#94a3b8',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm max-w-48">
      <p className="font-semibold text-gray-700 mb-1">{d.fullName}</p>
      <p className="text-gray-500">{d.count} mention{d.count !== 1 ? 's' : ''}</p>
      <p className="text-xs mt-0.5" style={{ color: SENTIMENT_COLORS[d.sentiment] }}>
        {d.sentiment}
      </p>
    </div>
  );
};

export default function ThemesChart({ themes, t }) {
  const hasData = themes && themes.length > 0;

  if (!hasData) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
        <span className="text-3xl">📋</span>
        <span>{t?.noThemeData || 'No theme data available.'}</span>
      </div>
    );
  }

  const data = themes.slice(0, 8).map(th => ({
    name: th.name.length > 14 ? th.name.substring(0, 13) + '…' : th.name,
    fullName: th.name,
    count: th.count,
    sentiment: th.sentiment,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 32)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 24, left: 4, bottom: 0 }}
        barSize={16}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          width={90}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={SENTIMENT_COLORS[entry.sentiment] || '#e91e8c'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
