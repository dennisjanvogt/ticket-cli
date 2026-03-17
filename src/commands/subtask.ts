import { getSubtasks, addSubtask, toggleSubtask, deleteSubtask, getTicket } from '../store.js';

export function cmdSubtask(args: string[]): void {
  const action = args[0];

  if (action === 'add') {
    const ticketId = parseInt(args[1], 10);
    const title = args[2];
    if (isNaN(ticketId) || !title) {
      console.error('Usage: ticket subtask add <ticket_id> "title"');
      process.exit(1);
    }
    if (!getTicket(ticketId)) {
      console.error(`Ticket #${ticketId} not found`);
      process.exit(1);
    }
    const s = addSubtask(ticketId, title);
    console.log(`☐ Added subtask #${s.id} to ticket #${ticketId}`);
    return;
  }

  if (action === 'toggle') {
    const id = parseInt(args[1], 10);
    if (isNaN(id)) {
      console.error('Usage: ticket subtask toggle <subtask_id>');
      process.exit(1);
    }
    const s = toggleSubtask(id);
    if (!s) {
      console.error(`Subtask #${id} not found`);
      process.exit(1);
    }
    console.log(`${s.done ? '☑' : '☐'} ${s.title}`);
    return;
  }

  if (action === 'rm' || action === 'remove') {
    const id = parseInt(args[1], 10);
    if (isNaN(id)) {
      console.error('Usage: ticket subtask rm <subtask_id>');
      process.exit(1);
    }
    if (!deleteSubtask(id)) {
      console.error(`Subtask #${id} not found`);
      process.exit(1);
    }
    console.log(`Subtask #${id} deleted`);
    return;
  }

  if (action === 'list') {
    const ticketId = parseInt(args[1], 10);
    if (isNaN(ticketId)) {
      console.error('Usage: ticket subtask list <ticket_id>');
      process.exit(1);
    }
    const subtasks = getSubtasks(ticketId);
    if (subtasks.length === 0) {
      console.log('No subtasks.');
      return;
    }
    const done = subtasks.filter((s) => s.done).length;
    console.log(`[${done}/${subtasks.length}]`);
    for (const s of subtasks) {
      console.log(`  ${s.done ? '☑' : '☐'} #${s.id} ${s.title}`);
    }
    return;
  }

  console.error('Usage: ticket subtask <add|toggle|rm|list> ...');
  process.exit(1);
}
