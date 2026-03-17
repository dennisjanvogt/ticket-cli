import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface Props {
  mode: string;
}

export function Footer({ mode }: Props) {
  const shortcuts =
    mode === 'board'
      ? [
          ['←→', 'Columns'],
          ['↑↓', 'Navigate'],
          ['n', 'New'],
          ['Enter', 'Details'],
          ['m/d', 'Move →/←'],
          ['x', 'Delete'],
          ['/', 'Search'],
          ['q', 'Quit'],
        ]
      : [['Esc', 'Back'], ['q', 'Quit']];

  return (
    <Box paddingX={1} marginTop={1}>
      {shortcuts.map(([key, label], i) => (
        <Box key={key} marginRight={2}>
          <Text bold color={colors.activeBorder}>
            {key}
          </Text>
          <Text dimColor> {label}</Text>
          {i < shortcuts.length - 1 ? <Text dimColor> </Text> : null}
        </Box>
      ))}
    </Box>
  );
}
