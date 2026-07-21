import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, TrendingUp, TrendingDown, Users, Flame, Clock,
  ArrowRight, Plus, BarChart3, GitBranch, AlertTriangle, Lightbulb,
  FileText, Table, PieChart, Link2, X
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend
} from 'recharts';
const kpiData = {
  mrr: { value: 186500, prev: 172000, label: 'MRR', format: '$', path: '/planning/revenue' },
  arr: { value: 2238000, prev: 2064000, label: 'ARR', format: '$', path: '/planning/revenue' },
  burnRate: { value: 285000, prev: 310000, label: 'Monthly Burn', format: '$', lowerBetter: true, path: '/planning/expenses' },
  runway: { value: 24, prev: 20, label: 'Runway (Months)', format: '', unit: ' mo', path: '/dashboards' },
  headcount: { value: 67, prev: 59, label: 'Headcount', format: '', path: '/planning/headcount' },
  cashBalance: { value: 6800000, prev: 7100000, label: 'Cash Balance', format: '$', lowerBetter: false, path: '/dashboards' },
};

const cashFlowData = [
  { month: 'Oct', inflow: 165000, outflow: 275000 },
  { month: 'Nov', inflow: 172000, outflow: 280000 },
  { month: 'Dec', inflow: 178000, outflow: 278000 },
  { month: 'Jan', inflow: 182000, outflow: 285000 },
  { month: 'Feb', inflow: 186500, outflow: 282000 },
  { month: 'Mar', inflow: 192000, outflow: 288000 },
];

const budgetVsActual = [
  { category: 'Engineering', budget: 320000, actual: 315000 },
  { category: 'Sales', budget: 145000, actual: 162000 },
  { category: 'Marketing', budget: 85000, actual: 92000 },
  { category: 'G&A', budget: 65000, actual: 63500 },
  { category: 'R&D', budget: 85000, actual: 88000 },
  { category: 'CS', budget: 72000, actual: 70500 },
];

const aiAlerts = [
  { type: 'warning', icon: AlertTriangle, text: 'Q2 marketing spend is tracking 12% over budget. Consider reviewing ad spend allocation.' },
  { type: 'info', icon: Lightbulb, text: 'At current growth rate, ARR will cross $3M by Q4. Revenue plan assumptions look conservative.' },
  { type: 'warning', icon: AlertTriangle, text: 'Engineering headcount is 2 hires behind Q1 plan. This may impact product roadmap delivery.' },
  { type: 'info', icon: Lightbulb, text: 'Burn multiple improved from 2.1x to 1.5x over last 3 months. Path to profitability accelerating.' },
];

const quickActions = [
  { label: 'Revenue Plan', desc: 'Model MRR growth', icon: DollarSign, path: '/planning/revenue', color: 'from-green-600 to-emerald-600' },
  { label: 'New Model', desc: 'Build financial model', icon: FileText, path: '/projects/new', color: 'from-violet-600 to-purple-600' },
  { label: 'Create Report', desc: 'Variance analysis', icon: BarChart3, path: '/reports/variance', color: 'from-orange-600 to-amber-600' },
  { label: 'Run Scenario', desc: 'What-if analysis', icon: GitBranch, path: '/scenarios', color: 'from-blue-600 to-cyan-600' },
];

const recentActivity = [
  {
    action: 'Updated', item: 'Q2 Revenue Forecast', type: 'spreadsheet', time: '2 hours ago', icon: Table, path: '/spreadsheets',
    details: {
      description: 'Monthly MRR forecast updated with latest March actuals. New customer additions revised upward to 18/month based on Q1 pipeline.',
      status: 'Active', lastModifiedBy: 'Admin',
      metrics: [{ label: 'Total MRR', value: '$186,500' }, { label: 'Rows', value: '12' }, { label: 'Formulas', value: '24' }],
      table: {
        headers: ['Month', 'New MRR', 'Churned', 'Expansion', 'Total MRR', 'ARR'],
        rows: [
          ['Jan', '$12,400', '-$3,200', '$4,100', '$165,000', '$1.98M'],
          ['Feb', '$14,800', '-$3,500', '$5,200', '$172,000', '$2.06M'],
          ['Mar', '$16,200', '-$3,100', '$5,400', '$186,500', '$2.24M'],
          ['Apr', '$17,500', '-$3,300', '$5,800', '$198,200', '$2.38M'],
          ['May', '$18,900', '-$3,600', '$6,100', '$211,400', '$2.54M'],
          ['Jun', '$20,100', '-$3,800', '$6,500', '$225,800', '$2.71M'],
        ],
      },
    },
  },
  {
    action: 'Created', item: 'Best Case Scenario', type: 'scenario', time: '5 hours ago', icon: GitBranch, path: '/scenarios',
    details: {
      description: 'Aggressive growth scenario with 45% revenue growth, 2% churn, and 28 new hires planned for the year.',
      status: 'Active', lastModifiedBy: 'Admin',
      metrics: [{ label: 'ARR', value: '$3.48M' }, { label: 'Runway', value: '30 months' }, { label: 'Headcount', value: '87' }],
      table: {
        headers: ['Driver', 'Base Case', 'Best Case', 'Delta'],
        rows: [
          ['Revenue Growth', '30%', '45%', '+15%'],
          ['Monthly Churn', '3.5%', '2.0%', '-1.5%'],
          ['New Hires', '20', '28', '+8'],
          ['ARPU', '$420', '$480', '+$60'],
          ['CAC', '$1,200', '$950', '-$250'],
          ['Gross Margin', '72%', '76%', '+4%'],
        ],
      },
    },
  },
  {
    action: 'Generated', item: 'March Variance Report', type: 'report', time: '1 day ago', icon: BarChart3, path: '/reports/variance',
    details: {
      description: 'Budget vs Actual analysis for March 2025. Sales & Marketing 11.7% over budget driven by product launch ad spend.',
      status: 'Completed', lastModifiedBy: 'Admin',
      metrics: [{ label: 'Total Budget', value: '$950k' }, { label: 'Total Actual', value: '$974k' }, { label: 'Variance', value: '-$24k' }],
      table: {
        headers: ['Category', 'Budget', 'Actual', 'Variance', '% Var'],
        rows: [
          ['Engineering', '$320,000', '$315,000', '+$5,000', '-1.6%'],
          ['Sales', '$145,000', '$162,000', '-$17,000', '+11.7%'],
          ['Marketing', '$85,000', '$92,000', '-$7,000', '+8.2%'],
          ['G&A', '$65,000', '$63,500', '+$1,500', '-2.3%'],
          ['R&D', '$85,000', '$88,000', '-$3,000', '+3.5%'],
          ['Customer Success', '$72,000', '$70,500', '+$1,500', '-2.1%'],
        ],
      },
    },
  },
  {
    action: 'Modified', item: 'Headcount Plan 2025', type: 'plan', time: '1 day ago', icon: Users, path: '/planning/headcount',
    details: {
      description: 'Updated Q2 engineering hires from 4 to 6. Added 2 senior backend roles to support infrastructure scaling.',
      status: 'Active', lastModifiedBy: 'Admin',
      metrics: [{ label: 'Current HC', value: '59' }, { label: 'EOY Target', value: '87' }, { label: 'Total Cost', value: '$12.0M' }],
      table: {
        headers: ['Department', 'Current', 'Q1 Hires', 'Q2 Hires', 'Q3 Hires', 'Q4 Hires', 'EOY'],
        rows: [
          ['Engineering', '24', '3', '6', '4', '3', '40'],
          ['Sales', '12', '2', '3', '2', '2', '21'],
          ['Marketing', '6', '1', '1', '1', '0', '9'],
          ['Customer Success', '8', '1', '1', '1', '0', '11'],
          ['G&A', '5', '0', '1', '0', '0', '6'],
          ['Product', '4', '0', '0', '0', '0', '4'],
        ],
      },
    },
  },
  {
    action: 'Connected', item: 'Stripe Integration', type: 'integration', time: '2 days ago', icon: Link2, path: '/integrations',
    details: {
      description: 'Stripe payment data now syncing automatically. Revenue, subscription, and churn metrics will update in real-time.',
      status: 'Connected', lastModifiedBy: 'Admin',
      metrics: [{ label: 'Data Source', value: 'Stripe' }, { label: 'Sync Freq', value: 'Real-time' }, { label: 'Last Sync', value: '2 min ago' }],
      table: {
        headers: ['Metric', 'Value', 'Source', 'Updated'],
        rows: [
          ['Monthly Revenue', '$186,500', 'Stripe Billing', '2 min ago'],
          ['Active Subscriptions', '442', 'Stripe Billing', '2 min ago'],
          ['Avg Revenue/User', '$422', 'Calculated', '2 min ago'],
          ['Failed Payments', '3', 'Stripe Payments', '15 min ago'],
          ['Net New MRR', '$16,200', 'Stripe Billing', '2 min ago'],
          ['Churn Rate', '3.1%', 'Calculated', '1 hr ago'],
        ],
      },
    },
  },
  {
    action: 'Updated', item: 'P&L Model', type: 'model', time: '3 days ago', icon: PieChart, path: '/projects/1',
    details: {
      description: 'Revised COGS assumptions from 28% to 26% based on new cloud infrastructure contract. EBITDA margin improved.',
      status: 'Active', lastModifiedBy: 'Admin',
      metrics: [{ label: 'Annual Rev', value: '$2.8M' }, { label: 'EBITDA', value: '-$420k' }, { label: 'Net Income', value: '-$580k' }],
      table: {
        headers: ['Line Item', 'Q1', 'Q2', 'Q3', 'Q4', 'Annual'],
        rows: [
          ['Revenue', '$580k', '$680k', '$780k', '$860k', '$2.8M'],
          ['COGS (26%)', '-$151k', '-$177k', '-$203k', '-$224k', '-$728k'],
          ['Gross Profit', '$429k', '$503k', '$577k', '$636k', '$2.07M'],
          ['OpEx', '-$620k', '-$640k', '-$660k', '-$670k', '-$2.49M'],
          ['EBITDA', '-$191k', '-$137k', '-$83k', '-$34k', '-$420k'],
          ['Net Income', '-$210k', '-$155k', '-$110k', '-$65k', '-$580k'],
        ],
      },
    },
  },
];

const formatKPI = (value, format, unit) => {
  if (format === '$') {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value.toLocaleString()}`;
  }
  return `${value}${unit || ''}`;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [previewItem, setPreviewItem] = useState(null);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="text-gradient">Financial Command Center</span>
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Real-time FP&A insights across your business</p>
      </div>

      {/* KPI Cards — clickable */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(kpiData).map(([key, kpi], i) => {
          const change = kpi.prev ? ((kpi.value - kpi.prev) / kpi.prev * 100).toFixed(1) : 0;
          const isPositive = kpi.lowerBetter ? Number(change) < 0 : Number(change) > 0;
          return (
            <div key={key}
              onClick={() => navigate(kpi.path)}
              className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:border-violet-200 cursor-pointer transition-all duration-200 animate-fade-in group"
              style={{ animationDelay: `${i * 60}ms` }}>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider group-hover:text-violet-500 transition-colors">{kpi.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatKPI(kpi.value, kpi.format, kpi.unit)}</p>
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(Number(change))}% vs prev
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Cash Flow
            </h3>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Last 6 months</span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="inflow" stroke="#22c55e" fill="url(#inflowGrad)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="outflow" stroke="#ef4444" fill="url(#outflowGrad)" strokeWidth={2} name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500" /> Budget vs Actual
            </h3>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">This month</span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={budgetVsActual}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => `$${Number(v).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="budget" fill="#94a3b8" name="Budget" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#8b5cf6" name="Actual" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Alerts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" /> AI Insights
          </h3>
          <div className="space-y-3">
            {aiAlerts.map((alert, i) => (
              <div key={i} className={`p-3 rounded-xl text-xs leading-relaxed ${
                alert.type === 'warning' ? 'bg-amber-50 border border-amber-100 text-amber-800' : 'bg-blue-50 border border-blue-100 text-blue-800'
              }`}>
                <div className="flex items-start gap-2">
                  <alert.icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{alert.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-violet-200 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`w-11 h-11 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-0.5">{action.label}</div>
                <div className="text-xs text-gray-500">{action.desc}</div>
                <div className="flex items-center gap-1 mt-3 text-[10px] font-medium text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Get started <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity — clickable rows */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.map((item, i) => (
            <div key={i}
              onClick={() => setPreviewItem(item)}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-violet-50/40 transition-colors cursor-pointer group">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl flex items-center justify-center shrink-0 group-hover:from-violet-100 group-hover:to-purple-100 transition-colors">
                <item.icon className="w-4 h-4 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900">
                  <span className="font-medium">{item.action}</span> {item.item}
                </div>
                <div className="text-xs text-gray-400 capitalize">{item.type}</div>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
              <ArrowRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Activity Detail Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPreviewItem(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl animate-fade-in overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-2xl" />
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center shrink-0">
                  <previewItem.icon className="w-6 h-6 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">{previewItem.item}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {previewItem.action} · {previewItem.time} · <span className="capitalize">{previewItem.type}</span>
                  </p>
                </div>
                <button onClick={() => setPreviewItem(null)} className="p-1.5 hover:bg-gray-100 rounded-lg shrink-0">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  previewItem.details.status === 'Active' || previewItem.details.status === 'Connected' ? 'bg-green-50 text-green-600 ring-1 ring-green-200' :
                  previewItem.details.status === 'Completed' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' :
                  'bg-gray-50 text-gray-600 ring-1 ring-gray-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    previewItem.details.status === 'Active' || previewItem.details.status === 'Connected' ? 'bg-green-500' :
                    previewItem.details.status === 'Completed' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  {previewItem.details.status}
                </span>
                <span className="text-xs text-gray-400">Modified by {previewItem.details.lastModifiedBy}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed mb-5">{previewItem.details.description}</p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {previewItem.details.metrics.map((m, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{m.label}</p>
                    <p className="text-base font-bold text-gray-900 mt-0.5">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Data Table */}
              {previewItem.details.table && (
                <div className="mb-6 border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          {previewItem.details.table.headers.map((h, i) => (
                            <th key={i} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider text-[10px] border-b border-gray-200">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewItem.details.table.rows.map((row, ri) => (
                          <tr key={ri} className="hover:bg-violet-50/30 transition-colors">
                            {row.map((cell, ci) => (
                              <td key={ci} className={`px-3 py-2 whitespace-nowrap ${
                                ci === 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                              } ${cell.startsWith?.('-') || cell.startsWith?.('-$') ? 'text-red-600' : ''} ${cell.startsWith?.('+') ? 'text-green-600' : ''}`}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => setPreviewItem(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  Close
                </button>
                <button onClick={() => { setPreviewItem(null); navigate(previewItem.path); }}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2">
                  Open <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
