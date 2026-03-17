import { listTickets } from '../store.js';
import type { Column } from '../types.js';
import { COLUMNS, COLUMN_LABELS } from '../types.js';
import { PRIORITY_BADGE } from '../utils/format.js';

export function cmdList(args: string[]): void {
  let column: Column | undefined;
  let json = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--column' && args[i + 1]) {
      const val = args[++i] as Column;
      if (!COLUMNS.includes(val)) {
        console.error(`Invalid column: ${val}. Use: ${COLUMNS.join(', ')}`);
        process.exit(1);
      }
      column = val;
    } else if (args[i] === '--json') {
      json = true;
    }
  }

  const tickets = listTickets(column);

  if (json) {
    console.log(JSON.stringify(tickets, null, 2));
    return;
  }

  if (tickets.length === 0) {
    console.log('No tickets found.');
    return;
  }

  for (const t of tickets) {
    const badge = PRIORITY_BADGE[t.priority];
    const tags = t.tags.length ? ` [${t.tags.join(', ')}]` : '';
    console.log(`${badge} #${t.id}  ${t.title}  (${COLUMN_LABELS[t.column]})${tags}`);
  }
}
