import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch, Plus, Edit3, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const defaultScenarios = [
  {
    id: 1, name: 'Base Case', color: '#6366f1', description: 'Current trajectory with moderate growth assumptions',
    drivers: { revenueGrowth: 25, churnRate: 3.5, newHires: 18, burnMultiple: 1.2, grossMargin: 72 },
    metrics: { arr: 2400000, runway: 24, ebitda: -180000, headcount: 77, cashBalance: 4500000 },
  },
  {
    id: 2, name: 'Best Case', color: '#22c55e', description: 'Aggressive growth with strong market tailwinds',
    drivers: { revenueGrowth: 45, churnRate: 2.0, newHires: 28, burnMultiple: 0.8, grossMargin: 78 },
    metrics: { arr: 3480000, runway: 30, ebitda: 120000, headcount: 87, cashBalance: 5800000 },
  },
  {
    id: 3, name: 'Worst Case', color: '#ef4444', description: 'Economic downturn with reduced demand',
    drivers: { revenueGrowth: 8, churnRate: 6.0, newHires: 5, burnMultiple: 2.5, grossMargin: 64 },
    metrics: { arr: 1560000, runway: 14, ebitda: -520000, headcount: 64, cashBalance: 2100000 },
  },
  {
    id: 4, name: 'Conservative', color: '#f59e0b', description: 'Focus on profitability over growth',
    drivers: { revenueGrowth: 15, churnRate: 3.0, newHires: 8, burnMultiple: 1.0, grossMargin: 75 },
    metrics: { arr: 1920000, runway: 36, ebitda: 50000, headcount: 67, cashBalance: 5200000 },
  },
];

const metricLabels = {
  arr: { label: 'ARR', format: v => `$${(v / 1000000).toFixed(1)}M` },
  runway: { label: 'Runway (mo)', format: v => `${v}` },
  ebitda: { label: 'EBITDA', format: v => `$${(v / 1000).toFixed(0)}k` },
  headcount: { label: 'Headcount', format: v => `${v}` },
  cashBalance: { label: 'Cash Balance', format: v => `$${(v / 1000000).toFixed(1)}M` },
};

export default function ScenariosPage() {
  const navigate = useNavigate();
  const [scenarios] = useState(defaultScenarios);
  const [selected, setSelected] = useState([1, 2, 3]);

  const comparisonData = Object.keys(metricLabels).map(key => {
    const row = { metric: metricLabels[key].label };
    scenarios.filter(s => selected.includes(s.id)).forEach(s => {
      row[s.name] = s.metrics[key];
    });
    return row;
  });

  const chartData = ['ARR', 'Cash Balance', 'EBITDA'].map(label => {
    const key = label === 'ARR' ? 'arr' : label === 'Cash Balance' ? 'cashBalance' : 'ebitda';
    const row = { metric: label };
    scenarios.filter(s => selected.includes(s.id)).forEach(s => {
      row[s.name] = s.metrics[key];
    });
    return row;
  });

  const toggleScenario = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500/20 to-purple-600/10 rounded-xl">
              <GitBranch className="w-6 h-6 text-violet-400" />
            </div>
            Scenario Analysis
          </h1>
          <p className="text-text-muted mt-1 text-sm">Compare financial outcomes across different assumptions</p>
        </div>
        <button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-purple-900/25">
          <Plus className="w-4 h-4" /> New Scenario
        </button>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map(s => (
          <div key={s.id}
            onClick={() => toggleScenario(s.id)}
            className={`bg-white border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
              selected.includes(s.id) ? 'border-accent/40 shadow-md' : 'border-gray-200 opacity-60 hover:opacity-80'
            }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <h3 className="text-sm font-semibold text-text-primary">{s.name}</h3>
              {selected.includes(s.id) && <span className="ml-auto text-[10px] bg-accent/10 text-accent-light px-2 py-0.5 rounded-full font-medium">Active</span>}
            </div>
            <p className="text-xs text-text-muted mb-3">{s.description}</p>
            <div className="space-y-1.5">
              {Object.entries(s.drivers).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-text-muted capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-medium text-text-primary">{k.includes('Rate') || k.includes('Growth') || k.includes('Margin') ? `${v}%` : v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent-light" /> Side-by-Side Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000000 ? `$${(v/1000000).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}k` : v} />
            <YAxis type="category" dataKey="metric" tick={{ fontSize: 12 }} width={100} />
            <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
            <Legend />
            {scenarios.filter(s => selected.includes(s.id)).map(s => (
              <Bar key={s.id} dataKey={s.name} fill={s.color} radius={[0, 4, 4, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Metric</th>
                {scenarios.filter(s => selected.includes(s.id)).map(s => (
                  <th key={s.id} className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: s.color }}>{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(metricLabels).map(([key, { label, format }]) => (
                <tr key={key} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-text-primary">{label}</td>
                  {scenarios.filter(s => selected.includes(s.id)).map(s => (
                    <td key={s.id} className="px-4 py-3 text-right font-semibold text-text-primary">{format(s.metrics[key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
