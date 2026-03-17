import { Box } from 'ink';
import type { Ticket, Column as ColumnType } from '../../types.js';
import { COLUMNS } from '../../types.js';
import { Column } from './Column.js';

interface Props {
  tickets: Ticket[];
  activeColumn: number;
  selectedIndices: Record<ColumnType, number>;
  termWidth: number;
  termHeight: number;
}

export function Board({ tickets, activeColumn, selectedIndices, termWidth, termHeight }: Props) {
  const colWidth = Math.max(20, Math.floor((termWidth - 2) / COLUMNS.length));
  // Header(1) + Footer(2) = 3 lines reserved from total
  const boardHeight = Math.max(6, termHeight - 3);

  const grouped: Record<ColumnType, Ticket[]> = {
    backlog: [],
    todo: [],
    'in-progress': [],
    done: [],
  };

  for (const t of tickets) {
    grouped[t.column].push(t);
  }

  return (
    <Box flexDirection="row" height={boardHeight} paddingX={1}>
      {COLUMNS.map((col, i) => (
        <Column
          key={col}
          column={col}
          tickets={grouped[col]}
          isActive={i === activeColumn}
          selectedIndex={selectedIndices[col]}
          width={colWidth}
          maxHeight={boardHeight}
        />
      ))}
    </Box>
  );
}
