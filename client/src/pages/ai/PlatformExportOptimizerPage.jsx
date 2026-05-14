import { useState } from 'react';
import { Share2, Sparkles } from 'lucide-react';
import AIResponseDisplay from '../../components/ui/AIResponseDisplay';
import api from '../../services/api';

const ALL_TARGETS = ['YouTube', 'YouTube Shorts', 'TikTok', 'Instagram Reels', 'Instagram Feed', 'X / Twitter', 'LinkedIn', 'Facebook'];

export default function PlatformExportOptimizerPage() {
  const [form, setForm] = useState({
    sourceFormat: '1080p MP4',
    durationSeconds: 60,
    contentSummary: '',
    targets: ['YouTube Shorts', 'TikTok', 'Instagram Reels'],
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleTarget = (t) => {
    setForm((f) => ({
      ...f,
      targets: f.targets.includes(t) ? f.targets.filter((x) => x !== t) : [...f.targets, t],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);
    try {
      const payload = {
        ...form,
        durationSeconds: Number(form.durationSeconds) || undefined,
      };
      const res = await api.post('/ai/platform-export-optimizer', payload);
      setResponse(res.data?.data || res.data?.result || res.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 503) {
        setError('AI is not configured (OPENROUTER_API_KEY missing).');
      } else {
        setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <div className="p-2.5 bg-gradient-to-br from-accent/20 to-purple-600/10 rounded-xl"><Share2 className="w-5 h-5 text-accent-light" /></div>
          Platform Export Optimizer
        </h1>
        <p className="text-text-muted mt-1">Per-platform export settings and content adaptations</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-6 space-y-5 backdrop-blur-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Source Format</label>
            <input
              type="text"
              value={form.sourceFormat}
              onChange={(e) => setForm({ ...form, sourceFormat: e.target.value })}
              className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Source Duration (seconds)</label>
            <input
              type="number"
              min="1"
              max="36000"
              value={form.durationSeconds}
              onChange={(e) => setForm({ ...form, durationSeconds: e.target.value })}
              className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Content Summary</label>
          <textarea
            value={form.contentSummary}
            onChange={(e) => setForm({ ...form, contentSummary: e.target.value })}
            placeholder="Brief description of the video..."
            className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent min-h-[100px] resize-y"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Targets</label>
          <div className="flex flex-wrap gap-2">
            {ALL_TARGETS.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => toggleTarget(t)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${form.targets.includes(t) ? 'bg-accent/20 border-accent text-accent-light' : 'bg-dark-bg/60 border-dark-border/60 text-text-secondary'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

        <button
          type="submit"
          disabled={loading || form.targets.length === 0}
          className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Optimizing...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Optimize For Platforms</>
          )}
        </button>
      </form>

      <AIResponseDisplay response={response} loading={loading} />
    </div>
  );
}
