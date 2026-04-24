const statusConfig = {
  active: { dot: 'bg-emerald-400', text: 'text-emerald-400', ring: 'ring-emerald-400/30 bg-emerald-400/10' },
  completed: { dot: 'bg-emerald-400', text: 'text-emerald-400', ring: 'ring-emerald-400/30 bg-emerald-400/10' },
  success: { dot: 'bg-emerald-400', text: 'text-emerald-400', ring: 'ring-emerald-400/30 bg-emerald-400/10' },
  pending: { dot: 'bg-amber-400', text: 'text-amber-400', ring: 'ring-amber-400/30 bg-amber-400/10', pulse: true },
  processing: { dot: 'bg-blue-400', text: 'text-blue-400', ring: 'ring-blue-400/30 bg-blue-400/10', pulse: true },
  in_progress: { dot: 'bg-blue-400', text: 'text-blue-400', ring: 'ring-blue-400/30 bg-blue-400/10', pulse: true },
  failed: { dot: 'bg-red-400', text: 'text-red-400', ring: 'ring-red-400/30 bg-red-400/10' },
  error: { dot: 'bg-red-400', text: 'text-red-400', ring: 'ring-red-400/30 bg-red-400/10' },
  draft: { dot: 'bg-gray-400', text: 'text-gray-400', ring: 'ring-gray-400/30 bg-gray-400/10' },
  archived: { dot: 'bg-gray-500', text: 'text-gray-500', ring: 'ring-gray-500/30 bg-gray-500/10' },
};

export default function StatusBadge({ status }) {
  const key = (status || 'draft').toLowerCase().replace(/\s+/g, '_');
  const config = statusConfig[key] || statusConfig.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ring-1 ${config.ring} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`} />
      {status || 'Draft'}
    </span>
  );
}
