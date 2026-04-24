import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Save } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];

const defaultDepts = [
  { name: 'Engineering', current: 24, q1Hires: 4, q2Hires: 6, q3Hires: 5, q4Hires: 3, avgSalary: 165000 },
  { name: 'Sales', current: 12, q1Hires: 3, q2Hires: 4, q3Hires: 3, q4Hires: 2, avgSalary: 120000 },
  { name: 'Marketing', current: 8, q1Hires: 2, q2Hires: 2, q3Hires: 1, q4Hires: 1, avgSalary: 110000 },
  { name: 'Product', current: 6, q1Hires: 1, q2Hires: 2, q3Hires: 1, q4Hires: 1, avgSalary: 155000 },
  { name: 'Operations', current: 5, q1Hires: 1, q2Hires: 1, q3Hires: 1, q4Hires: 0, avgSalary: 95000 },
  { name: 'Finance', current: 4, q1Hires: 1, q2Hires: 0, q3Hires: 1, q4Hires: 0, avgSalary: 130000 },
];

export default function HeadcountPlanPage() {
  const navigate = useNavigate();
  const [depts, setDepts] = useState(defaultDepts);

  const updateDept = (idx, field, val) => {
    setDepts(d => d.map((dept, i) => i === idx ? { ...dept, [field]: Number(val) || 0 } : dept));
  };

  const totals = useMemo(() => {
    return depts.reduce((acc, d) => ({
      current: acc.current + d.current,
      q1: acc.q1 + d.q1Hires,
      q2: acc.q2 + d.q2Hires,
      q3: acc.q3 + d.q3Hires,
      q4: acc.q4 + d.q4Hires,
      eoy: acc.eoy + d.current + d.q1Hires + d.q2Hires + d.q3Hires + d.q4Hires,
      totalCost: acc.totalCost + (d.current + d.q1Hires + d.q2Hires + d.q3Hires + d.q4Hires) * d.avgSalary,
    }), { current: 0, q1: 0, q2: 0, q3: 0, q4: 0, eoy: 0, totalCost: 0 });
  }, [depts]);

  const barData = depts.map(d => ({
    name: d.name,
    Current: d.current,
    'New Hires': d.q1Hires + d.q2Hires + d.q3Hires + d.q4Hires,
    'EOY Total': d.current + d.q1Hires + d.q2Hires + d.q3Hires + d.q4Hires,
  }));

  const pieData = depts.map(d => ({
    name: d.name,
    value: (d.current + d.q1Hires + d.q2Hires + d.q3Hires + d.q4Hires) * d.avgSalary,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-600/10 rounded-xl">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            Headcount Plan — 2025
          </h1>
          <p className="text-text-muted mt-1 text-sm">Plan your team growth across departments</p>
        </div>
        <button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-purple-900/25">
          <Save className="w-4 h-4" /> Save Plan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Headcount', value: totals.current, color: 'text-text-primary' },
          { label: 'Total New Hires', value: totals.q1 + totals.q2 + totals.q3 + totals.q4, color: 'text-green-500' },
          { label: 'EOY Headcount', value: totals.eoy, color: 'text-blue-500' },
          { label: 'Total Payroll Cost', value: `$${(totals.totalCost / 1000000).toFixed(1)}M`, color: 'text-accent-light' },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Headcount by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Current" fill="#94a3b8" radius={[2, 2, 0, 0]} />
              <Bar dataKey="New Hires" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Cost Breakdown by Department</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `$${(Number(v) / 1000000).toFixed(2)}M`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Editable Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Department</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Current</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Q1 Hires</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Q2 Hires</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Q3 Hires</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Q4 Hires</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">EOY Total</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Avg Salary</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {depts.map((d, i) => {
                const eoy = d.current + d.q1Hires + d.q2Hires + d.q3Hires + d.q4Hires;
                return (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-text-primary">{d.name}</td>
                    <td className="px-4 py-2 text-right">
                      <input type="number" value={d.current} onChange={e => updateDept(i, 'current', e.target.value)}
                        className="w-16 text-right bg-transparent border-b border-transparent hover:border-gray-300 focus:border-accent focus:outline-none py-1 text-text-primary" />
                    </td>
                    {['q1Hires','q2Hires','q3Hires','q4Hires'].map(q => (
                      <td key={q} className="px-4 py-2 text-right">
                        <input type="number" value={d[q]} onChange={e => updateDept(i, q, e.target.value)}
                          className="w-14 text-right bg-transparent border-b border-transparent hover:border-gray-300 focus:border-accent focus:outline-none py-1 text-green-600" />
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right font-semibold text-text-primary">{eoy}</td>
                    <td className="px-4 py-2 text-right">
                      <input type="number" value={d.avgSalary} onChange={e => updateDept(i, 'avgSalary', e.target.value)}
                        className="w-24 text-right bg-transparent border-b border-transparent hover:border-gray-300 focus:border-accent focus:outline-none py-1 text-text-primary" />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-accent-light">${(eoy * d.avgSalary / 1000000).toFixed(2)}M</td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-bold">
                <td className="px-4 py-3 text-text-primary">Total</td>
                <td className="px-4 py-3 text-right text-text-primary">{totals.current}</td>
                <td className="px-4 py-3 text-right text-green-600">{totals.q1}</td>
                <td className="px-4 py-3 text-right text-green-600">{totals.q2}</td>
                <td className="px-4 py-3 text-right text-green-600">{totals.q3}</td>
                <td className="px-4 py-3 text-right text-green-600">{totals.q4}</td>
                <td className="px-4 py-3 text-right text-text-primary">{totals.eoy}</td>
                <td className="px-4 py-3 text-right text-text-muted">—</td>
                <td className="px-4 py-3 text-right text-accent-light">${(totals.totalCost / 1000000).toFixed(1)}M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
