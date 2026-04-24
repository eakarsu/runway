import { useState } from 'react';
import { Settings, User, Bell, Shield, Palette, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Settings className="w-6 h-6 text-accent-light" /> Settings
        </h1>
        <p className="text-text-muted mt-1">Manage your account and preferences</p>
      </div>

      <div className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2"><User className="w-5 h-5" /> Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Name</label>
            <input defaultValue={user?.name || 'Admin'} className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">Email</label>
            <input defaultValue={user?.email || 'admin@runway.com'} className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</h2>
        {['Email notifications', 'Generation complete alerts', 'Weekly summary'].map(label => (
          <label key={label} className="flex items-center justify-between p-3 rounded-lg hover:bg-dark-card-hover transition-colors cursor-pointer">
            <span className="text-sm text-text-secondary">{label}</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-accent" />
          </label>
        ))}
      </div>

      <div className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2"><Palette className="w-5 h-5" /> Appearance</h2>
        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Theme</label>
          <select defaultValue="dark" className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent">
            <option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option>
          </select>
        </div>
      </div>

      <button onClick={handleSave} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-purple-900/25 hover:shadow-purple-900/40 hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2 text-sm font-medium transition-colors">
        <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
