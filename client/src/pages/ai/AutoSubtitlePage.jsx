import { useState } from 'react';
import { Subtitles, Sparkles } from 'lucide-react';
import AIResponseDisplay from '../../components/ui/AIResponseDisplay';
import api from '../../services/api';

export default function AutoSubtitlePage() {
  const [form, setForm] = useState({
    transcript: '',
    targetLanguage: 'en',
    style: 'broadcast',
    maxLineLength: 42,
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
      const res = await api.post('/ai/auto-subtitle-generator', form);
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
          <div className="p-2.5 bg-gradient-to-br from-accent/20 to-purple-600/10 rounded-xl"><Subtitles className="w-5 h-5 text-accent-light" /></div>
          Auto Subtitle Generator
        </h1>
        <p className="text-text-muted mt-1">Generate accessible, SEO-friendly subtitles from a transcript</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-6 space-y-5 backdrop-blur-sm">
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Transcript</label>
          <textarea
            value={form.transcript}
            onChange={(e) => setForm({ ...form, transcript: e.target.value })}
            placeholder="Paste the spoken transcript or rough captions..."
            className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent min-h-[160px] resize-y"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Target Language</label>
            <input
              type="text"
              value={form.targetLanguage}
              onChange={(e) => setForm({ ...form, targetLanguage: e.target.value })}
              placeholder="e.g., en, es, fr"
              className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Style</label>
            <select
              value={form.style}
              onChange={(e) => setForm({ ...form, style: e.target.value })}
              className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
            >
              <option value="broadcast">broadcast</option>
              <option value="cinematic">cinematic</option>
              <option value="social-media">social-media</option>
              <option value="accessibility">accessibility</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Max Line Length</label>
            <input
              type="number"
              value={form.maxLineLength}
              onChange={(e) => setForm({ ...form, maxLineLength: Number(e.target.value) })}
              className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate Subtitles</>
          )}
        </button>
      </form>

      <AIResponseDisplay response={response} loading={loading} />
    </div>
  );
}
