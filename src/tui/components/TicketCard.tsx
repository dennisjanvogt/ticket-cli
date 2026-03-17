import { Box, Text } from 'ink';
import type { Ticket } from '../../types.js';
import { colors, PRIORITY_SYMBOLS } from '../theme.js';
import { truncate, formatDueDate, progressBar } from '../../utils/format.js';

interface Props {
  ticket: Ticket;
  isSelected: boolean;
  maxWidth: number;
}

export function TicketCard({ ticket, isSelected, maxWidth }: Props) {
  const marker = isSelected ? '▸' : ' ';
  const symbol = PRIORITY_SYMBOLS[ticket.priority];
  const prioColor = colors.priority[ticket.priority];
  const titleWidth = Math.max(8, maxWidth - 10);
  const due = formatDueDate(ticket.due_date);
  const hasSubtasks = ticket.subtask_count > 0;

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={isSelected ? colors.selectedMarker : undefined} bold={isSelected}>
          {marker}{' '}
        </Text>
        <Text color={prioColor}>{symbol} </Text>
        <Text dimColor>#{ticket.id} </Text>
        <Text bold={isSelected} wrap="truncate">
          {truncate(ticket.title, titleWidth)}
        </Text>
      </Box>
      {(ticket.tags.length > 0 || due || hasSubtasks) && (
        <Box marginLeft={4} gap={1}>
          {ticket.tags.map((tag) => (
            <Text key={tag} dimColor color={colors.tag}>
              [{tag}]
            </Text>
          ))}
          {hasSubtasks && (
            <Text dimColor color={ticket.subtask_done === ticket.subtask_count ? colors.success : undefined}>
              [{ticket.subtask_done}/{ticket.subtask_count}]
            </Text>
          )}
          {due && (
            <Text dimColor color={due.color}>
              {due.text}
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}
