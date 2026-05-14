import { useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import AIResponseDisplay from '../../components/ui/AIResponseDisplay';
import api from '../../services/api';

export default function BrandConsistencyPage() {
  const [form, setForm] = useState({
    brandRules: '',
    content: '',
    contentType: 'video-script',
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
      const res = await api.post('/ai/brand-consistency', form);
      setResponse(res.data?.result || res.data);
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
          <div className="p-2.5 bg-gradient-to-br from-accent/20 to-purple-600/10 rounded-xl"><ShieldCheck className="w-5 h-5 text-accent-light" /></div>
          Brand Consistency
        </h1>
        <p className="text-text-muted mt-1">Check content against your brand rules</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Brand Rules</label>
          <textarea
            value={form.brandRules}
            onChange={(e) => setForm({ ...form, brandRules: e.target.value })}
            placeholder="e.g. Voice: warm, witty. Avoid jargon. Always show logo on intro."
            className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent min-h-[120px] resize-y"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Content Type</label>
          <input
            type="text"
            value={form.contentType}
            onChange={(e) => setForm({ ...form, contentType: e.target.value })}
            className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Content</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Paste the script / caption / copy to review"
            className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent min-h-[160px] resize-y"
            required
          />
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Reviewing...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Check Consistency</>
          )}
        </button>
      </form>

      <AIResponseDisplay response={response} loading={loading} />
    </div>
  );
}
