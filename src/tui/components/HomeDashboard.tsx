import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { AppCard } from './AppCard.js';
import { useAuth } from '../contexts/AuthContext.js';
import { colors } from '../theme.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';
import type { AppId } from '../../types.js';

interface HomeDashboardProps {
  onSelectApp: (app: AppId) => void;
  onLogout: () => void;
}

const APPS: { id: AppId; label: string; icon: string }[] = [
  { id: 'tickets', label: 'Tickets', icon: '📋' },
  { id: 'time-tracking', label: 'Time', icon: '⏱' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export function HomeDashboard({ onSelectApp, onLogout }: HomeDashboardProps): React.ReactElement {
  const { columns, rows } = useTerminalSize();
  const auth = useAuth();
  const { exit } = useApp();
  const [row, setRow] = useState<0 | 1>(0);
  const [col, setCol] = useState<0 | 1>(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setRow(row === 1 ? 0 : 1);
    } else if (key.downArrow) {
      setRow(row === 0 ? 1 : 0);
    } else if (key.leftArrow) {
      setCol(col === 1 ? 0 : 1);
    } else if (key.rightArrow) {
      setCol(col === 0 ? 1 : 0);
    } else if (key.return) {
      const index = row * 2 + col;
      onSelectApp(APPS[index].id);
    } else if (input === 'q') {
      exit();
    } else if (input === 'l') {
      onLogout();
    }
  });

  const selectedIndex = row * 2 + col;

  return (
    <Box flexDirection="column" width={columns} height={rows}>
      {/* Header */}
      <Box paddingX={2} paddingY={1} justifyContent="space-between">
        <Text bold color={colors.activeBorder}>
          Welcome, {auth.user?.display_name}
        </Text>
        <Text bold color={colors.footerDim}>
          ticket_cli
        </Text>
      </Box>

      {/* App Grid */}
      <Box flexDirection="column" alignItems="center" flexGrow={1} justifyContent="center">
        {/* Row 0 */}
        <Box gap={2}>
          <AppCard
            icon={APPS[0].icon}
            label={APPS[0].label}
            selected={selectedIndex === 0}
          />
          <AppCard
            icon={APPS[1].icon}
            label={APPS[1].label}
            selected={selectedIndex === 1}
          />
        </Box>
        {/* Row 1 */}
        <Box gap={2}>
          <AppCard
            icon={APPS[2].icon}
            label={APPS[2].label}
            selected={selectedIndex === 2}
          />
          <AppCard
            icon={APPS[3].icon}
            label={APPS[3].label}
            selected={selectedIndex === 3}
          />
        </Box>
      </Box>

      {/* Footer */}
      <Box paddingX={2} paddingY={1} justifyContent="center">
        <Text color={colors.footerDim}>
          ←→↑↓ Navigate  Enter Open  l Logout  q Quit
        </Text>
      </Box>
    </Box>
  );
}
