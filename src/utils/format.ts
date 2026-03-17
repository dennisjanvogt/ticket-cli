import type { Priority } from '../types.js';

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export function formatRelativeDate(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export function formatDueDate(due: string | null): { text: string; color: string } | null {
  if (!due) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(due);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  const days = Math.round(diffMs / 86400000);

  if (days < 0) return { text: `${Math.abs(days)}d overdue`, color: '#ef4444' };
  if (days === 0) return { text: 'today', color: '#ef4444' };
  if (days <= 3) return { text: `in ${days}d`, color: '#eab308' };
  return { text: `in ${days}d`, color: '#6b7280' };
}

export function progressBar(done: number, total: number, width: number = 8): string {
  if (total === 0) return '';
  const filled = Math.round((done / total) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

export const PRIORITY_BADGE: Record<Priority, string> = {
  critical: '\x1b[31m◆\x1b[0m',
  high: '\x1b[33m●\x1b[0m',
  medium: '\x1b[34m○\x1b[0m',
  low: '\x1b[90m·\x1b[0m',
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};
