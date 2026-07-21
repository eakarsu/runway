import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Save, X } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import api from '../services/api';

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    api.get(`/assets/${id}`).then(r => { const d = r.data?.data || r.data; setItem(d); setForm(d); }).catch(() => { /* Best-effort prototype UI request. */ }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    try { await api.put(`/assets/${id}`, form); setItem({...form}); setEditing(false); } catch { /* Best-effort prototype UI action. */ }
  };
  const handleDelete = async () => {
    try { await api.delete(`/assets/${id}`); navigate('/assets'); } catch { /* Best-effort prototype UI action. */ }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!item) return <div className="text-center py-12 text-text-muted">Not found</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <button onClick={() => navigate('/assets')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group"><ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Assets</button>
      <div className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            {editing ? (
              <input value={form.name || form.name || form.title || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="text-xl font-bold bg-dark-bg/60 border border-dark-border/60 rounded-xl px-3 py-1.5 text-text-primary focus:outline-none focus:border-accent" />
            ) : (
              <h1 className="text-xl font-bold text-text-primary">{item.name || item.name || item.title || 'Untitled'}</h1>
            )}
            <div className="mt-2"><StatusBadge status={item.status} /></div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-purple-900/25 flex items-center gap-1.5 text-sm"><Save className="w-4 h-4" /> Save</button>
                <button onClick={() => { setEditing(false); setForm(item); }} className="bg-dark-surface/60 hover:bg-black/[0.05] border border-dark-border/60 text-text-secondary px-3 py-2 rounded-xl flex items-center gap-1.5 text-sm"><X className="w-4 h-4" /> Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="bg-dark-surface/60 hover:bg-black/[0.05] border border-dark-border/60 text-text-secondary px-3 py-2 rounded-xl flex items-center gap-1.5 text-sm"><Edit2 className="w-4 h-4" /> Edit</button>
                <button onClick={() => setDeleteModal(true)} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl flex items-center gap-1.5 text-sm"><Trash2 className="w-4 h-4" /> Delete</button>
              </>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div><label className="text-xs text-text-muted uppercase tracking-wider">Description</label>
            {editing ? <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-3 py-2 text-text-primary text-sm mt-1 focus:outline-none focus:border-accent min-h-[80px]" />
            : <p className="text-sm text-text-secondary mt-1">{item.description || item.prompt || 'No description'}</p>}
          </div>
          {item.prompt && <div><label className="text-xs text-text-muted uppercase tracking-wider">Prompt</label><p className="text-sm text-text-secondary mt-1 bg-dark-surface rounded-lg p-3">{item.prompt}</p></div>}
          {item.result && <div><label className="text-xs text-text-muted uppercase tracking-wider">Result</label><p className="text-sm text-text-secondary mt-1 bg-dark-surface rounded-lg p-3 whitespace-pre-wrap">{typeof item.result === 'string' ? item.result : JSON.stringify(item.result, null, 2)}</p></div>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-text-muted uppercase tracking-wider">Status</label>
              {editing ? <select value={form.status || ''} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-3 py-2 text-text-primary text-sm mt-1 focus:outline-none focus:border-accent">
                <option value="active">Active</option><option value="draft">Draft</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="processing">Processing</option>
              </select> : <p className="text-sm text-text-secondary mt-1">{item.status || 'N/A'}</p>}
            </div>
            <div><label className="text-xs text-text-muted uppercase tracking-wider">Created</label><p className="text-sm text-text-secondary mt-1">{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</p></div>
          </div>
        </div>
      </div>
      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Confirm Delete">
        <p className="text-sm text-text-secondary mb-4">Are you sure? This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDeleteModal(false)} className="px-4 py-2 text-sm text-text-secondary bg-dark-bg/60 border border-dark-border/60 rounded-xl hover:bg-dark-card-hover">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
