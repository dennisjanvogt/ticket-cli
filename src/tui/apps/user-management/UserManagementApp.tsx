import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { useAuth } from '../../contexts/AuthContext.js';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';
import { usePolledQuery } from '../../hooks/usePolledQuery.js';
import { listUsers, deleteUser } from '../../../store.js';
import { UserForm } from './UserForm.js';
import { colors } from '../../theme.js';
import type { User } from '../../../types.js';

interface Props {
  onBack: () => void;
  onSwitchUser: () => void;
}

type Mode = 'list' | 'create' | 'edit' | 'confirm-delete';

export function UserManagementApp({ onBack, onSwitchUser }: Props): React.ReactElement {
  const auth = useAuth();
  const { columns } = useTerminalSize();
  const users = usePolledQuery(useCallback(() => listUsers(), []));

  const [mode, setMode] = useState<Mode>('list');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editUser, setEditUser] = useState<User | null>(null);

  const isAdmin = auth.user!.role === 'admin';
  const selectedUser = users[selectedIndex] ?? null;

  useInput((input, key) => {
    if (mode !== 'list') return;

    if (key.escape) {
      onBack();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((i) => Math.max(0, i - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex((i) => Math.min(users.length - 1, i + 1));
      return;
    }

    if (!isAdmin) return;

    if (input === 'n') {
      setMode('create');
      setEditUser(null);
      return;
    }

    if (input === 'e' && selectedUser) {
      setEditUser(selectedUser);
      setMode('edit');
      return;
    }

    if (input === 'x' && selectedUser && selectedUser.id !== auth.user!.id) {
      setMode('confirm-delete');
      return;
    }

    if (input === 's' && selectedUser && selectedUser.id !== auth.user!.id) {
      onSwitchUser();
      return;
    }
  });

  useInput((input) => {
    if (mode !== 'confirm-delete') return;

    if (input === 'y' && selectedUser) {
      deleteUser(selectedUser.id);
      setSelectedIndex((i) => Math.min(i, users.length - 2));
      setMode('list');
      return;
    }

    if (input === 'n') {
      setMode('list');
      return;
    }
  });

  if (mode === 'create') {
    return (
      <UserForm
        onSubmit={() => setMode('list')}
        onCancel={() => setMode('list')}
      />
    );
  }

  if (mode === 'edit' && editUser) {
    return (
      <UserForm
        user={editUser}
        onSubmit={() => setMode('list')}
        onCancel={() => setMode('list')}
      />
    );
  }

  const colW = {
    username: 20,
    displayName: 25,
    role: 10,
  };

  return (
    <Box flexDirection="column" width={columns}>
      {/* Header */}
      <Box paddingX={1}>
        <Text bold color={colors.headerFg} backgroundColor={colors.headerBg}>
          {' User Management '.padEnd(columns - 2)}
        </Text>
      </Box>

      {/* Table Header */}
      <Box paddingX={2} marginTop={1}>
        <Text bold dimColor>
          {'  '}
          {'Username'.padEnd(colW.username)}
          {'Display Name'.padEnd(colW.displayName)}
          {'Role'.padEnd(colW.role)}
        </Text>
      </Box>

      {/* User Rows */}
      <Box flexDirection="column" paddingX={2}>
        {users.map((user, i) => {
          const isSelected = i === selectedIndex;
          const marker = isSelected ? '\u25B8 ' : '  ';

          return (
            <Box key={user.id}>
              <Text color={isSelected ? colors.selectedMarker : undefined}>
                {marker}
              </Text>
              <Text
                bold={isSelected}
                color={isSelected ? colors.selectedMarker : undefined}
              >
                {user.username.padEnd(colW.username)}
              </Text>
              <Text color={isSelected ? colors.selectedMarker : undefined}>
                {user.display_name.padEnd(colW.displayName)}
              </Text>
              <Text
                color={
                  user.role === 'admin'
                    ? colors.success
                    : colors.inactiveBorder
                }
              >
                {user.role.padEnd(colW.role)}
              </Text>
            </Box>
          );
        })}
      </Box>

      {/* Confirm Delete Dialog */}
      {mode === 'confirm-delete' && selectedUser && (
        <Box
          marginTop={1}
          marginX={2}
          paddingX={2}
          paddingY={1}
          borderStyle="round"
          borderColor="#ef4444"
          flexDirection="column"
        >
          <Text bold color="#ef4444">
            Delete user &quot;{selectedUser.username}&quot;?
          </Text>
          <Text>
            <Text bold color={colors.selectedMarker}>
              y
            </Text>
            <Text dimColor> confirm </Text>
            <Text bold color={colors.selectedMarker}>
              n
            </Text>
            <Text dimColor> cancel</Text>
          </Text>
        </Box>
      )}

      {/* Footer */}
      <Box marginTop={1} paddingX={2}>
        <Text dimColor color={colors.footerDim}>
          {mode === 'confirm-delete'
            ? 'y/n to confirm or cancel'
            : isAdmin
              ? `Esc back  \u2191\u2193 navigate  n new  e edit${selectedUser && selectedUser.id !== auth.user!.id ? '  x delete  s switch' : ''}`
              : 'Esc back  \u2191\u2193 navigate  (read-only)'}
        </Text>
      </Box>
    </Box>
  );
}
