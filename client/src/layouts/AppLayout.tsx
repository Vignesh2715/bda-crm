import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from '../components/notifications/NotificationBell';
import {
  LayoutDashboard, Users, Target, GitBranch, Calendar, CheckSquare,
  BarChart3, Bell, User, LogOut, Menu, X, Sun, Moon, ChevronRight, Briefcase
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'bda'] },
  { to: '/leads', icon: Target, label: 'Leads', roles: ['admin', 'manager', 'bda'] },
  { to: '/pipeline', icon: GitBranch, label: 'Pipeline', roles: ['admin', 'manager', 'bda'] },
  { to: '/followups', icon: Calendar, label: 'Follow-Ups', roles: ['admin', 'manager', 'bda'] },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks', roles: ['admin', 'manager', 'bda'] },
  { to: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'manager'] },
  { to: '/users', icon: Users, label: 'Team', roles: ['admin', 'manager'] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = navItems.filter(n => user && n.roles.includes(user.role));

  const handleLogout = () => { logout(); navigate('/login'); };

  const NavItem = ({ item }: { item: typeof navItems[0] }) => (
    <NavLink to={item.to} onClick={() => setSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
          isActive
            ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
        }`
      }>
      <item.icon size={18} />
      <span>{item.label}</span>
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">BDA CRM</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {filtered.map(item => <NavItem key={item.to} item={item} />)}
        </nav>

        {/* User section */}
        <div className="px-3 pb-4 space-y-0.5 border-t border-slate-200 dark:border-slate-800 pt-3">
          <NavLink to="/notifications" onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}>
            <Bell size={18} /><span>Notifications</span>
          </NavLink>
          <NavLink to="/profile" onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}>
            <User size={18} /><span>Profile</span>
          </NavLink>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
            <LogOut size={18} /><span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
              <Menu size={22} />
            </button>
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
              <span className="text-slate-900 dark:text-white font-medium">{user?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationBell />
            <NavLink to="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
