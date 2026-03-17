import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface AppCardProps {
  icon: string;
  label: string;
  selected: boolean;
}

export function AppCard({ icon, label, selected }: AppCardProps): React.ReactElement {
  return (
    <Box
      borderStyle="round"
      borderColor={selected ? colors.activeBorder : colors.inactiveBorder}
      width={24}
      height={3}
      alignItems="center"
      justifyContent="center"
    >
      <Text>
        {icon} <Text bold={selected}>{label}</Text>
      </Text>
    </Box>
  );
}
