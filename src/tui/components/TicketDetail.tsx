import { Box, Text } from 'ink';
import type { Ticket, Subtask } from '../../types.js';
import { COLUMN_LABELS } from '../../types.js';
import { colors, PRIORITY_SYMBOLS } from '../theme.js';
import { formatRelativeDate, formatDueDate, progressBar } from '../../utils/format.js';

interface Props {
  ticket: Ticket;
  subtasks: Subtask[];
  selectedSubtask: number;
}

export function TicketDetail({ ticket, subtasks, selectedSubtask }: Props) {
  const prioColor = colors.priority[ticket.priority];
  const due = formatDueDate(ticket.due_date);

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor={colors.activeBorder}>
      <Box marginBottom={1}>
        <Text bold>Ticket #{ticket.id}</Text>
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

      {due && (
        <Box>
          <Text bold>Due:      </Text>
          <Text color={due.color}>{ticket.due_date} ({due.text})</Text>
        </Box>
      )}

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

      {subtasks.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Box>
            <Text bold>Subtasks </Text>
            <Text dimColor>[{subtasks.filter((s) => s.done).length}/{subtasks.length}] </Text>
            <Text color={colors.success}>{progressBar(subtasks.filter((s) => s.done).length, subtasks.length)}</Text>
          </Box>
          {subtasks.map((s, i) => (
            <Box key={s.id}>
              <Text color={i === selectedSubtask ? colors.activeBorder : undefined}>
                {i === selectedSubtask ? ' ▸ ' : '   '}
              </Text>
              <Text color={s.done ? colors.success : undefined} dimColor={s.done} strikethrough={s.done}>
                {s.done ? '☑' : '☐'} {s.title}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Created: {formatRelativeDate(ticket.created_at)}  ·  Updated: {formatRelativeDate(ticket.updated_at)}</Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>
          <Text bold color={colors.activeBorder}>Esc</Text> back  <Text bold color={colors.activeBorder}>m/d</Text> move  <Text bold color={colors.activeBorder}>p</Text> priority  <Text bold color={colors.activeBorder}>x</Text> delete  <Text bold color={colors.activeBorder}>t</Text> toggle  <Text bold color={colors.activeBorder}>a</Text> add subtask
        </Text>
      </Box>
    </Box>
  );
}
