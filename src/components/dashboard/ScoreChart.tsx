import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

export interface ChartData {
  name: string;
  score: number;
  isPlaceholder?: boolean;
}

interface ScoreChartProps {
  data: ChartData[];
  title: string;
}

const CustomLabel = (props: any) => {
  const { x, y, width, value, index, data } = props;
  const isPlaceholder = data && data[index] && data[index].isPlaceholder;
  
  if (isPlaceholder) {
    return (
      <g>
        <rect x={x + width / 2 - 45} y={y - 25} width="90" height="20" rx="10" fill="white" stroke="#E5E7EB" />
        <text x={x + width / 2} y={y - 11} fill="#6B7280" textAnchor="middle" fontSize={10} fontWeight="bold" className="uppercase tracking-wider">
          Coming Soon
        </text>
      </g>
    );
  }
  
  if (value > 0) {
    return (
      <text x={x + width / 2} y={y - 10} fill="#111827" textAnchor="middle" fontSize={12} fontWeight="bold" className="font-heading">
        {value}%
      </text>
    );
  }
  
  return null;
};

export function ScoreChart({ data, title }: ScoreChartProps) {
  return (
    <div className="card p-6 mb-6">
      <h2 className="section-title mb-6">{title}</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              domain={[0, 100]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: 12 }} 
            />
            <Tooltip 
              cursor={{ fill: '#F3F4F6' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  if (data.isPlaceholder) return null;
                  return (
                    <div className="bg-black text-white px-3 py-2 rounded shadow-lg text-sm font-bold font-heading">
                      {data.name}: {data.score}%
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={80}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isPlaceholder ? '#F3F4F6' : '#E00000'} />
              ))}
              <LabelList dataKey="score" content={(props: any) => <CustomLabel {...props} data={data} />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
