import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Settings, Sparkles,
  Zap, Menu, X, Table, FileText, BarChart3,
  DollarSign, Users, CreditCard, GitBranch, Link2, PieChart
} from 'lucide-react';

const overviewNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];
const planningNav = [
  { path: '/spreadsheets', label: 'Spreadsheets', icon: Table },
  { path: '/planning/revenue', label: 'Revenue Plan', icon: DollarSign },
  { path: '/planning/headcount', label: 'Headcount Plan', icon: Users },
  { path: '/planning/expenses', label: 'Expense Plan', icon: CreditCard },
];
const modelingNav = [
  { path: '/projects', label: 'Models', icon: FolderOpen },
  { path: '/scenarios', label: 'Scenarios', icon: GitBranch },
];
const reportingNav = [
  { path: '/exports', label: 'Reports', icon: BarChart3 },
  { path: '/dashboards', label: 'Dashboards', icon: PieChart },
];
const configNav = [
  { path: '/templates', label: 'Templates', icon: FileText },
  { path: '/integrations', label: 'Integrations', icon: Link2 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

function NavItem({ path, label, icon: Icon }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 relative ${
          isActive
            ? 'bg-accent/15 text-accent-light shadow-sm shadow-accent/5'
            : 'text-text-muted hover:text-text-primary hover:bg-black/[0.04]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-accent rounded-r-full" />
          )}
          <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${isActive ? 'text-accent-light' : 'text-text-muted group-hover:text-text-secondary'}`} />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="px-3 pt-4 pb-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted/60">{children}</span>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Zap className="w-[18px] h-[18px] text-white" />
          </div>
          <div>
            <span className="text-[15px] font-bold text-text-primary tracking-tight">Runway</span>
            <span className="text-[15px] font-bold text-accent-light tracking-tight"> AI</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <SectionLabel>Overview</SectionLabel>
        {overviewNav.map((item) => <NavItem key={item.path} {...item} />)}

        <SectionLabel>Planning</SectionLabel>
        {planningNav.map((item) => <NavItem key={item.path} {...item} />)}

        <SectionLabel>Modeling</SectionLabel>
        {modelingNav.map((item) => <NavItem key={item.path} {...item} />)}

        <SectionLabel>Reporting</SectionLabel>
        {reportingNav.map((item) => <NavItem key={item.path} {...item} />)}

        <SectionLabel>Configuration</SectionLabel>
        {configNav.map((item) => <NavItem key={item.path} {...item} />)}
      </nav>

      {/* Bottom card */}
      <div className="p-3 border-t border-gray-100">
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-xl p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-light" />
            <span className="text-xs font-semibold text-text-primary">Pro Plan</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 h-1.5 rounded-full" style={{ width: '45%' }} />
          </div>
          <span className="text-[10px] text-text-muted">45 / 100 models used</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 glass rounded-xl"
      >
        <Menu className="w-5 h-5 text-text-primary" />
      </button>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-[260px] h-full bg-white border-r border-gray-200 animate-slide-in-left">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/5">
              <X className="w-4 h-4 text-text-muted" />
            </button>
            {content}
          </div>
        </div>
      )}
      <aside className="hidden lg:block w-[260px] bg-white border-r border-gray-200 h-screen sticky top-0 shrink-0">
        {content}
      </aside>
    </>
  );
}
