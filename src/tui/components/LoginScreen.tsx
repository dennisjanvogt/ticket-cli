import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { authenticateUser } from '../../store.js';
import { useAuth } from '../contexts/AuthContext.js';
import { colors } from '../theme.js';
import { useTerminalSize } from '../hooks/useTerminalSize.js';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps): React.ReactElement {
  const { columns, rows } = useTerminalSize();
  const auth = useAuth();
  const [field, setField] = useState<'username' | 'password'>('username');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useInput((input, key) => {
    if (key.tab) {
      setField(field === 'username' ? 'password' : 'username');
      return;
    }

    if (key.return) {
      if (field === 'username') {
        setField('password');
        return;
      }

      const user = authenticateUser(username, password);
      if (user) {
        auth.login(user);
        onLogin();
      } else {
        setError('Invalid username or password');
      }
      return;
    }

    if (key.backspace || key.delete) {
      if (field === 'username') {
        setUsername(username.slice(0, -1));
      } else {
        setPassword(password.slice(0, -1));
      }
      setError('');
      return;
    }

    if (input && !key.ctrl && !key.meta) {
      if (field === 'username') {
        setUsername(username + input);
      } else {
        setPassword(password + input);
      }
      setError('');
    }
  });

  const boxWidth = 40;

  return (
    <Box
      width={columns}
      height={rows}
      alignItems="center"
      justifyContent="center"
    >
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={colors.activeBorder}
        width={boxWidth}
        paddingX={2}
        paddingY={1}
      >
        <Box justifyContent="center" marginBottom={1}>
          <Text bold color={colors.activeBorder}>
            Login
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={field === 'username' ? colors.activeBorder : colors.footerDim}>
            Username:{' '}
          </Text>
          <Text>
            {username}
            {field === 'username' ? '█' : ''}
          </Text>
        </Box>

        <Box marginBottom={1}>
          <Text color={field === 'password' ? colors.activeBorder : colors.footerDim}>
            Password:{' '}
          </Text>
          <Text>
            {'*'.repeat(password.length)}
            {field === 'password' ? '█' : ''}
          </Text>
        </Box>

        {error ? (
          <Box justifyContent="center">
            <Text color="red">{error}</Text>
          </Box>
        ) : (
          <Box justifyContent="center">
            <Text color={colors.footerDim}>Tab Switch  Enter Submit</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
