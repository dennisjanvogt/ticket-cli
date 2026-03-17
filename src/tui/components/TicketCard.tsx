import { Box, Text } from 'ink';
import type { Ticket } from '../../types.js';
import { colors, PRIORITY_SYMBOLS } from '../theme.js';
import { truncate } from '../../utils/format.js';

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
      {ticket.tags.length > 0 && (
        <Box marginLeft={4}>
          {ticket.tags.map((tag) => (
            <Text key={tag} dimColor color={colors.tag}>
              [{tag}]{' '}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
}
