import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Plus, ArrowLeft, FileText, PieChart, TrendingUp } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import api from '../services/api';

const reportTypes = [
  { key: 'all', label: 'All Reports' },
  { key: 'variance', label: 'Variance' },
  { key: 'board', label: 'Board Deck' },
  { key: 'kpi', label: 'KPI' },
  { key: 'custom', label: 'Custom' },
];

const mockReports = [
  { id: 1, name: 'March Variance Report', type: 'variance', status: 'active', description: 'Budget vs Actual analysis with AI-powered insights', updatedAt: '1 day ago', path: '/reports/variance' },
  { id: 2, name: 'KPI Dashboard — Q1', type: 'kpi', status: 'active', description: 'SaaS metrics: MRR, ARR, Churn, CAC, LTV, Burn Rate, Runway', updatedAt: '2 days ago', path: '/dashboards' },
  { id: 3, name: 'Board Deck — Q1 2025', type: 'board', status: 'completed', description: 'Quarterly financial summary for board presentation', updatedAt: '1 week ago' },
  { id: 4, name: 'February Variance Report', type: 'variance', status: 'completed', description: 'Monthly budget vs actual with variance explanations', updatedAt: '1 month ago', path: '/reports/variance' },
  { id: 5, name: 'Annual KPI Summary', type: 'kpi', status: 'draft', description: 'Year-end KPI performance vs targets', updatedAt: '2 weeks ago', path: '/dashboards' },
  { id: 6, name: 'Investor Update — Feb', type: 'custom', status: 'completed', description: 'Monthly investor update with key metrics and milestones', updatedAt: '1 month ago' },
];

const typeIcons = { variance: BarChart3, board: FileText, kpi: PieChart, custom: TrendingUp };
const typeColors = { variance: 'from-amber-500 to-orange-600', board: 'from-blue-500 to-indigo-600', kpi: 'from-pink-500 to-rose-600', custom: 'from-green-500 to-emerald-600' };

export default function ExportsPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/reports').then(r => {
      const data = r.data?.data || r.data || [];
      const hasReportData = data.length > 0 && data.some(d => ['variance','board','kpi','custom'].includes(d.type));
      setItems(hasReportData ? data : mockReports);
    }).catch(() => setItems(mockReports)).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const matchSearch = (i.name || i.title || '').toLowerCase().includes(search.toLowerCase());
    const matchType = activeTab === 'all' || i.type === activeTab;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1 text-sm">Financial reports, variance analysis, and KPI dashboards</p>
        </div>
        <button onClick={() => navigate('/exports/new')} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-purple-900/25">
          <Plus className="w-4 h-4" /> New Report
        </button>
      </div>

      <div className="space-y-3">
        <div className="max-w-md">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..."
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-100 transition-all shadow-sm" />
        </div>
        <div className="flex gap-2">
          {reportTypes.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.key ? 'bg-accent/15 text-accent-light' : 'text-text-muted hover:bg-gray-100'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => {
            const Icon = typeIcons[item.type] || BarChart3;
            const color = typeColors[item.type] || 'from-gray-500 to-gray-600';
            return (
              <div key={item._id || item.id} onClick={() => item.path ? navigate(item.path) : navigate(`/exports/${item._id || item.id}`)}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-accent/30 hover:shadow-md cursor-pointer transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-md`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-light transition-colors">{item.name || item.title}</h3>
                      <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{item.type}</span>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-text-muted line-clamp-2 mb-3">{item.description || 'No description'}</p>
                <div className="text-[11px] text-text-muted">Updated {item.updatedAt || ''}</div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="col-span-full text-center py-12 text-text-muted">No reports found</div>}
        </div>
      )}
    </div>
  );
}
