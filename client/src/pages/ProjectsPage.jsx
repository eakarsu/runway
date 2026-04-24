import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, ArrowLeft, TrendingUp, DollarSign, BarChart3, PieChart, X } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import api from '../services/api';

const modelTypes = [
  { key: 'all', label: 'All Models' },
  { key: 'pnl', label: 'P&L', icon: TrendingUp },
  { key: 'cashflow', label: 'Cash Flow', icon: DollarSign },
  { key: 'balance', label: 'Balance Sheet', icon: BarChart3 },
  { key: 'custom', label: 'Custom', icon: PieChart },
];

const mockModels = [
  { id: 1, name: '2025 P&L Model', type: 'pnl', status: 'active', description: 'Full income statement projection with driver-based revenue and expense modeling', updatedAt: '2 hours ago' },
  { id: 2, name: 'Cash Flow Forecast', type: 'cashflow', status: 'active', description: 'Monthly cash flow projection including operating, investing, and financing activities', updatedAt: '1 day ago' },
  { id: 3, name: 'Series B Model', type: 'pnl', status: 'draft', description: 'Fundraising model showing path to profitability for Series B deck', updatedAt: '3 days ago' },
  { id: 4, name: 'Balance Sheet Forecast', type: 'balance', status: 'draft', description: 'Projected balance sheet through Q4 2025', updatedAt: '1 week ago' },
  { id: 5, name: 'Unit Economics Model', type: 'custom', status: 'active', description: 'CAC, LTV, payback period, and magic number analysis', updatedAt: '2 weeks ago' },
  { id: 6, name: 'Board Deck Financial Summary', type: 'pnl', status: 'completed', description: 'Quarterly financial summary for board presentation', updatedAt: '1 month ago' },
];

const typeIcons = { pnl: TrendingUp, cashflow: DollarSign, balance: BarChart3, custom: PieChart };
const typeColors = { pnl: 'from-green-500 to-emerald-600', cashflow: 'from-blue-500 to-cyan-600', balance: 'from-purple-500 to-violet-600', custom: 'from-orange-500 to-amber-600' };

export default function ProjectsPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newModel, setNewModel] = useState({ name: '', type: 'pnl', description: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/financial-models').then(r => {
      const data = r.data?.data || r.data || [];
      // Only use API data if it contains financial model types, otherwise use mock data
      const hasFinancialData = data.length > 0 && data.some(d => ['pnl','cashflow','balance','custom'].includes(d.type));
      setItems(hasFinancialData ? data : mockModels);
    }).catch(() => setItems(mockModels)).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => {
    const matchSearch = (i.name || i.title || '').toLowerCase().includes(search.toLowerCase());
    const matchType = activeTab === 'all' || i.type === activeTab;
    return matchSearch && matchType;
  });

  const handleCreate = () => {
    navigate(`/projects/${mockModels.length + 1}`);
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Models</h1>
          <p className="text-gray-500 mt-1 text-sm">Build and manage your financial models</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-purple-900/25 hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="w-4 h-4" /> New Model
        </button>
      </div>

      {/* Search + Filter Tabs */}
      <div className="space-y-3">
        <div className="max-w-md">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search models..." className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-100 transition-all shadow-sm" />
        </div>
        <div className="flex gap-2">
          {modelTypes.map(tab => (
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
            const Icon = typeIcons[item.type] || FolderOpen;
            const color = typeColors[item.type] || 'from-gray-500 to-gray-600';
            return (
              <div key={item._id || item.id} onClick={() => navigate(`/projects/${item._id || item.id}`)}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-accent/30 hover:shadow-md cursor-pointer transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-md`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-light transition-colors">{item.name || item.title}</h3>
                      <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{item.type?.toUpperCase()}</span>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-text-muted line-clamp-2 mb-3">{item.description || 'No description'}</p>
                <div className="text-[11px] text-text-muted">Updated {item.updatedAt || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '')}</div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="col-span-full text-center py-12 text-text-muted">No models found</div>}
        </div>
      )}

      {/* New Model Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowNewModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-2xl" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-text-primary">New Financial Model</h3>
                <button onClick={() => setShowNewModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1.5">Model Name</label>
                  <input value={newModel.name} onChange={e => setNewModel(m => ({ ...m, name: e.target.value }))} placeholder="e.g., 2025 P&L Forecast"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1.5">Model Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {modelTypes.filter(t => t.key !== 'all').map(t => (
                      <button key={t.key} onClick={() => setNewModel(m => ({ ...m, type: t.key }))}
                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                          newModel.type === t.key ? 'border-accent/50 bg-accent/10 text-accent-light' : 'border-gray-200 text-text-muted hover:border-gray-300'
                        }`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1.5">Description</label>
                  <textarea value={newModel.description} onChange={e => setNewModel(m => ({ ...m, description: e.target.value }))} placeholder="Brief description..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 min-h-[80px]" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-text-muted bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleCreate} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                  Create Model
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
