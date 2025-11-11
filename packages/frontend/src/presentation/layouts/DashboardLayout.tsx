/**
 * Presentation Layer - Dashboard Layout
 */

import { FC } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  Bell, 
  Settings, 
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '../../application/stores/authStore';

const DashboardLayout: FC = () => {
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'דשבורד', href: '/', icon: Home },
    { name: 'אירועים', href: '/events', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
          <div className="p-2 bg-primary-100 rounded-lg">
            <LayoutDashboard className="h-6 w-6 text-primary-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">אישורי הגעה</h1>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-danger-500 transition-colors"
              title="התנתק"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="mr-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

