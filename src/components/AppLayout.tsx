import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ChurchLogo } from './ChurchLogo';

interface AppLayoutProps {
  activeTab: 'souls' | 'admin-management';
  setActiveTab: (tab: 'souls' | 'admin-management') => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  setActiveTab,
  children,
}) => {
  const { user, role, isSuperAdmin, signOutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = () => {
    switch (role) {
      case 'super_admin':
        return (
          <span
            id="user-role-badge"
            className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md"
          >
            Super Admin
          </span>
        );
      case 'admin':
        return (
          <span
            id="user-role-badge"
            className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200 rounded-md"
          >
            Admin
          </span>
        );
      default:
        return (
          <span
            id="user-role-badge"
            className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200 rounded-md"
          >
            User
          </span>
        );
    }
  };

  const navItems = [
    {
      id: 'nav-new-souls',
      key: 'souls',
      label: 'New Souls',
      icon: Users,
      show: true,
    },
    {
      id: 'nav-admin-management',
      key: 'admin-management',
      label: 'Admin Management',
      icon: ShieldCheck,
      show: isSuperAdmin,
    },
  ];

  return (
    <div id="app-shell" className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <ChurchLogo variant="mark" size="xs" dark />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">The NewBrook</h1>
            <p className="text-[10px] italic text-slate-500 leading-none">...reinforcing your identity</p>
          </div>
        </div>
        <button
          id="btn-toggle-mobile-menu"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        id="app-sidebar"
        className={`
          fixed md:sticky top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div>
          <div className="p-5 border-b border-slate-100 hidden md:block">
            <div className="flex flex-col gap-2">
              <ChurchLogo variant="vertical" size="sm" className="items-start text-left" />
              <div className="mt-1 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                  New Souls Database
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;

                return (
                  <button
                    key={item.key}
                    id={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.key as 'souls' | 'admin-management');
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                      ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </nav>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-medium text-xs">
                {user?.email?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user?.displayName || user?.email?.split('@')[0]}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 truncate" title={user?.email || ''}>
                {user?.email}
              </p>
              <div className="mt-1">{getRoleBadge()}</div>
            </div>
          </div>

          <button
            id="btn-sign-out"
            type="button"
            onClick={signOutUser}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-slate-200 bg-white"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/30 z-30 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <main id="main-content-panel" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
