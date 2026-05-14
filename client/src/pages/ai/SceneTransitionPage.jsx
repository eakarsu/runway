import { useState } from 'react';
import { Film, Sparkles } from 'lucide-react';
import AIResponseDisplay from '../../components/ui/AIResponseDisplay';
import api from '../../services/api';

export default function SceneTransitionPage() {
  const [form, setForm] = useState({
    sceneOutline: '',
    pacingGoal: 'cinematic',
    targetPlatform: 'youtube',
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
      const res = await api.post('/ai/scene-transition-suggester', form);
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
          <div className="p-2.5 bg-gradient-to-br from-accent/20 to-purple-600/10 rounded-xl"><Film className="w-5 h-5 text-accent-light" /></div>
          Scene Transition Suggester
        </h1>
        <p className="text-text-muted mt-1">Improve pacing with AI-suggested scene transitions</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-6 space-y-5 backdrop-blur-sm">
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Scene Outline</label>
          <textarea
            value={form.sceneOutline}
            onChange={(e) => setForm({ ...form, sceneOutline: e.target.value })}
            placeholder="List your scenes in order, one per line, with brief descriptions..."
            className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent min-h-[160px] resize-y"
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Pacing Goal</label>
            <select value={form.pacingGoal} onChange={(e) => setForm({ ...form, pacingGoal: e.target.value })} className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent">
              <option value="cinematic">cinematic</option>
              <option value="fast-cut">fast-cut</option>
              <option value="documentary">documentary</option>
              <option value="dramatic">dramatic</option>
              <option value="commercial">commercial</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Target Platform</label>
            <select value={form.targetPlatform} onChange={(e) => setForm({ ...form, targetPlatform: e.target.value })} className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent">
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
              <option value="cinema">Cinema</option>
              <option value="broadcast">Broadcast</option>
            </select>
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
            <><Sparkles className="w-4 h-4" /> Suggest Transitions</>
          )}
        </button>
      </form>

      <AIResponseDisplay response={response} loading={loading} />
    </div>
  );
}
