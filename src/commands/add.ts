import { addTicket } from '../store.js';
import type { Column, Priority } from '../types.js';
import { COLUMNS } from '../types.js';
import { PRIORITY_BADGE } from '../utils/format.js';

const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;

export function cmdAdd(args: string[]): void {
  const title = args[0];
  if (!title) {
    console.error('Usage: ticket add "title" [--desc "..."] [--column todo] [--priority medium] [--tag bug]');
    process.exit(1);
  }

  let description = '';
  let column: Column = 'backlog';
  let priority: Priority = 'medium';
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
    }
  }

  const ticket = addTicket({ title, description, column, priority, tags });
  console.log(`${PRIORITY_BADGE[ticket.priority]} #${ticket.id} "${ticket.title}" → ${ticket.column}`);
}
