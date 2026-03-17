import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface Props {
  mode: string;
}

export function Footer({ mode }: Props) {
  const shortcuts =
    mode === 'board'
      ? [
          ['←→', 'Cols'],
          ['↑↓', 'Nav'],
          ['n', 'New'],
          ['Enter', 'Open'],
          ['m/d', 'Move'],
          ['p', 'Prio'],
          ['e', 'Edit'],
          ['x', 'Del'],
          ['/', 'Search'],
          ['q', 'Quit'],
        ]
      : mode === 'detail'
        ? [
            ['Esc', 'Back'],
            ['m/d', 'Move'],
            ['p', 'Prio'],
            ['↑↓', 'Subtask'],
            ['t', 'Toggle'],
            ['a', 'Add'],
            ['x', 'Del'],
            ['q', 'Quit'],
          ]
        : [['Esc', 'Back'], ['q', 'Quit']];

  return (
    <Box paddingX={1}>
      {shortcuts.map(([key, label]) => (
        <Box key={key} marginRight={1}>
          <Text bold color={colors.activeBorder}>
            {key}
          </Text>
          <Text dimColor> {label}</Text>
        </Box>
      ))}
    </Box>
  );
}
