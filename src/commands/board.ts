import chalk from 'chalk';
import { listTickets } from '../store.js';
import { COLUMNS, COLUMN_LABELS } from '../types.js';
import type { Column, Ticket } from '../types.js';
import { truncate, PRIORITY_BADGE, PRIORITY_ORDER } from '../utils/format.js';

export function cmdBoard(): void {
  const tickets = listTickets();
  const grouped: Record<Column, Ticket[]> = {
    backlog: [],
    todo: [],
    'in-progress': [],
    done: [],
  };

  for (const t of tickets) {
    grouped[t.column].push(t);
  }

  // Sort by priority
  for (const col of COLUMNS) {
    grouped[col].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }

  const termWidth = process.stdout.columns || 80;
  const colWidth = Math.max(18, Math.floor((termWidth - COLUMNS.length - 1) / COLUMNS.length));
  const divider = '│';

  // Header
  const header = COLUMNS.map((col) => {
    const label = ` ${COLUMN_LABELS[col]} (${grouped[col].length}) `;
    return chalk.bold.white.bgBlue(label.padEnd(colWidth));
  }).join(divider);
  console.log(header);
  console.log(COLUMNS.map(() => '─'.repeat(colWidth)).join('┼'));

  // Rows
  const maxRows = Math.max(...COLUMNS.map((col) => grouped[col].length), 1);
  for (let i = 0; i < maxRows; i++) {
    const row = COLUMNS.map((col) => {
      const t = grouped[col][i];
      if (!t) return ' '.repeat(colWidth);
      const badge = PRIORITY_BADGE[t.priority];
      const tags = t.tags.length ? chalk.dim.cyan(` [${t.tags[0]}]`) : '';
      const idStr = chalk.dim(`#${t.id}`);
      const titleStr = truncate(t.title, colWidth - 8);
      // We need to account for ANSI codes in width calculation
      const visible = `${badge} ${idStr} ${titleStr}${tags}`;
      return ` ${visible}`.padEnd(colWidth + 30).slice(0, colWidth + 30);
    }).join(divider);
    console.log(row);
  }

  console.log(chalk.dim(`\n${tickets.length} ticket(s) total`));
}
