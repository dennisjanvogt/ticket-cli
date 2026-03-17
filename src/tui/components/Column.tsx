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

  // Border (2) + header (1) + gap (1) + pagination footer (1) = 5 reserved lines
  const visibleCount = Math.max(1, maxHeight - 5);
  const total = sorted.length;
  const needsPagination = total > visibleCount;

  let startIdx = 0;
  if (needsPagination) {
    const half = Math.floor(visibleCount / 2);
    startIdx = Math.max(0, selectedIndex - half);
    if (startIdx + visibleCount > total) {
      startIdx = Math.max(0, total - visibleCount);
    }
  }

  const visible = sorted.slice(startIdx, startIdx + visibleCount);
  const hasAbove = startIdx > 0;
  const hasBelow = startIdx + visibleCount < total;

  return (
    <Box
      flexDirection="column"
      width={width}
      height={maxHeight}
      borderStyle="round"
      borderColor={borderColor}
      paddingX={1}
    >
      <Box justifyContent="center">
        <Text bold color={colColor}>
          {COLUMN_LABELS[column]}
        </Text>
        <Text dimColor> ({total})</Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        {visible.length === 0 ? (
          <Text dimColor italic>
            empty
          </Text>
        ) : (
          <>
            {hasAbove && (
              <Text dimColor color={isActive ? colors.activeBorder : undefined}>
                ▲ {startIdx} more
              </Text>
            )}
            {visible.map((ticket, i) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                isSelected={isActive && startIdx + i === selectedIndex}
                maxWidth={width - 4}
              />
            ))}
            {hasBelow && (
              <Text dimColor color={isActive ? colors.activeBorder : undefined}>
                ▼ {total - startIdx - visibleCount} more
              </Text>
            )}
          </>
        )}
      </Box>

      {needsPagination && (
        <Box justifyContent="center">
          <Text dimColor>
            {selectedIndex + 1}/{total}
          </Text>
        </Box>
      )}
    </Box>
  );
}
