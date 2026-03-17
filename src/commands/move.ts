import { moveTicket } from '../store.js';
import type { Column } from '../types.js';
import { COLUMNS, COLUMN_LABELS } from '../types.js';

export function cmdMove(args: string[]): void {
  const idStr = args[0];
  const column = args[1] as Column;

  if (!idStr || !column) {
    console.error('Usage: ticket move <id> <column>');
    process.exit(1);
  }

  if (!COLUMNS.includes(column)) {
    console.error(`Invalid column: ${column}. Use: ${COLUMNS.join(', ')}`);
    process.exit(1);
  }

  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    console.error('Invalid ticket ID');
    process.exit(1);
  }

  const ticket = moveTicket(id, column);
  if (!ticket) {
    console.error(`Ticket #${id} not found`);
    process.exit(1);
  }

  console.log(`#${ticket.id} → ${COLUMN_LABELS[ticket.column]}`);
}
