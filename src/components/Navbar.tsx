import React from 'react';
import { LogOut, Shield, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CHURCH_NAME, CHURCH_TAGLINE, APP_NAME } from '../lib/constants';
import { ChurchLogo, ChurchHelixSvg } from './ChurchLogo';

interface NavbarProps {
  currentView: 'my_souls' | 'admin_dashboard';
  onSelectView: (view: 'my_souls' | 'admin_dashboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onSelectView }) => {
  const { user, signOut, isAdmin, isSuperAdmin } = useAuth();

  const getRoleBadge = () => {
    if (isSuperAdmin) {
      return (
        <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-900 text-white rounded-full">
          Super Admin
        </span>
      );
    }
    if (isAdmin) {
      return (
        <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-full">
          Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-full">
        Member
      </span>
    );
  };

  return (
    <header
      id="app-navbar"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 shadow-2xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-9 px-1 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <ChurchHelixSvg className="w-full h-full p-0.5" color="#ffffff" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900 leading-tight">
                  {CHURCH_NAME}
                </span>
                <span className="text-[10px] text-slate-400 font-medium italic hidden sm:inline">
                  {CHURCH_TAGLINE}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium block">
                {APP_NAME}
              </span>
            </div>
          </div>

          {/* Navigation for Admins */}
          {isAdmin && (
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => onSelectView('my_souls')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  currentView === 'my_souls'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>My Souls</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('admin_dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  currentView === 'admin_dashboard'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </button>
            </div>
          )}

          {/* User profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900 truncate max-w-[180px]">
                  {user?.displayName || user?.email}
                </span>
                {getRoleBadge()}
              </div>
              <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                {user?.email}
              </span>
            </div>

            <button
              type="button"
              onClick={() => signOut()}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition border border-slate-200/80"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
