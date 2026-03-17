import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  useInput((input, key) => {
    if (input === 'y' || input === 'Y') onConfirm();
    else if (input === 'n' || input === 'N' || key.escape) onCancel();
  });

  return (
    <Box paddingX={2} paddingY={1} borderStyle="round" borderColor="#ef4444">
      <Text bold color="#ef4444">
        {message}{' '}
      </Text>
      <Text>
        [<Text bold color={colors.activeBorder}>y</Text>/
        <Text bold>n</Text>]
      </Text>
    </Box>
  );
}
