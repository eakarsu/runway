import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../services/api';

export default function VideoGenerationNewPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', title: '', description: '', prompt: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/video-generations', form);
      navigate(`/video-generations/${res.data?._id || res.data?.data?._id || res.data?.id || ''}`);
    } catch { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <button onClick={() => navigate('/video-generations')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group"><ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Video Generations</button>
      <h1 className="text-2xl font-bold text-text-primary">New Video Generation</h1>
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-6 backdrop-blur-sm space-y-4">
        <div><label className="block text-sm text-text-secondary mb-1.5">Name / Title</label>
          <input value={form.name || form.title} onChange={e => setForm({ ...form, name: e.target.value, title: e.target.value })} className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" required /></div>
        <div><label className="block text-sm text-text-secondary mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent min-h-[100px]" /></div>
        <button type="submit" disabled={loading} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-purple-900/25 hover:shadow-purple-900/40 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50">
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />} Create
        </button>
      </form>
    </div>
  );
}
