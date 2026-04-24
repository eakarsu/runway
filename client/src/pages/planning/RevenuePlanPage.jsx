import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, TrendingUp, Save } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const defaultDrivers = {
  startingMRR: 50000,
  newCustomers: 15,
  arpu: 250,
  monthlyChurn: 3.5,
  expansionRate: 2.0,
};

export default function RevenuePlanPage() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState(defaultDrivers);
  const [year] = useState(2025);

  const tableData = useMemo(() => {
    const rows = [];
    let mrr = drivers.startingMRR;
    for (let i = 0; i < 12; i++) {
      const newMRR = drivers.newCustomers * drivers.arpu;
      const churnedMRR = Math.round(mrr * (drivers.monthlyChurn / 100));
      const expansionMRR = Math.round(mrr * (drivers.expansionRate / 100));
      mrr = mrr + newMRR - churnedMRR + expansionMRR;
      rows.push({
        month: MONTHS[i],
        newMRR,
        churnedMRR: -churnedMRR,
        expansionMRR,
        totalMRR: mrr,
        arr: mrr * 12,
      });
    }
    return rows;
  }, [drivers]);

  const updateDriver = (key, val) => setDrivers(d => ({ ...d, [key]: Number(val) || 0 }));

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-600/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            Revenue Plan — {year}
          </h1>
          <p className="text-text-muted mt-1 text-sm">Model your recurring revenue growth</p>
        </div>
        <button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-purple-900/25">
          <Save className="w-4 h-4" /> Save Plan
        </button>
      </div>

      {/* Driver Inputs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { key: 'startingMRR', label: 'Starting MRR', prefix: '$' },
          { key: 'newCustomers', label: 'New Customers/mo', prefix: '' },
          { key: 'arpu', label: 'ARPU', prefix: '$' },
          { key: 'monthlyChurn', label: 'Monthly Churn %', prefix: '' },
          { key: 'expansionRate', label: 'Expansion Rate %', prefix: '' },
        ].map(d => (
          <div key={d.key} className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="text-[11px] font-medium text-text-muted uppercase tracking-wide">{d.label}</label>
            <div className="flex items-center gap-1 mt-1.5">
              {d.prefix && <span className="text-text-muted text-sm">{d.prefix}</span>}
              <input
                type="number"
                value={drivers[d.key]}
                onChange={e => updateDriver(d.key, e.target.value)}
                className="w-full bg-transparent text-lg font-semibold text-text-primary focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* MRR Growth Chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" /> MRR Growth Trajectory
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={tableData}>
            <defs>
              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={v => [`$${Number(v).toLocaleString()}`, '']} />
            <Area type="monotone" dataKey="totalMRR" stroke="#22c55e" fill="url(#mrrGrad)" strokeWidth={2} name="Total MRR" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* MRR Breakdown Bar Chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Monthly MRR Components</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={tableData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={v => [`$${Number(v).toLocaleString()}`, '']} />
            <Legend />
            <Bar dataKey="newMRR" fill="#22c55e" name="New MRR" radius={[2, 2, 0, 0]} />
            <Bar dataKey="expansionMRR" fill="#3b82f6" name="Expansion" radius={[2, 2, 0, 0]} />
            <Bar dataKey="churnedMRR" fill="#ef4444" name="Churned" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Month</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">New MRR</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Churned</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Expansion</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">Total MRR</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted text-xs uppercase tracking-wide">ARR</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-text-primary">{row.month}</td>
                  <td className="px-4 py-3 text-right text-green-600">${row.newMRR.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-red-500">${row.churnedMRR.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-blue-600">${row.expansionMRR.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold text-text-primary">${row.totalMRR.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-semibold text-accent-light">${row.arr.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
