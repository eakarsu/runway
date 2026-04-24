import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, trend, color = 'purple', onClick }) {
  const colors = {
    purple: { bg: 'from-violet-600/15 to-purple-900/5', border: 'border-violet-500/15', icon: 'from-violet-500 to-purple-600', text: 'text-violet-400' },
    blue: { bg: 'from-blue-600/15 to-blue-900/5', border: 'border-blue-500/15', icon: 'from-blue-500 to-cyan-600', text: 'text-blue-400' },
    green: { bg: 'from-emerald-600/15 to-emerald-900/5', border: 'border-emerald-500/15', icon: 'from-emerald-500 to-teal-600', text: 'text-emerald-400' },
    orange: { bg: 'from-orange-600/15 to-orange-900/5', border: 'border-orange-500/15', icon: 'from-orange-500 to-amber-600', text: 'text-orange-400' },
  };
  const c = colors[color] || colors.purple;

  return (
    <div onClick={onClick} className={`bg-gradient-to-br ${c.bg} ${c.border} border rounded-2xl p-5 animate-fade-in card-hover ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${c.icon} rounded-xl flex items-center justify-center shadow-lg`}>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
            trend > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-text-primary tracking-tight">{value}</div>
      <div className="text-xs text-text-muted mt-1 font-medium">{title}</div>
    </div>
  );
}
