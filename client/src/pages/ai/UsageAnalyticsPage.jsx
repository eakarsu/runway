import { useEffect, useState } from 'react';
import { PieChart } from 'lucide-react';
import api from '../../services/api';

export default function UsageAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/ai/usage-analytics');
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || 'Failed to load usage');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <div className="p-2.5 bg-gradient-to-br from-accent/20 to-purple-600/10 rounded-xl"><PieChart className="w-5 h-5 text-accent-light" /></div>
          Usage Analytics
        </h1>
        <p className="text-text-muted mt-1">Credit cost across your AI generations</p>
      </div>

      {loading && <div className="text-text-muted">Loading...</div>}
      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

      {data && (
        <div className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(data.counts || {}).map(([k, v]) => (
              <div key={k} className="bg-dark-bg/40 border border-dark-border/40 rounded-xl p-4">
                <div className="text-xs uppercase tracking-wider text-text-muted">{k}</div>
                <div className="text-2xl font-bold text-text-primary">{v}</div>
                <div className="text-xs text-text-muted">cost {data.creditCost?.[k.replace(/s$/, '')] ?? 'n/a'}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-dark-border/40 pt-4">
            <div className="text-sm text-text-muted">Total credits used</div>
            <div className="text-3xl font-bold text-accent-light">{data.totalCredits}</div>
          </div>
        </div>
      )}
    </div>
  );
}
