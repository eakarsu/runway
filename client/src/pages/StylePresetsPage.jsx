import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Plus, Search } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import api from '../services/api';

export default function StylePresetsPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/style-presets').then(r => setItems(r.data?.data || r.data || [])).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => (i.name || i.title || i.prompt || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2"><div className="p-2 bg-gradient-to-br from-accent/20 to-purple-600/10 rounded-xl"><Palette className="w-6 h-6 text-accent-light" /></div> Style Presets</h1>
          <p className="text-text-muted mt-1">Manage your style presets</p>
        </div>
        <button onClick={() => navigate('/style-presets/new')} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-lg shadow-purple-900/25 hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98]">
          <Plus className="w-4 h-4" /> New
        </button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" />
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item._id || item.id} onClick={() => navigate(`/style-presets/${item._id || item.id}`)} className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-5 hover:border-accent/30 cursor-pointer transition-all duration-300 group card-hover">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-light transition-colors truncate">{item.name || item.name || item.title || 'Untitled'}</h3>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-xs text-text-muted line-clamp-2 mb-3">{item.description || item.prompt || 'No description'}</p>
              <div className="text-xs text-text-muted">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full text-center py-12 text-text-muted">No items found</div>}
        </div>
      )}
    </div>
  );
}
