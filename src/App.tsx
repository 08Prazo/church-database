import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { SoulsDashboard } from './components/SoulsDashboard';
import { Soul } from './types';
import { subscribeToSouls } from './lib/database';
import { Loader2 } from 'lucide-react';
import { CHURCH_NAME, APP_NAME } from './lib/constants';
import { ChurchHelixSvg } from './components/ChurchLogo';

const MainApp: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<'my_souls' | 'admin_dashboard'>('my_souls');
  const [souls, setSouls] = useState<Soul[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Default to Admin Dashboard if admin or super admin, or let them toggle
  useEffect(() => {
    if (isAdmin && currentView === 'my_souls' && souls.length === 0) {
      // Keep view or default
    }
  }, [isAdmin]);

  // Subscribe to souls whenever the user or currentView changes
  useEffect(() => {
    if (!user) return;

    setDataLoading(true);
    // If viewing admin_dashboard, pass user as admin so they get all souls
    // If viewing my_souls, simulate regular user so they get only their own souls
    const userContext = currentView === 'admin_dashboard' && isAdmin
      ? user
      : { ...user, role: 'user' as const };

    const unsubscribe = subscribeToSouls(userContext, (fetchedSouls) => {
      setSouls(fetchedSouls);
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user, currentView, isAdmin]);

  if (loading) {
    return (
      <div
        id="app-loading"
        className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4"
      >
        <div className="w-14 h-10 px-1 rounded-2xl bg-white border border-slate-200/90 text-slate-900 flex items-center justify-center shadow-xs mb-3">
          <ChurchHelixSvg className="w-full h-full p-1" color="#0f172a" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          <span>Loading {CHURCH_NAME}...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div id="app-container" className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      <Navbar
        currentView={currentView}
        onSelectView={setCurrentView}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {dataLoading ? (
          <div className="p-12 text-center text-xs font-medium text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading soul records...</span>
          </div>
        ) : (
          <SoulsDashboard
            mode={currentView}
            souls={souls}
          />
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
