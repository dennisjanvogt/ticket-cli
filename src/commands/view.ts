import { getTicket } from '../store.js';
import { COLUMN_LABELS } from '../types.js';
import { PRIORITY_BADGE, formatRelativeDate } from '../utils/format.js';

export function cmdView(args: string[]): void {
  const idStr = args[0];
  if (!idStr) {
    console.error('Usage: ticket view <id>');
    process.exit(1);
  }

  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    console.error('Invalid ticket ID');
    process.exit(1);
  }

  const t = getTicket(id);
  if (!t) {
    console.error(`Ticket #${id} not found`);
    process.exit(1);
  }

  console.log(`┌─ Ticket #${t.id} ──────────────────────`);
  console.log(`│ Title:    ${t.title}`);
  console.log(`│ Column:   ${COLUMN_LABELS[t.column]}`);
  console.log(`│ Priority: ${PRIORITY_BADGE[t.priority]} ${t.priority}`);
  if (t.tags.length) {
    console.log(`│ Tags:     ${t.tags.map((tag) => `[${tag}]`).join(' ')}`);
  }
  if (t.description) {
    console.log(`│ Desc:     ${t.description}`);
  }
  console.log(`│ Created:  ${formatRelativeDate(t.created_at)}`);
  console.log(`│ Updated:  ${formatRelativeDate(t.updated_at)}`);
  console.log(`└──────────────────────────────────`);
}
