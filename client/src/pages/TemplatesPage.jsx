import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, DollarSign, Users, CreditCard, TrendingUp, BarChart3, PieChart } from 'lucide-react';

const templateCategories = {
  Revenue: [
    { id: 1, name: 'SaaS Revenue Model', icon: DollarSign, color: 'from-green-500 to-emerald-600', desc: 'MRR/ARR forecast with cohort analysis, churn, and expansion revenue', rows: 12, popular: true },
    { id: 2, name: 'Revenue Waterfall', icon: TrendingUp, color: 'from-blue-500 to-cyan-600', desc: 'Monthly revenue bridge: new, expansion, contraction, churned', rows: 12 },
    { id: 3, name: 'Pricing Model', icon: DollarSign, color: 'from-violet-500 to-purple-600', desc: 'Multi-tier pricing analysis with volume discounts', rows: 10 },
  ],
  Headcount: [
    { id: 4, name: 'Headcount Plan', icon: Users, color: 'from-blue-500 to-indigo-600', desc: 'Department-level hiring plan with salary bands and total cost', rows: 8, popular: true },
    { id: 5, name: 'Compensation Benchmarking', icon: Users, color: 'from-purple-500 to-violet-600', desc: 'Market rates by role, level, and geography', rows: 20 },
  ],
  Expense: [
    { id: 6, name: 'Annual Budget', icon: CreditCard, color: 'from-orange-500 to-amber-600', desc: 'Line-item budget with monthly breakdown and variance tracking', rows: 15, popular: true },
    { id: 7, name: 'Vendor Spend Analysis', icon: CreditCard, color: 'from-red-500 to-rose-600', desc: 'Vendor-level expense tracking with contract details', rows: 25 },
  ],
  'P&L': [
    { id: 8, name: 'Three-Statement Model', icon: TrendingUp, color: 'from-green-500 to-teal-600', desc: 'Linked P&L, Balance Sheet, and Cash Flow statements', rows: 40, popular: true },
    { id: 9, name: 'P&L Statement', icon: BarChart3, color: 'from-indigo-500 to-blue-600', desc: 'Standard income statement with driver-based projections', rows: 20 },
    { id: 10, name: 'Gross Margin Analysis', icon: PieChart, color: 'from-cyan-500 to-blue-600', desc: 'Product-level COGS and gross margin breakdown', rows: 12 },
  ],
  'Cash Flow': [
    { id: 11, name: 'Cash Flow Forecast', icon: DollarSign, color: 'from-emerald-500 to-green-600', desc: 'Operating, investing, and financing cash flows', rows: 18 },
    { id: 12, name: 'Burn Rate Calculator', icon: TrendingUp, color: 'from-red-500 to-orange-600', desc: 'Monthly burn, runway calculation, and cash-out date', rows: 12, popular: true },
  ],
  Budget: [
    { id: 13, name: 'Department Budget', icon: CreditCard, color: 'from-amber-500 to-yellow-600', desc: 'Per-department budget with headcount and non-headcount', rows: 10 },
    { id: 14, name: 'Capital Expenditure Plan', icon: BarChart3, color: 'from-slate-500 to-gray-600', desc: 'CapEx planning with depreciation schedule', rows: 15 },
  ],
};

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', ...Object.keys(templateCategories)];
  const allTemplates = Object.entries(templateCategories).flatMap(([cat, items]) => items.map(t => ({ ...t, category: cat })));

  const filtered = allTemplates.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'All' || t.category === activeTab;
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Template Gallery</h1>
          <p className="text-gray-500 mt-1 text-sm">Start from pre-built financial templates</p>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="space-y-3">
        <div className="max-w-md">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..."
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-100 transition-all shadow-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab ? 'bg-accent/15 text-accent-light' : 'text-text-muted hover:bg-gray-100'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(template => (
          <div key={template.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-accent/30 hover:shadow-md transition-all duration-200 group">
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center shadow-md shrink-0`}>
                <template.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-light transition-colors">{template.name}</h3>
                  {template.popular && <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full font-medium">Popular</span>}
                </div>
                <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{template.category}</span>
              </div>
            </div>
            <p className="text-xs text-text-muted line-clamp-2 mb-4">{template.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-muted">{template.rows} rows</span>
              <button onClick={() => navigate('/spreadsheets')}
                className="text-xs font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 px-3.5 py-1.5 rounded-lg transition-all shadow-sm">
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
