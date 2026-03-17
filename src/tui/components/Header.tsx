import { Box, Text } from 'ink';
import type { TicketStore } from '../../types.js';
import { COLUMNS, COLUMN_LABELS } from '../../types.js';
import { colors } from '../theme.js';

interface Props {
  store: TicketStore;
}

export function Header({ store }: Props) {
  const total = store.tickets.length;
  const counts = COLUMNS.map(
    (col) => `${COLUMN_LABELS[col]}: ${store.tickets.filter((t) => t.column === col).length}`
  );

  return (
    <Box flexDirection="column">
      <Box paddingX={1}>
        <Text bold color={colors.headerFg} backgroundColor={colors.headerBg}>
          {' '}📋 {store.project.name}{' '}
        </Text>
        <Text> </Text>
        <Text dimColor>{counts.join('  ·  ')}  ({total} total)</Text>
      </Box>
    </Box>
  );
}
