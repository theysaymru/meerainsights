import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
  Positive: '#22c55e',
  Neutral:  '#94a3b8',
  Negative: '#f43f5e',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700">{payload[0].name}</p>
      <p className="text-gray-500">{payload[0].value}% of reviews</p>
    </div>
  );
};

export default function SentimentChart({ data, t }) {
  const hasData = data && data.length > 0 && data.some(d => d.value > 0);

  if (!hasData) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
        <span className="text-3xl">📊</span>
        <span>{t?.noSentimentData || 'No sentiment data available.'}</span>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={52}
          outerRadius={78}
          paddingAngle={3}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
        >
          {data.map(entry => (
            <Cell key={entry.name} fill={COLORS[entry.name] || '#e91e8c'} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={value => (
            <span style={{ fontSize: '12px', color: '#4b5563' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
