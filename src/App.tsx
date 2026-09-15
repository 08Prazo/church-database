/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { AppLayout } from './components/AppLayout';
import { SoulsDashboard } from './components/SoulsDashboard';
import { AdminManagement } from './components/AdminManagement';
import { ChurchLogo } from './components/ChurchLogo';
import { Loader2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, loading, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'souls' | 'admin-management'>('souls');

  if (loading) {
    return (
      <div id="app-loading-screen" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs mb-4">
          <ChurchLogo variant="vertical" size="sm" />
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          <span>Loading New Souls Database...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {activeTab === 'admin-management' && isSuperAdmin ? (
        <AdminManagement />
      ) : (
        <SoulsDashboard />
      )}
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
