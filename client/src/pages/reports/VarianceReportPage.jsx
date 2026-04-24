import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, AlertTriangle, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

const varianceData = [
  { category: 'Revenue', budget: 186000, actual: 192500, notes: 'Strong enterprise upsells' },
  { category: 'COGS', budget: 52000, actual: 54200, notes: 'Higher cloud costs due to scaling' },
  { category: 'Engineering', budget: 320000, actual: 315000, notes: 'Open req from Q1 still unfilled' },
  { category: 'Sales & Marketing', budget: 145000, actual: 162000, notes: 'Additional ad spend for product launch' },
  { category: 'G&A', budget: 65000, actual: 63500, notes: 'Under budget on office expenses' },
  { category: 'R&D', budget: 85000, actual: 88000, notes: 'New tooling investment' },
  { category: 'Customer Success', budget: 72000, actual: 70500, notes: 'Slightly under due to timing' },
  { category: 'Other OpEx', budget: 25000, actual: 28000, notes: 'Legal fees for new contract' },
];

const aiInsights = [
  { type: 'warning', text: 'Sales & Marketing spend is 11.7% over budget. The overage is primarily driven by $12k in incremental paid acquisition for the March product launch.' },
  { type: 'info', text: 'Revenue is tracking 3.5% above plan, driven by 2 enterprise deals closing ahead of schedule. Consider revising Q2 forecast upward.' },
  { type: 'warning', text: 'COGS is 4.2% over budget. Cloud infrastructure costs increased due to traffic growth. Consider reserved instance commitments to reduce unit costs.' },
  { type: 'info', text: 'Engineering is 1.6% under budget due to an unfilled senior role. If filled in April, expect to be at or slightly above budget by EOQ.' },
];

export default function VarianceReportPage() {
  const navigate = useNavigate();
  const [expandedRow, setExpandedRow] = useState(null);

  const totalBudget = varianceData.reduce((a, d) => a + d.budget, 0);
  const totalActual = varianceData.reduce((a, d) => a + d.actual, 0);
  const totalVariance = totalBudget - totalActual;

  const chartData = varianceData.map(d => ({
    ...d,
    variance: d.budget - d.actual,
    variancePct: ((d.budget - d.actual) / d.budget * 100).toFixed(1),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/exports')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Reports
      </button>

      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-600/10 rounded-xl">
            <BarChart3 className="w-6 h-6 text-amber-400" />
          </div>
          Variance Analysis — March 2025
        </h1>
        <p className="text-text-muted mt-1 text-sm">Budget vs Actual with AI-powered insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget', value: `$${(totalBudget / 1000).toFixed(0)}k`, color: 'text-text-primary' },
          { label: 'Total Actual', value: `$${(totalActual / 1000).toFixed(0)}k`, color: 'text-blue-500' },
          { label: 'Total Variance', value: `$${(totalVariance / 1000).toFixed(1)}k`, color: totalVariance >= 0 ? 'text-green-500' : 'text-red-500' },
          { label: 'Variance %', value: `${((totalVariance / totalBudget) * 100).toFixed(1)}%`, color: totalVariance >= 0 ? 'text-green-500' : 'text-red-500' },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart + Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Budget vs Actual by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="budget" fill="#94a3b8" name="Budget" radius={[2, 2, 0, 0]} />
                <Bar dataKey="actual" fill="#8b5cf6" name="Actual" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Category</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Budget</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Actual</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Variance</th>
                  <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Var %</th>
                </tr>
              </thead>
              <tbody>
                {varianceData.map((d, i) => {
                  const v = d.budget - d.actual;
                  const vp = ((v / d.budget) * 100).toFixed(1);
                  return (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                      <td className="px-4 py-3 font-medium text-text-primary">{d.category}</td>
                      <td className="px-4 py-3 text-right text-text-primary">${d.budget.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-text-primary">${d.actual.toLocaleString()}</td>
                      <td className={`px-4 py-3 text-right font-medium ${v >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {v >= 0 ? '' : '-'}${Math.abs(v).toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right ${Number(vp) >= 0 ? 'text-green-600' : 'text-red-500'}`}>{vp}%</td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-bold">
                  <td className="px-4 py-3 text-text-primary">Total</td>
                  <td className="px-4 py-3 text-right text-text-primary">${totalBudget.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-text-primary">${totalActual.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right ${totalVariance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {totalVariance >= 0 ? '' : '-'}${Math.abs(totalVariance).toLocaleString()}
                  </td>
                  <td className={`px-4 py-3 text-right ${totalVariance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {((totalVariance / totalBudget) * 100).toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" /> AI Insights
            </h3>
            <div className="space-y-3">
              {aiInsights.map((insight, i) => (
                <div key={i} className={`p-3 rounded-xl text-xs leading-relaxed ${
                  insight.type === 'warning' ? 'bg-amber-50 border border-amber-100 text-amber-800' : 'bg-blue-50 border border-blue-100 text-blue-800'
                }`}>
                  <div className="flex items-start gap-2">
                    {insight.type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> : <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                    <span>{insight.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
