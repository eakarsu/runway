import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass-strong rounded-2xl p-6 w-full max-w-lg animate-scale-in shadow-2xl shadow-black/10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/[0.05] transition-colors group">
            <X className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
