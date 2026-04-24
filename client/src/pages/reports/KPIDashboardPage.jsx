import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PieChart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const kpis = [
  { key: 'mrr', label: 'MRR', value: 186500, target: 200000, prev: 172000, format: '$', unit: '', sparkline: [145000,152000,158000,162000,168000,172000,178000,182000,186500] },
  { key: 'arr', label: 'ARR', value: 2238000, target: 2400000, prev: 2064000, format: '$', unit: '', sparkline: [1740000,1824000,1896000,1944000,2016000,2064000,2136000,2184000,2238000] },
  { key: 'churn', label: 'Monthly Churn', value: 3.2, target: 3.0, prev: 3.5, format: '', unit: '%', sparkline: [4.2,4.0,3.8,3.7,3.6,3.5,3.4,3.3,3.2], lowerBetter: true },
  { key: 'cac', label: 'CAC', value: 2450, target: 2000, prev: 2800, format: '$', unit: '', sparkline: [3200,3100,2900,2850,2800,2700,2600,2500,2450], lowerBetter: true },
  { key: 'ltv', label: 'LTV', value: 28500, target: 30000, prev: 26000, format: '$', unit: '', sparkline: [22000,23000,24000,24500,25000,26000,27000,28000,28500] },
  { key: 'ltvCac', label: 'LTV:CAC', value: 11.6, target: 12.0, prev: 9.3, format: '', unit: 'x', sparkline: [6.9,7.4,8.3,8.6,8.9,9.3,10.4,11.2,11.6] },
  { key: 'burnRate', label: 'Monthly Burn', value: 285000, target: 250000, prev: 310000, format: '$', unit: '', sparkline: [340000,335000,330000,325000,320000,310000,300000,290000,285000], lowerBetter: true },
  { key: 'runway', label: 'Runway', value: 24, target: 24, prev: 20, format: '', unit: ' months', sparkline: [16,17,18,18,19,20,21,22,24] },
  { key: 'grossMargin', label: 'Gross Margin', value: 72.5, target: 75.0, prev: 70.0, format: '', unit: '%', sparkline: [68,68.5,69,69.5,70,70,71,72,72.5] },
  { key: 'nrr', label: 'Net Revenue Retention', value: 112, target: 115, prev: 108, format: '', unit: '%', sparkline: [104,105,106,107,108,109,110,111,112] },
  { key: 'rule40', label: 'Rule of 40', value: 47, target: 40, prev: 42, format: '', unit: '%', sparkline: [35,36,38,39,40,42,43,45,47] },
  { key: 'magicNum', label: 'Magic Number', value: 0.85, target: 1.0, prev: 0.72, format: '', unit: '', sparkline: [0.5,0.55,0.6,0.65,0.68,0.72,0.78,0.82,0.85] },
];

const formatValue = (val, format, unit) => {
  if (format === '$') {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toLocaleString()}`;
  }
  return `${val.toLocaleString()}${unit}`;
};

export default function KPIDashboardPage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('MTD');

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-pink-500/20 to-rose-600/10 rounded-xl">
              <PieChart className="w-6 h-6 text-pink-400" />
            </div>
            KPI Dashboard
          </h1>
          <p className="text-text-muted mt-1 text-sm">Real-time SaaS metrics at a glance</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {['MTD', 'QTD', 'YTD'].map(range => (
            <button key={range} onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                timeRange === range ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted hover:text-text-primary'
              }`}>
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpis.map(kpi => {
          const change = kpi.prev ? ((kpi.value - kpi.prev) / kpi.prev * 100).toFixed(1) : 0;
          const isPositive = kpi.lowerBetter ? Number(change) < 0 : Number(change) > 0;
          const atTarget = kpi.lowerBetter ? kpi.value <= kpi.target : kpi.value >= kpi.target;
          const sparkData = kpi.sparkline.map((v, i) => ({ v, i }));

          return (
            <div key={kpi.key} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-2">
                <span className="text-[11px] font-medium text-text-muted uppercase tracking-wide">{kpi.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${atTarget ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  {atTarget ? 'On Track' : 'Behind'}
                </span>
              </div>
              <div className="flex items-end justify-between mb-3">
                <span className="text-2xl font-bold text-text-primary">{formatValue(kpi.value, kpi.format, kpi.unit)}</span>
                <div className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-600' : Number(change) === 0 ? 'text-text-muted' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : Number(change) === 0 ? <Minus className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(Number(change))}%
                </div>
              </div>
              <div className="h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData}>
                    <defs>
                      <linearGradient id={`spark-${kpi.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={isPositive ? '#22c55e' : '#ef4444'} fill={`url(#spark-${kpi.key})`} strokeWidth={1.5} dot={false} />
                    <Tooltip content={() => null} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>Target: {formatValue(kpi.target, kpi.format, kpi.unit)}</span>
                <span>Prev: {formatValue(kpi.prev, kpi.format, kpi.unit)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
