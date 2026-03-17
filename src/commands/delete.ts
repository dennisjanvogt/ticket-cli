import { deleteTicket } from '../store.js';

export function cmdDelete(args: string[]): void {
  const idStr = args[0];
  if (!idStr) {
    console.error('Usage: ticket delete <id>');
    process.exit(1);
  }

  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    console.error('Invalid ticket ID');
    process.exit(1);
  }

  const ok = deleteTicket(id);
  if (!ok) {
    console.error(`Ticket #${id} not found`);
    process.exit(1);
  }

  console.log(`#${id} deleted`);
}
