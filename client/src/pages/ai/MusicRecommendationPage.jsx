
import FullAIExamples, { useFullAIExamples } from "../../components/FullAIExamples.jsx";
import { useState } from 'react';
import { Music, Sparkles } from 'lucide-react';
import AIResponseDisplay from '../../components/ui/AIResponseDisplay';
import api from '../../services/api';

export default function MusicRecommendationPage() {
  const fullAIExamples = useFullAIExamples();

  const [form, setForm] = useState({
    description: '',
    mood: 'energetic',
    genrePreference: '',
    sceneDuration: '60s',
    licensingType: 'royalty-free',
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
      const res = await api.post('/ai/music-recommendation', form);
      setResponse(res.data?.data ?? res.data?.result ?? res.data);
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
          <div className="p-2.5 bg-gradient-to-br from-accent/20 to-purple-600/10 rounded-xl"><Music className="w-5 h-5 text-accent-light" /></div>
          Music Recommendation
        </h1>
        <p className="text-text-muted mt-1">Get soundtrack suggestions tailored to your video</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-6 space-y-5 backdrop-blur-sm" data-full-ai-workspace="MusicRecommendationPage"><FullAIExamples controller={fullAIExamples} disabled={Boolean(loading)} />
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Scene / Video Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the visuals, pacing, and emotional arc..."
            className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-3 text-text-primary text-sm focus:outline-none focus:border-accent min-h-[120px] resize-y"
            required data-full-ai-field={fullAIExamples.bind({ current: form.description, change: (e) => setForm({ ...form, description: e.target.value }), label: "form.description", manual: false, json: false, sample: '' }, "p1-1766", undefined)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Mood</label>
            <select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" data-full-ai-field={fullAIExamples.bind({ current: form.mood, change: (e) => setForm({ ...form, mood: e.target.value }), label: "form.mood", manual: false, json: false, sample: 'energetic' }, "p1-2379", undefined)}>
              <option value="energetic">energetic</option>
              <option value="cinematic">cinematic</option>
              <option value="suspenseful">suspenseful</option>
              <option value="uplifting">uplifting</option>
              <option value="melancholic">melancholic</option>
              <option value="playful">playful</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Genre Preference (optional)</label>
            <input
              type="text"
              value={form.genrePreference}
              onChange={(e) => setForm({ ...form, genrePreference: e.target.value })}
              placeholder="e.g., synthwave, orchestral, lo-fi"
              className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" data-full-ai-field={fullAIExamples.bind({ current: form.genrePreference, change: (e) => setForm({ ...form, genrePreference: e.target.value }), label: "form.genrePreference", manual: false, json: false, sample: '' }, "p1-3150", undefined)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Scene Duration</label>
            <input
              type="text"
              value={form.sceneDuration}
              onChange={(e) => setForm({ ...form, sceneDuration: e.target.value })}
              placeholder="e.g., 30s, 2min"
              className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" data-full-ai-field={fullAIExamples.bind({ current: form.sceneDuration, change: (e) => setForm({ ...form, sceneDuration: e.target.value }), label: "form.sceneDuration", manual: false, json: false, sample: '60s' }, "p1-3694", undefined)}
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Licensing</label>
            <select value={form.licensingType} onChange={(e) => setForm({ ...form, licensingType: e.target.value })} className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" data-full-ai-field={fullAIExamples.bind({ current: form.licensingType, change: (e) => setForm({ ...form, licensingType: e.target.value }), label: "form.licensingType", manual: false, json: false, sample: 'royalty-free' }, "p1-4210", undefined)}>
              <option value="royalty-free">royalty-free</option>
              <option value="cc-attribution">CC-attribution</option>
              <option value="commercial">commercial</option>
              <option value="any">any</option>
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
            <><Sparkles className="w-4 h-4" /> Recommend Music</>
          )}
        </button>
      </form>

      <AIResponseDisplay response={response} loading={loading} />
    </div>
  );
}
