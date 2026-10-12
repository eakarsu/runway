
import FullAIExamples, { useFullAIExamples } from "../../components/FullAIExamples.jsx";
import { useState } from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';
import AIResponseDisplay from '../../components/ui/AIResponseDisplay';
import api from '../../services/api';

export default function PerformancePredictorPage() {
  const fullAIExamples = useFullAIExamples();

  const [form, setForm] = useState({
    title: '',
    description: '',
    platforms: 'YouTube, TikTok, Instagram',
    audience: '',
    durationSeconds: 30,
    hashtags: '',
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);
    try {
      const payload = {
        ...form,
        platforms: form.platforms.split(',').map((s) => s.trim()).filter(Boolean),
        hashtags: form.hashtags.split(',').map((s) => s.trim()).filter(Boolean),
        durationSeconds: Number(form.durationSeconds) || 30,
      };
      const res = await api.post('/ai/performance-predictor', payload);
      setResponse(res.data?.data ?? res.data?.result ?? res.data);
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
          <div className="p-2.5 bg-gradient-to-br from-accent/20 to-purple-600/10 rounded-xl"><TrendingUp className="w-5 h-5 text-accent-light" /></div>
          Performance Predictor
        </h1>
        <p className="text-text-muted mt-1">Forecast engagement for a video concept across platforms</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-6 space-y-5 backdrop-blur-sm" data-full-ai-workspace="PerformancePredictorPage"><FullAIExamples controller={fullAIExamples} disabled={Boolean(loading)} />
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
            placeholder="e.g. Cinematic morning routine" data-full-ai-field={fullAIExamples.bind({ current: form.title, change: (e) => setForm({ ...form, title: e.target.value }), label: "form.title", manual: false, json: false, sample: '' }, "p1-2224", undefined)}
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What is the video about?"
            className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent min-h-[120px] resize-y" data-full-ai-field={fullAIExamples.bind({ current: form.description, change: (e) => setForm({ ...form, description: e.target.value }), label: "form.description", manual: false, json: false, sample: '' }, "p1-2721", undefined)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Target Platforms</label>
            <input
              type="text"
              value={form.platforms}
              onChange={(e) => setForm({ ...form, platforms: e.target.value })}
              className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" data-full-ai-field={fullAIExamples.bind({ current: form.platforms, change: (e) => setForm({ ...form, platforms: e.target.value }), label: "form.platforms", manual: false, json: false, sample: 'YouTube, TikTok, Instagram' }, "p1-3299", undefined)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Audience</label>
            <input
              type="text"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
              className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
              placeholder="e.g. Gen Z fitness" data-full-ai-field={fullAIExamples.bind({ current: form.audience, change: (e) => setForm({ ...form, audience: e.target.value }), label: "form.audience", manual: false, json: false, sample: '' }, "p1-3762", undefined)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Duration (seconds)</label>
            <input
              type="number"
              min="1"
              max="3600"
              value={form.durationSeconds}
              onChange={(e) => setForm({ ...form, durationSeconds: e.target.value })}
              className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" data-full-ai-field={fullAIExamples.bind({ current: form.durationSeconds, change: (e) => setForm({ ...form, durationSeconds: e.target.value }), label: "form.durationSeconds", manual: false, json: false, sample: 30 }, "p1-4280", undefined)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Hashtags (comma-separated)</label>
            <input
              type="text"
              value={form.hashtags}
              onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
              className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" data-full-ai-field={fullAIExamples.bind({ current: form.hashtags, change: (e) => setForm({ ...form, hashtags: e.target.value }), label: "form.hashtags", manual: false, json: false, sample: '' }, "p1-4822", undefined)}
            />
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Forecasting...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Predict Performance</>
          )}
        </button>
      </form>

      <AIResponseDisplay response={response} loading={loading} />
    </div>
  );
}
