import { useState } from 'react';
import { Grid3X3, Sparkles, Send } from 'lucide-react';
import AIResponseDisplay from '../../components/ui/AIResponseDisplay';
import api from '../../services/api';

export default function StoryboardGeneratorPage() {
  const [form, setForm] = useState({ prompt: '', panels: '4', style: 'sketch' });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);
    try {
      const res = await api.post('/ai/storyboard-generator', form);
      setResponse(res.data?.data || res.data?.result || res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <div className="p-2.5 bg-gradient-to-br from-accent/20 to-purple-600/10 rounded-xl"><Grid3X3 className="w-5 h-5 text-accent-light" /></div>
          Storyboard Generator
        </h1>
        <p className="text-text-muted mt-1">Create visual storyboards from scripts or descriptions</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-6 space-y-5 backdrop-blur-sm">
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Story Description</label>
          <textarea value={form.prompt} onChange={e => setForm({ ...form, prompt: e.target.value })} placeholder="Describe the story or paste a script to storyboard..." className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent min-h-[120px] resize-y" required />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Number of Panels</label>
          <select value={form.panels} onChange={e => setForm({ ...form, panels: e.target.value })} className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent">
            <option value="4">4</option><option value="6">6</option><option value="8">8</option><option value="12">12</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Visual Style</label>
          <select value={form.style} onChange={e => setForm({ ...form, style: e.target.value })} className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent">
            <option value="sketch">sketch</option><option value="detailed">detailed</option><option value="comic">comic</option><option value="realistic">realistic</option>
          </select>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">{error}</div>}

        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:scale-[1.01] active:scale-[0.99]">
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate</>
          )}
        </button>
      </form>

      <AIResponseDisplay response={response} loading={loading} />
    </div>
  );
}
