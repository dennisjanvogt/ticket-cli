import { addTicket } from '../store.js';
import type { Column, Priority } from '../types.js';
import { COLUMNS, PRIORITIES } from '../types.js';
import { PRIORITY_BADGE } from '../utils/format.js';

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).getTime());
}

export function cmdAdd(args: string[]): void {
  const title = args[0];
  if (!title) {
    console.error('Usage: ticket add "title" [--desc "..."] [--column todo] [--priority medium] [--tag bug] [--due YYYY-MM-DD]');
    process.exit(1);
  }

  let description = '';
  let column: Column = 'backlog';
  let priority: Priority = 'medium';
  let due_date: string | null = null;
  const tags: string[] = [];

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if ((arg === '--desc' || arg === '--description') && args[i + 1]) {
      description = args[++i];
    } else if (arg === '--column' && args[i + 1]) {
      const val = args[++i] as Column;
      if (!COLUMNS.includes(val)) {
        console.error(`Invalid column: ${val}. Use: ${COLUMNS.join(', ')}`);
        process.exit(1);
      }
      column = val;
    } else if (arg === '--priority' && args[i + 1]) {
      const val = args[++i] as Priority;
      if (!(PRIORITIES as readonly string[]).includes(val)) {
        console.error(`Invalid priority: ${val}. Use: ${PRIORITIES.join(', ')}`);
        process.exit(1);
      }
      priority = val;
    } else if (arg === '--tag' && args[i + 1]) {
      tags.push(args[++i]);
    } else if (arg === '--due' && args[i + 1]) {
      const val = args[++i];
      if (!isValidDate(val)) {
        console.error(`Invalid date: ${val}. Use: YYYY-MM-DD`);
        process.exit(1);
      }
      due_date = val;
    }
  }

  const ticket = addTicket({ title, description, column, priority, tags, due_date });
  const dueStr = ticket.due_date ? ` (due ${ticket.due_date})` : '';
  console.log(`${PRIORITY_BADGE[ticket.priority]} #${ticket.id} "${ticket.title}" → ${ticket.column}${dueStr}`);
}
