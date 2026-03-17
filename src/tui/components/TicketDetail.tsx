import { Box, Text } from 'ink';
import type { Ticket } from '../../types.js';
import { COLUMN_LABELS } from '../../types.js';
import { colors, PRIORITY_SYMBOLS } from '../theme.js';
import { formatRelativeDate } from '../../utils/format.js';

interface Props {
  ticket: Ticket;
}

export function TicketDetail({ ticket }: Props) {
  const prioColor = colors.priority[ticket.priority];

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor={colors.activeBorder}>
      <Box marginBottom={1}>
        <Text bold>
          Ticket #{ticket.id}
        </Text>
      </Box>

      <Box>
        <Text bold>Title:    </Text>
        <Text>{ticket.title}</Text>
      </Box>

      <Box>
        <Text bold>Column:   </Text>
        <Text color={colors.column[ticket.column]}>{COLUMN_LABELS[ticket.column]}</Text>
      </Box>

      <Box>
        <Text bold>Priority: </Text>
        <Text color={prioColor}>{PRIORITY_SYMBOLS[ticket.priority]} {ticket.priority}</Text>
      </Box>

      {ticket.tags.length > 0 && (
        <Box>
          <Text bold>Tags:     </Text>
          {ticket.tags.map((tag) => (
            <Text key={tag} color={colors.tag}>[{tag}] </Text>
          ))}
        </Box>
      )}

      {ticket.description ? (
        <Box marginTop={1} flexDirection="column">
          <Text bold>Description:</Text>
          <Text>{ticket.description}</Text>
        </Box>
      ) : null}

      <Box marginTop={1}>
        <Text dimColor>Created: {formatRelativeDate(ticket.created_at)}  ·  Updated: {formatRelativeDate(ticket.updated_at)}</Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Press </Text>
        <Text bold color={colors.activeBorder}>Esc</Text>
        <Text dimColor> to go back, </Text>
        <Text bold color={colors.activeBorder}>m/d</Text>
        <Text dimColor> to move, </Text>
        <Text bold color={colors.activeBorder}>x</Text>
        <Text dimColor> to delete</Text>
      </Box>
    </Box>
  );
}
