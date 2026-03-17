import { Box, Text } from 'ink';
import { TextInput } from '@inkjs/ui';
import { colors } from '../theme.js';
import type { Ticket } from '../../types.js';

interface Props {
  ticket: Ticket;
  onSubmit: (newTitle: string) => void;
  onCancel: () => void;
}

export function InlineEdit({ ticket, onSubmit, onCancel }: Props) {
  return (
    <Box paddingX={1}>
      <Text bold color={colors.activeBorder}>
        Edit #{ticket.id}:{' '}
      </Text>
      <TextInput
        defaultValue={ticket.title}
        onSubmit={(value) => {
          const trimmed = value.trim();
          if (trimmed) {
            onSubmit(trimmed);
          } else {
            onCancel();
          }
        }}
      />
    </Box>
  );
}
