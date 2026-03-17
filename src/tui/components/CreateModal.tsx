import { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { TextInput } from '@inkjs/ui';
import { colors } from '../theme.js';
import type { Column, Priority } from '../../types.js';
import { COLUMNS, COLUMN_LABELS, PRIORITIES } from '../../types.js';

interface Props {
  onSubmit: (data: {
    title: string;
    description: string;
    column: Column;
    priority: Priority;
    tags: string[];
    due_date: string | null;
  }) => void;
  onCancel: () => void;
}

type Field = 'title' | 'description' | 'column' | 'priority' | 'due' | 'tags';
const FIELDS: Field[] = ['title', 'description', 'column', 'priority', 'due', 'tags'];

export function CreateModal({ onSubmit, onCancel }: Props) {
  const [field, setField] = useState<Field>('title');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnIdx, setColumnIdx] = useState(0);
  const [priorityIdx, setPriorityIdx] = useState(2); // medium
  const [dueStr, setDueStr] = useState('');
  const [tagsStr, setTagsStr] = useState('');

  const fieldIdx = FIELDS.indexOf(field);

  useInput((_input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (field === 'column') {
      if (key.leftArrow) setColumnIdx((i) => Math.max(0, i - 1));
      if (key.rightArrow) setColumnIdx((i) => Math.min(COLUMNS.length - 1, i + 1));
      if (key.tab || key.downArrow) setField(FIELDS[fieldIdx + 1]!);
      if (key.upArrow && fieldIdx > 0) setField(FIELDS[fieldIdx - 1]!);
      if (key.return && fieldIdx < FIELDS.length - 1) setField(FIELDS[fieldIdx + 1]!);
    } else if (field === 'priority') {
      if (key.leftArrow) setPriorityIdx((i) => Math.max(0, i - 1));
      if (key.rightArrow) setPriorityIdx((i) => Math.min(PRIORITIES.length - 1, i + 1));
      if (key.tab || key.downArrow) setField(FIELDS[fieldIdx + 1]!);
      if (key.upArrow && fieldIdx > 0) setField(FIELDS[fieldIdx - 1]!);
      if (key.return && fieldIdx < FIELDS.length - 1) setField(FIELDS[fieldIdx + 1]!);
    }
  });

  function handleSubmit(currentField: Field, value: string) {
    if (currentField === 'title') setTitle(value);
    if (currentField === 'description') setDescription(value);
    if (currentField === 'due') setDueStr(value);
    if (currentField === 'tags') setTagsStr(value);

    const nextIdx = FIELDS.indexOf(currentField) + 1;
    if (nextIdx < FIELDS.length) {
      setField(FIELDS[nextIdx]!);
    } else {
      const finalTitle = currentField === 'title' ? value : title;
      const finalDesc = currentField === 'description' ? value : description;
      const finalDue = currentField === 'due' ? value : dueStr;
      const finalTags = currentField === 'tags' ? value : tagsStr;
      if (!finalTitle.trim()) return;
      onSubmit({
        title: finalTitle.trim(),
        description: finalDesc.trim(),
        column: COLUMNS[columnIdx]!,
        priority: PRIORITIES[priorityIdx]!,
        due_date: finalDue.trim() || null,
        tags: finalTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
    }
  }

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1} borderStyle="round" borderColor={colors.activeBorder}>
      <Box marginBottom={1}>
        <Text bold> New Ticket </Text>
      </Box>

      <Box>
        <Text bold color={field === 'title' ? colors.activeBorder : undefined}>Title:    </Text>
        {field === 'title' ? (
          <TextInput defaultValue={title} onSubmit={(v) => handleSubmit('title', v)} />
        ) : (
          <Text>{title || '-'}</Text>
        )}
      </Box>

      <Box>
        <Text bold color={field === 'description' ? colors.activeBorder : undefined}>Desc:     </Text>
        {field === 'description' ? (
          <TextInput defaultValue={description} onSubmit={(v) => handleSubmit('description', v)} />
        ) : (
          <Text>{description || '-'}</Text>
        )}
      </Box>

      <Box>
        <Text bold color={field === 'column' ? colors.activeBorder : undefined}>Column:   </Text>
        {COLUMNS.map((col, i) => (
          <Text key={col} bold={i === columnIdx} color={i === columnIdx && field === 'column' ? colors.activeBorder : undefined}>
            {i === columnIdx ? `[${COLUMN_LABELS[col]}]` : ` ${COLUMN_LABELS[col]} `}{' '}
          </Text>
        ))}
      </Box>

      <Box>
        <Text bold color={field === 'priority' ? colors.activeBorder : undefined}>Priority: </Text>
        {PRIORITIES.map((p, i) => (
          <Text key={p} bold={i === priorityIdx} color={i === priorityIdx && field === 'priority' ? colors.activeBorder : undefined}>
            {i === priorityIdx ? `[${p}]` : ` ${p} `}{' '}
          </Text>
        ))}
      </Box>

      <Box>
        <Text bold color={field === 'due' ? colors.activeBorder : undefined}>Due:      </Text>
        {field === 'due' ? (
          <TextInput defaultValue={dueStr} placeholder="YYYY-MM-DD (optional)" onSubmit={(v) => handleSubmit('due', v)} />
        ) : (
          <Text dimColor>{dueStr || '-'}</Text>
        )}
      </Box>

      <Box>
        <Text bold color={field === 'tags' ? colors.activeBorder : undefined}>Tags:     </Text>
        {field === 'tags' ? (
          <TextInput defaultValue={tagsStr} placeholder="comma separated" onSubmit={(v) => handleSubmit('tags', v)} />
        ) : (
          <Text dimColor>{tagsStr || '-'}</Text>
        )}
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Enter: next  ·  Esc: cancel  ·  ←→: select</Text>
      </Box>
    </Box>
  );
}
