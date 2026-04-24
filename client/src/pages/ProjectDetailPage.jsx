import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Settings, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const defaultDrivers = {
  revenueGrowthRate: 8,
  cogsPercent: 28,
  engineeringBase: 320000,
  engineeringGrowth: 2,
  salesBase: 145000,
  salesGrowth: 5,
  marketingBase: 85000,
  marketingGrowth: 3,
  gaBase: 65000,
  gaGrowth: 1,
  rdBase: 85000,
  rdGrowth: 4,
  startingRevenue: 186000,
  taxRate: 25,
};

const driverMeta = [
  { key: 'startingRevenue', label: 'Starting Monthly Revenue', prefix: '$', group: 'Revenue' },
  { key: 'revenueGrowthRate', label: 'Monthly Revenue Growth', suffix: '%', group: 'Revenue' },
  { key: 'cogsPercent', label: 'COGS as % of Revenue', suffix: '%', group: 'Revenue' },
  { key: 'engineeringBase', label: 'Engineering (Monthly)', prefix: '$', group: 'Operating Expenses' },
  { key: 'engineeringGrowth', label: 'Eng Growth/mo', suffix: '%', group: 'Operating Expenses' },
  { key: 'salesBase', label: 'Sales & Marketing (Monthly)', prefix: '$', group: 'Operating Expenses' },
  { key: 'salesGrowth', label: 'S&M Growth/mo', suffix: '%', group: 'Operating Expenses' },
  { key: 'marketingBase', label: 'Marketing (Monthly)', prefix: '$', group: 'Operating Expenses' },
  { key: 'marketingGrowth', label: 'Mktg Growth/mo', suffix: '%', group: 'Operating Expenses' },
  { key: 'gaBase', label: 'G&A (Monthly)', prefix: '$', group: 'Operating Expenses' },
  { key: 'gaGrowth', label: 'G&A Growth/mo', suffix: '%', group: 'Operating Expenses' },
  { key: 'rdBase', label: 'R&D (Monthly)', prefix: '$', group: 'Operating Expenses' },
  { key: 'rdGrowth', label: 'R&D Growth/mo', suffix: '%', group: 'Operating Expenses' },
  { key: 'taxRate', label: 'Tax Rate', suffix: '%', group: 'Other' },
];

function grow(base, rate, month) {
  return Math.round(base * Math.pow(1 + rate / 100, month));
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState(defaultDrivers);
  const [showDrivers, setShowDrivers] = useState(true);

  const updateDriver = (key, val) => setDrivers(d => ({ ...d, [key]: Number(val) || 0 }));

  const pnlData = useMemo(() => {
    return MONTHS.map((month, i) => {
      const revenue = grow(drivers.startingRevenue, drivers.revenueGrowthRate, i);
      const cogs = Math.round(revenue * drivers.cogsPercent / 100);
      const grossProfit = revenue - cogs;

      const engineering = grow(drivers.engineeringBase, drivers.engineeringGrowth, i);
      const sales = grow(drivers.salesBase, drivers.salesGrowth, i);
      const marketing = grow(drivers.marketingBase, drivers.marketingGrowth, i);
      const ga = grow(drivers.gaBase, drivers.gaGrowth, i);
      const rd = grow(drivers.rdBase, drivers.rdGrowth, i);
      const totalOpex = engineering + sales + marketing + ga + rd;

      const ebitda = grossProfit - totalOpex;
      const taxes = ebitda > 0 ? Math.round(ebitda * drivers.taxRate / 100) : 0;
      const netIncome = ebitda - taxes;

      return { month, revenue, cogs, grossProfit, engineering, sales, marketing, ga, rd, totalOpex, ebitda, taxes, netIncome };
    });
  }, [drivers]);

  const fmtK = v => v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;
  const annualRevenue = pnlData.reduce((a, r) => a + r.revenue, 0);
  const annualNetIncome = pnlData.reduce((a, r) => a + r.netIncome, 0);
  const annualEBITDA = pnlData.reduce((a, r) => a + r.ebitda, 0);

  const groups = {};
  driverMeta.forEach(d => { if (!groups[d.group]) groups[d.group] = []; groups[d.group].push(d); });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Models
        </button>
        <div className="flex gap-2">
          <button onClick={() => setShowDrivers(!showDrivers)} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${showDrivers ? 'bg-accent/10 border-accent/30 text-accent-light' : 'border-gray-200 text-text-muted hover:border-gray-300'}`}>
            <Settings className="w-3.5 h-3.5 inline mr-1.5" />{showDrivers ? 'Hide' : 'Show'} Drivers
          </button>
          <button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-purple-900/25">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-600/10 rounded-xl">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          P&L Model Builder
        </h1>
        <p className="text-text-muted mt-1 text-sm">Driver-based income statement projection</p>
      </div>

      {/* Annual Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Annual Revenue', value: fmtK(annualRevenue), color: 'text-green-600' },
          { label: 'Annual EBITDA', value: fmtK(annualEBITDA), color: annualEBITDA >= 0 ? 'text-blue-600' : 'text-red-500' },
          { label: 'Net Income', value: fmtK(annualNetIncome), color: annualNetIncome >= 0 ? 'text-accent-light' : 'text-red-500' },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{c.label}</p>
            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className={`grid gap-6 ${showDrivers ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'}`}>
        {/* Drivers Panel */}
        {showDrivers && (
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Assumptions & Drivers</h3>
            {Object.entries(groups).map(([group, items]) => (
              <div key={group} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{group}</h4>
                {items.map(d => (
                  <div key={d.key}>
                    <label className="text-[11px] text-text-muted">{d.label}</label>
                    <div className="flex items-center gap-1 mt-0.5">
                      {d.prefix && <span className="text-xs text-text-muted">{d.prefix}</span>}
                      <input type="number" value={drivers[d.key]} onChange={e => updateDriver(d.key, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20" />
                      {d.suffix && <span className="text-xs text-text-muted">{d.suffix}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className={`${showDrivers ? 'lg:col-span-3' : ''} space-y-6`}>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Revenue vs Expenses</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={pnlData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                  <Area type="monotone" dataKey="totalOpex" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="4 4" name="Total OpEx" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">OpEx Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={pnlData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="engineering" stackId="a" fill="#8b5cf6" name="Eng" />
                  <Bar dataKey="sales" stackId="a" fill="#3b82f6" name="Sales" />
                  <Bar dataKey="marketing" stackId="a" fill="#f59e0b" name="Mktg" />
                  <Bar dataKey="ga" stackId="a" fill="#94a3b8" name="G&A" />
                  <Bar dataKey="rd" stackId="a" fill="#22c55e" name="R&D" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* P&L Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-text-primary">Income Statement — Monthly</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 py-2.5 font-bold text-text-muted uppercase tracking-wide sticky left-0 bg-gray-50 min-w-[160px]">Line Item</th>
                    {MONTHS.map(m => <th key={m} className="text-right px-3 py-2.5 font-bold text-text-muted uppercase tracking-wide min-w-[90px]">{m}</th>)}
                    <th className="text-right px-3 py-2.5 font-bold text-accent-light uppercase tracking-wide min-w-[100px]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Revenue', key: 'revenue', bold: true, color: 'text-green-700' },
                    { label: 'COGS', key: 'cogs', indent: true },
                    { label: 'Gross Profit', key: 'grossProfit', bold: true, border: true },
                    { label: 'Engineering', key: 'engineering', indent: true },
                    { label: 'Sales', key: 'sales', indent: true },
                    { label: 'Marketing', key: 'marketing', indent: true },
                    { label: 'G&A', key: 'ga', indent: true },
                    { label: 'R&D', key: 'rd', indent: true },
                    { label: 'Total OpEx', key: 'totalOpex', bold: true, border: true },
                    { label: 'EBITDA', key: 'ebitda', bold: true, border: true, highlight: true },
                    { label: 'Taxes', key: 'taxes', indent: true },
                    { label: 'Net Income', key: 'netIncome', bold: true, border: true, highlight: true },
                  ].map(row => {
                    const total = pnlData.reduce((a, r) => a + r[row.key], 0);
                    return (
                      <tr key={row.key} className={`${row.border ? 'border-t border-gray-200' : 'border-b border-gray-50'} ${row.highlight ? 'bg-gray-50/50' : ''} hover:bg-gray-50/80`}>
                        <td className={`px-3 py-2 sticky left-0 bg-white ${row.bold ? 'font-bold' : ''} ${row.indent ? 'pl-6 text-text-muted' : 'text-text-primary'} ${row.color || ''}`}>
                          {row.label}
                        </td>
                        {pnlData.map((r, i) => {
                          const val = r[row.key];
                          return (
                            <td key={i} className={`px-3 py-2 text-right tabular-nums ${row.bold ? 'font-bold' : ''} ${val < 0 ? 'text-red-500' : 'text-text-primary'}`}>
                              {val < 0 ? `-$${Math.abs(val).toLocaleString()}` : `$${val.toLocaleString()}`}
                            </td>
                          );
                        })}
                        <td className={`px-3 py-2 text-right tabular-nums font-bold ${total < 0 ? 'text-red-500' : 'text-accent-light'}`}>
                          {total < 0 ? `-$${Math.abs(total).toLocaleString()}` : `$${total.toLocaleString()}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
