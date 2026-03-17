import React, { useState, useEffect } from 'react';
import { Box, useApp } from 'ink';
import { AuthProvider, useAuth } from './contexts/AuthContext.js';
import { LoginScreen } from './components/LoginScreen.js';
import { HomeDashboard } from './components/HomeDashboard.js';
import { TicketApp } from './apps/tickets/TicketApp.js';
import { TimeTrackingApp } from './apps/time-tracking/TimeTrackingApp.js';
import { UserManagementApp } from './apps/user-management/UserManagementApp.js';
import { SettingsApp } from './apps/settings/SettingsApp.js';
import { listUsers, authenticateUser } from '../store.js';
import type { AppId, ScreenMode } from '../types.js';
import { useTerminalSize } from './hooks/useTerminalSize.js';

function PlatformInner(): React.ReactElement {
  const { columns, rows } = useTerminalSize();
  const auth = useAuth();
  const [screen, setScreen] = useState<ScreenMode>('login');
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [manualLogout, setManualLogout] = useState(false);

  useEffect(() => {
    if (auth.user || manualLogout) return;
    const users = listUsers();
    if (users.length === 1) {
      auth.login(users[0]);
      setScreen('home');
    }
  }, [manualLogout]);

  const handleLogin = () => {
    setManualLogout(false);
    setScreen('home');
  };

  const handleLogout = () => {
    auth.logout();
    setActiveApp(null);
    setManualLogout(true);
    setScreen('login');
  };

  const handleSelectApp = (app: AppId) => {
    setActiveApp(app);
    setScreen('app');
  };

  const handleBack = () => {
    setActiveApp(null);
    setScreen('home');
  };

  if (!auth.user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (screen === 'app' && activeApp) {
    switch (activeApp) {
      case 'tickets':
        return <TicketApp onBack={handleBack} />;
      case 'time-tracking':
        return <TimeTrackingApp onBack={handleBack} />;
      case 'users':
        return <UserManagementApp onBack={handleBack} onSwitchUser={handleLogout} />;
      case 'settings':
        return <SettingsApp onBack={handleBack} />;
    }
  }

  return (
    <HomeDashboard onSelectApp={handleSelectApp} onLogout={handleLogout} />
  );
}

export function Platform(): React.ReactElement {
  return (
    <AuthProvider>
      <PlatformInner />
    </AuthProvider>
  );
}
