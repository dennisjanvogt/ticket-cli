import { Box, Text } from 'ink';
import { TextInput } from '@inkjs/ui';
import { colors } from '../theme.js';

interface Props {
  onSubmit: (query: string) => void;
  onCancel: () => void;
}

export function SearchBar({ onSubmit, onCancel }: Props) {
  return (
    <Box paddingX={1}>
      <Text bold color={colors.activeBorder}>
        /{' '}
      </Text>
      <TextInput
        placeholder="Search tickets..."
        onSubmit={(value) => {
          if (!value.trim()) {
            onCancel();
          } else {
            onSubmit(value.trim());
          }
        }}
      />
    </Box>
  );
}
