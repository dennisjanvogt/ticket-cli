import { editTicket } from '../store.js';
import type { Column, Priority } from '../types.js';
import { COLUMNS } from '../types.js';

export function cmdEdit(args: string[]): void {
  const idStr = args[0];
  if (!idStr) {
    console.error('Usage: ticket edit <id> [--title "..."] [--desc "..."] [--priority ...] [--column ...] [--tag ...] [--due YYYY-MM-DD|none]');
    process.exit(1);
  }

  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    console.error('Invalid ticket ID');
    process.exit(1);
  }

  const updates: {
    title?: string;
    description?: string;
    priority?: Priority;
    column?: Column;
    tags?: string[];
    due_date?: string | null;
  } = {};

  const tags: string[] = [];
  let hasTags = false;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--title' && args[i + 1]) {
      updates.title = args[++i];
    } else if ((arg === '--desc' || arg === '--description') && args[i + 1]) {
      updates.description = args[++i];
    } else if (arg === '--priority' && args[i + 1]) {
      updates.priority = args[++i] as Priority;
    } else if (arg === '--column' && args[i + 1]) {
      const val = args[++i] as Column;
      if (!COLUMNS.includes(val)) {
        console.error(`Invalid column: ${val}. Use: ${COLUMNS.join(', ')}`);
        process.exit(1);
      }
      updates.column = val;
    } else if (arg === '--tag' && args[i + 1]) {
      tags.push(args[++i]);
      hasTags = true;
    } else if (arg === '--due' && args[i + 1]) {
      const val = args[++i];
      if (val === 'none' || val === 'clear') {
        updates.due_date = null;
      } else {
        updates.due_date = val;
      }
    }
  }

  if (hasTags) updates.tags = tags;

  const ticket = editTicket(id, updates);
  if (!ticket) {
    console.error(`Ticket #${id} not found`);
    process.exit(1);
  }

  console.log(`#${ticket.id} updated: "${ticket.title}"`);
}
