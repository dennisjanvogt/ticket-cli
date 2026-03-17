import { Box, Text } from 'ink';
import type { Ticket, Column as ColumnType } from '../../types.js';
import { COLUMN_LABELS } from '../../types.js';
import { TicketCard } from './TicketCard.js';
import { colors } from '../theme.js';
import { PRIORITY_ORDER } from '../../utils/format.js';

interface Props {
  column: ColumnType;
  tickets: Ticket[];
  isActive: boolean;
  selectedIndex: number;
  width: number;
  maxHeight: number;
}

export function Column({ column, tickets, isActive, selectedIndex, width, maxHeight }: Props) {
  const sorted = [...tickets].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );
  const borderColor = isActive ? colors.activeBorder : colors.inactiveBorder;
  const colColor = colors.column[column];

  // Scroll if needed
  const visibleCount = Math.max(1, maxHeight - 4);
  let startIdx = 0;
  if (selectedIndex >= visibleCount) {
    startIdx = selectedIndex - visibleCount + 1;
  }
  const visible = sorted.slice(startIdx, startIdx + visibleCount);

  return (
    <Box
      flexDirection="column"
      width={width}
      borderStyle="round"
      borderColor={borderColor}
      paddingX={1}
    >
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color={colColor}>
          {COLUMN_LABELS[column]}
        </Text>
        <Text dimColor> ({tickets.length})</Text>
      </Box>
      {visible.length === 0 ? (
        <Text dimColor italic>
          empty
        </Text>
      ) : (
        visible.map((ticket, i) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            isSelected={isActive && startIdx + i === selectedIndex}
            maxWidth={width - 4}
          />
        ))
      )}
      {startIdx > 0 && (
        <Text dimColor>↑ {startIdx} more</Text>
      )}
      {startIdx + visibleCount < sorted.length && (
        <Text dimColor>↓ {sorted.length - startIdx - visibleCount} more</Text>
      )}
    </Box>
  );
}
