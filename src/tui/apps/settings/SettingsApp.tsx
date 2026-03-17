import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { useTerminalSize } from '../../hooks/useTerminalSize.js';
import { getSetting, setSetting, listSettings } from '../../../store.js';
import { colors } from '../../theme.js';
import type { AppSetting } from '../../../types.js';

interface SettingsAppProps {
  onBack: () => void;
}

const KNOWN_SETTINGS = [
  { key: 'poll_interval', label: 'Poll Interval (ms)', default: '300' },
  { key: 'default_priority', label: 'Default Priority', default: 'medium' },
  { key: 'default_column', label: 'Default Column', default: 'backlog' },
  { key: 'date_format', label: 'Date Format', default: 'de-DE' },
  { key: 'theme', label: 'Theme', default: 'dark' },
];

export function SettingsApp({ onBack }: SettingsAppProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const loaded: Record<string, string> = {};
    for (const setting of KNOWN_SETTINGS) {
      loaded[setting.key] = getSetting(setting.key, setting.default);
    }
    setValues(loaded);
  }, []);

  useInput((input, key) => {
    if (editing) {
      if (key.return) {
        const settingKey = KNOWN_SETTINGS[selectedIndex].key;
        setSetting(settingKey, editValue);
        setValues((prev) => ({ ...prev, [settingKey]: editValue }));
        setEditing(false);
        return;
      }
      if (key.escape) {
        setEditing(false);
        return;
      }
      if (key.backspace || key.delete) {
        setEditValue((prev) => prev.slice(0, -1));
        return;
      }
      if (input && !key.ctrl && !key.meta) {
        setEditValue((prev) => prev + input);
      }
      return;
    }

    if (key.escape) {
      onBack();
      return;
    }
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      return;
    }
    if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(KNOWN_SETTINGS.length - 1, prev + 1));
      return;
    }
    if (key.return) {
      const settingKey = KNOWN_SETTINGS[selectedIndex].key;
      setEditValue(values[settingKey] ?? KNOWN_SETTINGS[selectedIndex].default);
      setEditing(true);
    }
  });

  const labelWidth = Math.max(...KNOWN_SETTINGS.map((s) => s.label.length)) + 2;

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color={colors.headerFg}>
          Settings
        </Text>
      </Box>

      <Box flexDirection="column">
        {KNOWN_SETTINGS.map((setting, index) => {
          const isSelected = index === selectedIndex;
          const marker = isSelected ? '▸' : ' ';
          const currentValue = values[setting.key] ?? setting.default;
          const isEditing = isSelected && editing;

          return (
            <Box key={setting.key}>
              <Text color={isSelected ? colors.selectedMarker : undefined}>
                {marker}{' '}
              </Text>
              <Text bold={isSelected}>
                {setting.label.padEnd(labelWidth)}
              </Text>
              {isEditing ? (
                <Text color={colors.activeBorder}>
                  {editValue}
                  <Text dimColor>│</Text>
                </Text>
              ) : (
                <Text dimColor={!isSelected}>{currentValue}</Text>
              )}
            </Box>
          );
        })}
      </Box>

      <Box marginTop={1}>
        <Text color={colors.footerDim}>
          {editing
            ? 'Enter Save  Esc Cancel'
            : '↑↓ Navigate  Enter Edit  Esc Back'}
        </Text>
      </Box>
    </Box>
  );
}
