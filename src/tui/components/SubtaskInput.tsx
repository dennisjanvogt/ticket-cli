import { Box, Text } from 'ink';
import { TextInput } from '@inkjs/ui';
import { colors } from '../theme.js';

interface Props {
  ticketId: number;
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

export function SubtaskInput({ ticketId, onSubmit, onCancel }: Props) {
  return (
    <Box paddingX={1}>
      <Text bold color={colors.activeBorder}>
        + Subtask for #{ticketId}:{' '}
      </Text>
      <TextInput
        placeholder="subtask title"
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
