import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { addTimeEntry, getProject, listProjects } from '../../../store.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { colors } from '../../theme.js';
import type { Project } from '../../../types.js';

interface TimeEntryFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const FIELDS = ['duration', 'ticketId', 'description', 'date'] as const;
type Field = (typeof FIELDS)[number];

const FIELD_LABELS: Record<Field, string> = {
  duration: 'Duration (HH:MM)',
  ticketId: 'Ticket ID (optional)',
  description: 'Description',
  date: 'Date (YYYY-MM-DD)',
};

function parseDuration(input: string): number | null {
  const match = input.match(/^(\d+):(\d{1,2})$/);
  if (match) {
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }
  const mins = parseInt(input, 10);
  if (!isNaN(mins) && mins > 0) return mins;
  return null;
}

export function TimeEntryForm({ onSubmit, onCancel }: TimeEntryFormProps): React.ReactElement {
  const auth = useAuth();
  const todayStr = new Date().toISOString().slice(0, 10);

  const [activeField, setActiveField] = useState(0);
  const [values, setValues] = useState<Record<Field, string>>({
    duration: '',
    ticketId: '',
    description: '',
    date: todayStr,
  });
  const [error, setError] = useState<string | null>(null);

  const currentField = FIELDS[activeField];

  function updateField(char: string) {
    setValues((prev) => ({ ...prev, [currentField]: prev[currentField] + char }));
    setError(null);
  }

  function submit() {
    const minutes = parseDuration(values.duration);
    if (minutes == null) {
      setError('Invalid duration. Use HH:MM format (e.g. 1:30)');
      return;
    }

    const project = getProject();
    const ticketId = values.ticketId.trim() ? parseInt(values.ticketId, 10) : null;

    if (values.ticketId.trim() && (isNaN(ticketId!) || ticketId! <= 0)) {
      setError('Invalid ticket ID');
      return;
    }

    addTimeEntry({
      user_id: auth.user!.id,
      project_id: project.id,
      ticket_id: ticketId,
      description: values.description.trim(),
      duration_minutes: minutes,
      date: values.date || todayStr,
    });

    onSubmit();
  }

  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.tab) {
      setActiveField((prev) => (prev + 1) % FIELDS.length);
      return;
    }

    if (key.return) {
      if (activeField === FIELDS.length - 1) {
        submit();
      } else {
        setActiveField((prev) => prev + 1);
      }
      return;
    }

    if (key.ctrl && input === 's') {
      submit();
      return;
    }

    if (key.backspace || key.delete) {
      setValues((prev) => ({
        ...prev,
        [currentField]: prev[currentField].slice(0, -1),
      }));
      setError(null);
      return;
    }

    if (input && !key.ctrl && !key.meta) {
      updateField(input);
    }
  });

  return (
    <Box flexDirection="column" alignItems="center" justifyContent="center" padding={1}>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={colors.activeBorder}
        paddingX={2}
        paddingY={1}
        width={50}
      >
        <Box marginBottom={1}>
          <Text bold color={colors.headerFg} backgroundColor={colors.headerBg}>
            {' New Time Entry '}
          </Text>
        </Box>

        {FIELDS.map((field, i) => {
          const isActive = i === activeField;
          return (
            <Box key={field} marginBottom={field === 'date' ? 0 : 1}>
              <Box width={24}>
                <Text color={isActive ? colors.activeBorder : colors.inactiveBorder}>
                  {FIELD_LABELS[field]}:
                </Text>
              </Box>
              <Box>
                <Text color={isActive ? colors.activeBorder : colors.footerDim}>
                  {values[field]}
                  {isActive ? '\u2588' : ''}
                </Text>
              </Box>
            </Box>
          );
        })}

        {error && (
          <Box marginTop={1}>
            <Text color="red">{error}</Text>
          </Box>
        )}

        <Box marginTop={1}>
          <Text color={colors.footerDim}>
            Tab: Next field  Enter: Next/Submit  Ctrl+S: Save  Esc: Cancel
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
