import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { createUser, updateUser } from '../../../store.js';
import { colors } from '../../theme.js';
import type { User } from '../../../types.js';

interface Props {
  user?: User;
  onSubmit: () => void;
  onCancel: () => void;
}

type RoleValue = 'admin' | 'user';

const FIELDS = ['username', 'displayName', 'password', 'role'] as const;
type FieldName = (typeof FIELDS)[number];

export function UserForm({ user, onSubmit, onCancel }: Props): React.ReactElement {
  const isEdit = !!user;

  const [username, setUsername] = useState(user?.username ?? '');
  const [displayName, setDisplayName] = useState(user?.display_name ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RoleValue>(user?.role ?? 'user');
  const [activeField, setActiveField] = useState<number>(isEdit ? 1 : 0);
  const [error, setError] = useState<string | null>(null);

  const currentField = FIELDS[activeField];

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    // Tab to next field
    if (key.tab) {
      setActiveField((i) => {
        let next = (i + 1) % FIELDS.length;
        // Skip username in edit mode
        if (isEdit && FIELDS[next] === 'username') {
          next = (next + 1) % FIELDS.length;
        }
        return next;
      });
      return;
    }

    // Role toggle with space
    if (currentField === 'role' && input === ' ') {
      setRole((r) => (r === 'admin' ? 'user' : 'admin'));
      return;
    }

    // Submit on Enter at last field (role)
    if (key.return && currentField === 'role') {
      setError(null);

      if (!isEdit && !username.trim()) {
        setError('Username is required');
        return;
      }

      if (!displayName.trim()) {
        setError('Display name is required');
        return;
      }

      if (!isEdit && !password) {
        setError('Password is required');
        return;
      }

      try {
        if (isEdit && user) {
          const updates: { display_name?: string; role?: RoleValue; password?: string } = {
            display_name: displayName.trim(),
            role,
          };
          if (password) {
            updates.password = password;
          }
          updateUser(user.id, updates);
        } else {
          createUser({
            username: username.trim(),
            password,
            display_name: displayName.trim(),
            role,
          });
        }
        onSubmit();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Operation failed');
      }
      return;
    }

    // Text input for text fields
    if (currentField !== 'role') {
      if (key.backspace || key.delete) {
        if (currentField === 'username' && !isEdit) {
          setUsername((v) => v.slice(0, -1));
        } else if (currentField === 'displayName') {
          setDisplayName((v) => v.slice(0, -1));
        } else if (currentField === 'password') {
          setPassword((v) => v.slice(0, -1));
        }
        return;
      }

      // Only accept printable characters
      if (input && !key.ctrl && !key.meta && input.length === 1 && input.charCodeAt(0) >= 32) {
        if (currentField === 'username' && !isEdit) {
          setUsername((v) => v + input);
        } else if (currentField === 'displayName') {
          setDisplayName((v) => v + input);
        } else if (currentField === 'password') {
          setPassword((v) => v + input);
        }
      }
    }
  });

  const renderField = (label: string, value: string, field: FieldName, masked = false, disabled = false) => {
    const isActive = currentField === field;
    const displayValue = masked ? '*'.repeat(value.length) : value;

    return (
      <Box key={field}>
        <Text
          bold={isActive}
          color={isActive ? colors.activeBorder : colors.inactiveBorder}
        >
          {isActive ? '\u25B8 ' : '  '}
          {label.padEnd(16)}
        </Text>
        <Text
          color={disabled ? colors.inactiveBorder : isActive ? colors.activeBorder : undefined}
          dimColor={disabled}
        >
          {displayValue || (isActive ? '\u2588' : '')}
          {isActive && displayValue ? '\u2588' : ''}
        </Text>
        {disabled && (
          <Text dimColor> (read-only)</Text>
        )}
      </Box>
    );
  };

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" minHeight={16}>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={colors.activeBorder}
        paddingX={3}
        paddingY={1}
        width={50}
      >
        {/* Title */}
        <Box marginBottom={1}>
          <Text bold color={colors.activeBorder}>
            {isEdit ? 'Edit User' : 'Create User'}
          </Text>
        </Box>

        {/* Fields */}
        {renderField('Username', username, 'username', false, isEdit)}
        {renderField('Display Name', displayName, 'displayName')}
        {renderField('Password', password, 'password', true)}

        {/* Role toggle */}
        <Box>
          <Text
            bold={currentField === 'role'}
            color={currentField === 'role' ? colors.activeBorder : colors.inactiveBorder}
          >
            {currentField === 'role' ? '\u25B8 ' : '  '}
            {'Role'.padEnd(16)}
          </Text>
          <Text
            bold
            color={role === 'admin' ? colors.success : colors.activeBorder}
          >
            {role}
          </Text>
          {currentField === 'role' && (
            <Text dimColor> (Space to toggle)</Text>
          )}
        </Box>

        {/* Error */}
        {error && (
          <Box marginTop={1}>
            <Text color="#ef4444">{error}</Text>
          </Box>
        )}

        {/* Footer */}
        <Box marginTop={1}>
          <Text dimColor color={colors.footerDim}>
            Tab next field  Enter submit  Esc cancel
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
