import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Save } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const defaultCategories = [
  { name: 'Cloud & Infrastructure', budget: [42000,42000,44000,44000,46000,46000,48000,48000,50000,50000,52000,52000], actual: [41200,43500,43800,45200,44800,47100,47500,49200,0,0,0,0] },
  { name: 'Software & Tools', budget: [18000,18000,18000,20000,20000,20000,22000,22000,22000,24000,24000,24000], actual: [17800,18200,19500,19800,21000,20500,21800,22100,0,0,0,0] },
  { name: 'Marketing', budget: [35000,35000,40000,40000,45000,45000,50000,50000,55000,55000,60000,60000], actual: [34500,36200,42000,38500,47500,44000,52000,48500,0,0,0,0] },
  { name: 'Office & Facilities', budget: [15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000,15000], actual: [14800,15100,14900,15200,15000,14700,15300,15100,0,0,0,0] },
  { name: 'Travel & Events', budget: [8000,8000,12000,8000,8000,15000,8000,8000,12000,8000,8000,15000], actual: [7500,9200,11800,8500,7200,16500,9000,7800,0,0,0,0] },
  { name: 'Professional Services', budget: [25000,25000,25000,30000,30000,30000,35000,35000,35000,40000,40000,40000], actual: [24000,26500,24800,31000,29500,32000,34000,36200,0,0,0,0] },
];

export default function ExpensePlanPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(defaultCategories);
  const [viewMonth, setViewMonth] = useState(7); // Aug (0-indexed)

  const updateBudget = (catIdx, monthIdx, val) => {
    setCategories(cats => cats.map((c, i) => {
      if (i !== catIdx) return c;
      const budget = [...c.budget];
      budget[monthIdx] = Number(val) || 0;
      return { ...c, budget };
    }));
  };

  const summaryData = useMemo(() => {
    const totalBudget = categories.reduce((acc, c) => acc + c.budget.reduce((a, b) => a + b, 0), 0);
    const totalActual = categories.reduce((acc, c) => acc + c.actual.reduce((a, b) => a + b, 0), 0);
    const variance = totalBudget - totalActual;
    return { totalBudget, totalActual, variance, variancePct: totalBudget ? ((variance / totalBudget) * 100).toFixed(1) : 0 };
  }, [categories]);

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    Budget: categories.reduce((a, c) => a + c.budget[i], 0),
    Actual: categories.reduce((a, c) => a + c.actual[i], 0),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500/20 to-amber-600/10 rounded-xl">
              <CreditCard className="w-6 h-6 text-orange-400" />
            </div>
            Expense Plan — 2025
          </h1>
          <p className="text-text-muted mt-1 text-sm">Track budget vs actual by category</p>
        </div>
        <button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-purple-900/25">
          <Save className="w-4 h-4" /> Save Plan
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget', value: `$${(summaryData.totalBudget / 1000).toFixed(0)}k`, color: 'text-text-primary' },
          { label: 'Total Actual', value: `$${(summaryData.totalActual / 1000).toFixed(0)}k`, color: 'text-blue-500' },
          { label: 'Variance', value: `$${(summaryData.variance / 1000).toFixed(0)}k`, color: summaryData.variance >= 0 ? 'text-green-500' : 'text-red-500' },
          { label: 'Variance %', value: `${summaryData.variancePct}%`, color: summaryData.variance >= 0 ? 'text-green-500' : 'text-red-500' },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Budget vs Actual Chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Budget vs Actual — Monthly</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
            <Legend />
            <Bar dataKey="Budget" fill="#94a3b8" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Actual" fill="#f59e0b" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Detail Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <span className="text-sm font-medium text-text-muted">Viewing month:</span>
          <select value={viewMonth} onChange={e => setViewMonth(Number(e.target.value))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent/30">
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Category</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Budget</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Actual</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Variance</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Var %</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">YTD Budget</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">YTD Actual</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, i) => {
                const bud = c.budget[viewMonth];
                const act = c.actual[viewMonth];
                const vari = bud - act;
                const varPct = bud ? ((vari / bud) * 100).toFixed(1) : '0.0';
                const ytdBud = c.budget.slice(0, viewMonth + 1).reduce((a, b) => a + b, 0);
                const ytdAct = c.actual.slice(0, viewMonth + 1).reduce((a, b) => a + b, 0);
                return (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-text-primary">{c.name}</td>
                    <td className="px-4 py-2 text-right">
                      <input type="number" value={bud} onChange={e => updateBudget(i, viewMonth, e.target.value)}
                        className="w-20 text-right bg-transparent border-b border-transparent hover:border-gray-300 focus:border-accent focus:outline-none py-1 text-text-primary" />
                    </td>
                    <td className="px-4 py-3 text-right text-text-primary">${act.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-medium ${vari >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      ${vari.toLocaleString()}
                    </td>
                    <td className={`px-4 py-3 text-right ${Number(varPct) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {varPct}%
                    </td>
                    <td className="px-4 py-3 text-right text-text-muted">${ytdBud.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-text-muted">${ytdAct.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
