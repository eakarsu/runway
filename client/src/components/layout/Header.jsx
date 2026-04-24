import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/spreadsheets': 'Spreadsheets',
  '/planning/revenue': 'Revenue Plan',
  '/planning/headcount': 'Headcount Plan',
  '/planning/expenses': 'Expense Plan',
  '/projects': 'Financial Models',
  '/scenarios': 'Scenarios',
  '/exports': 'Reports',
  '/dashboards': 'KPI Dashboard',
  '/reports/variance': 'Variance Analysis',
  '/templates': 'Templates',
  '/integrations': 'Integrations',
  '/settings': 'Settings',
};

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentPage = pageTitles[location.pathname] || '';

  return (
    <header className="h-[56px] border-b border-gray-200 bg-white flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {currentPage && (
          <h2 className="text-sm font-semibold text-gray-600 hidden md:block">{currentPage}</h2>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative group">
          <Bell className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-600 rounded-full ring-2 ring-white" />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg flex items-center justify-center ring-1 ring-violet-200">
            <User className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-medium text-gray-900 leading-tight">{user?.name || 'Admin User'}</div>
            <div className="text-[10px] text-gray-400 leading-tight">{user?.email || 'admin@runway.com'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors group"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
}
