import type { Column, Priority } from '../types.js';

export const colors = {
  headerBg: '#1e40af',
  headerFg: '#ffffff',
  activeBorder: '#06b6d4',
  inactiveBorder: '#64748b',
  selectedMarker: '#06b6d4',
  footerDim: '#94a3b8',

  priority: {
    critical: '#ef4444',
    high: '#eab308',
    medium: '#3b82f6',
    low: '#6b7280',
  } satisfies Record<Priority, string>,

  column: {
    backlog: '#94a3b8',
    todo: '#3b82f6',
    'in-progress': '#f59e0b',
    done: '#22c55e',
  } satisfies Record<Column, string>,

  tag: '#06b6d4',
};

export const PRIORITY_SYMBOLS: Record<Priority, string> = {
  critical: '◆',
  high: '●',
  medium: '○',
  low: '·',
};
