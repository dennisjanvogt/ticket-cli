import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { useAuth } from '../../contexts/AuthContext.js';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';
import { usePolledQuery } from '../../hooks/usePolledQuery.js';
import { listTimeEntries, deleteTimeEntry, listProjects, getProject } from '../../../store.js';
import { TimeEntryForm } from './TimeEntryForm.js';
import { colors } from '../../theme.js';
import type { TimeEntry } from '../../../types.js';

interface TimeTrackingAppProps {
  onBack: () => void;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

export function TimeTrackingApp({ onBack }: TimeTrackingAppProps): React.ReactElement {
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const auth = useAuth();
  const { columns } = useTerminalSize();

  const todayStr = new Date().toISOString().slice(0, 10);

  const entries = usePolledQuery(
    useCallback(() => listTimeEntries({ user_id: auth.user!.id, date: todayStr }), [auth.user, todayStr]),
  );

  const totalMinutes = entries.reduce((sum, e) => sum + e.duration_minutes, 0);

  useInput((input, key) => {
    if (mode !== 'list') return;

    if (key.escape) {
      onBack();
      return;
    }

    if (input === 'n') {
      setMode('create');
      return;
    }

    if (input === 'x' && entries.length > 0) {
      deleteTimeEntry(entries[selectedIndex].id);
      if (selectedIndex >= entries.length - 1 && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      }
      return;
    }

    if (key.upArrow && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
    if (key.downArrow && selectedIndex < entries.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  });

  if (mode === 'create') {
    return (
      <TimeEntryForm
        onSubmit={() => setMode('list')}
        onCancel={() => setMode('list')}
      />
    );
  }

  const colDuration = 10;
  const colProject = 20;
  const colTicket = 10;
  const colDesc = Math.max(20, columns - colDuration - colProject - colTicket - 10);

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color={colors.headerFg} backgroundColor={colors.headerBg}>
          {' Time Tracking '}
        </Text>
        <Text color={colors.footerDim}>{`  ${todayStr}`}</Text>
      </Box>

      {/* Table Header */}
      <Box>
        <Box width={3}>
          <Text> </Text>
        </Box>
        <Box width={colDuration}>
          <Text bold dimColor>Duration</Text>
        </Box>
        <Box width={colProject}>
          <Text bold dimColor>Project</Text>
        </Box>
        <Box width={colTicket}>
          <Text bold dimColor>Ticket</Text>
        </Box>
        <Box width={colDesc}>
          <Text bold dimColor>Description</Text>
        </Box>
      </Box>

      {/* Table Rows */}
      {entries.length === 0 ? (
        <Box marginY={1}>
          <Text dimColor>No time entries for today. Press n to create one.</Text>
        </Box>
      ) : (
        entries.map((entry, i) => {
          const isSelected = i === selectedIndex;
          return (
            <Box key={entry.id}>
              <Box width={3}>
                <Text color={colors.selectedMarker}>{isSelected ? '\u25B8 ' : '  '}</Text>
              </Box>
              <Box width={colDuration}>
                <Text color={isSelected ? colors.activeBorder : undefined}>
                  {formatDuration(entry.duration_minutes)}
                </Text>
              </Box>
              <Box width={colProject}>
                <Text color={isSelected ? colors.activeBorder : undefined}>
                  {entry.project_name ?? '-'}
                </Text>
              </Box>
              <Box width={colTicket}>
                <Text color={isSelected ? colors.activeBorder : undefined}>
                  {entry.ticket_id != null ? `#${entry.ticket_id}` : '-'}
                </Text>
              </Box>
              <Box width={colDesc}>
                <Text color={isSelected ? colors.activeBorder : undefined}>
                  {entry.description || '-'}
                </Text>
              </Box>
            </Box>
          );
        })
      )}

      {/* Total */}
      <Box marginTop={1}>
        <Box width={3}>
          <Text> </Text>
        </Box>
        <Box width={colDuration}>
          <Text bold color={colors.success}>{formatDuration(totalMinutes)}</Text>
        </Box>
        <Text bold color={colors.success}>Total</Text>
      </Box>

      {/* Footer */}
      <Box marginTop={1}>
        <Text color={colors.footerDim}>
          n: New  x: Delete  Esc: Back
        </Text>
      </Box>
    </Box>
  );
}
