import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WordAttentionChart = ({ wordScores, variant = 'hoaks' }) => {
  const chartData = useMemo(() => {
    if (!wordScores) return [];
    return Object.entries(wordScores)
      .map(([word, score]) => ({ word, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [wordScores]);

  if (chartData.length === 0) return null;

  const barColor = variant === 'hoaks' ? '#DC2626' : '#16A34A';

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="word" 
            type="category" 
            width={80} 
            tick={{ fontSize: 11, fontWeight: 600, fill: '#4B5563' }}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#1E293B] text-white px-3 py-1.5 rounded shadow-lg text-[10px] font-bold uppercase tracking-wider">
                    Score: {(payload[0].value * 100).toFixed(1)}%
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="score" 
            fill={barColor} 
            radius={[0, 4, 4, 0]} 
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WordAttentionChart;
