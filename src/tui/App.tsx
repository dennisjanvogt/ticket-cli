import { useState, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import type { Column as ColumnType, Priority, Ticket } from '../types.js';
import { COLUMNS } from '../types.js';
import { addTicket, moveTicket, deleteTicket } from '../store.js';
import { PRIORITY_ORDER } from '../utils/format.js';
import { useStore } from './hooks/useStore.js';
import { useTerminalSize } from './hooks/useTerminalSize.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { Board } from './components/Board.js';
import { TicketDetail } from './components/TicketDetail.js';
import { CreateModal } from './components/CreateModal.js';
import { SearchBar } from './components/SearchBar.js';
import { ConfirmDialog } from './components/ConfirmDialog.js';

type Mode = 'board' | 'detail' | 'create' | 'search' | 'confirm-delete';

export function App() {
  const store = useStore();
  const { columns: termWidth, rows: termHeight } = useTerminalSize();
  const { exit } = useApp();

  const [mode, setMode] = useState<Mode>('board');
  const [activeColumn, setActiveColumn] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<Record<ColumnType, number>>({
    backlog: 0,
    todo: 0,
    'in-progress': 0,
    done: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null);

  const getFilteredTickets = useCallback(() => {
    if (!searchQuery) return store.tickets;
    const q = searchQuery.toLowerCase();
    return store.tickets.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [store.tickets, searchQuery]);

  const getSelectedTicket = useCallback((): Ticket | null => {
    const col = COLUMNS[activeColumn]!;
    const tickets = getFilteredTickets()
      .filter((t) => t.column === col)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    const idx = selectedIndices[col];
    return tickets[idx] ?? null;
  }, [activeColumn, selectedIndices, getFilteredTickets]);

  const clampIndex = useCallback(
    (col: ColumnType) => {
      const count = getFilteredTickets().filter((t) => t.column === col).length;
      setSelectedIndices((prev) => ({
        ...prev,
        [col]: Math.max(0, Math.min(prev[col], count - 1)),
      }));
    },
    [getFilteredTickets]
  );

  useInput((input, key) => {
    if (mode !== 'board' && mode !== 'detail') return;

    if (input === 'q') {
      exit();
      return;
    }

    if (mode === 'detail') {
      if (key.escape) {
        setMode('board');
        setDetailTicket(null);
        return;
      }

      if (detailTicket) {
        if (input === 'm') {
          const colIdx = COLUMNS.indexOf(detailTicket.column);
          if (colIdx < COLUMNS.length - 1) {
            const result = moveTicket(detailTicket.id, COLUMNS[colIdx + 1]!);
            if (result) setDetailTicket(result);
          }
          return;
        }
        if (input === 'd') {
          const colIdx = COLUMNS.indexOf(detailTicket.column);
          if (colIdx > 0) {
            const result = moveTicket(detailTicket.id, COLUMNS[colIdx - 1]!);
            if (result) setDetailTicket(result);
          }
          return;
        }
        if (input === 'x') {
          setDeleteTarget(detailTicket);
          setMode('confirm-delete');
          return;
        }
      }
      return;
    }

    // Board mode
    if (key.leftArrow) {
      setActiveColumn((i) => Math.max(0, i - 1));
      return;
    }
    if (key.rightArrow) {
      setActiveColumn((i) => Math.min(COLUMNS.length - 1, i + 1));
      return;
    }

    const col = COLUMNS[activeColumn]!;

    if (key.upArrow) {
      setSelectedIndices((prev) => ({
        ...prev,
        [col]: Math.max(0, prev[col] - 1),
      }));
      return;
    }
    if (key.downArrow) {
      const count = getFilteredTickets().filter((t) => t.column === col).length;
      setSelectedIndices((prev) => ({
        ...prev,
        [col]: Math.min(count - 1, prev[col] + 1),
      }));
      return;
    }

    if (key.return) {
      const ticket = getSelectedTicket();
      if (ticket) {
        setDetailTicket(ticket);
        setMode('detail');
      }
      return;
    }

    if (input === 'n') {
      setMode('create');
      return;
    }

    if (input === '/') {
      setMode('search');
      return;
    }

    if (input === 'm') {
      const ticket = getSelectedTicket();
      if (ticket) {
        const colIdx = COLUMNS.indexOf(ticket.column);
        if (colIdx < COLUMNS.length - 1) {
          moveTicket(ticket.id, COLUMNS[colIdx + 1]!);
          clampIndex(col);
        }
      }
      return;
    }

    if (input === 'd') {
      const ticket = getSelectedTicket();
      if (ticket) {
        const colIdx = COLUMNS.indexOf(ticket.column);
        if (colIdx > 0) {
          moveTicket(ticket.id, COLUMNS[colIdx - 1]!);
          clampIndex(col);
        }
      }
      return;
    }

    if (input === 'x') {
      const ticket = getSelectedTicket();
      if (ticket) {
        setDeleteTarget(ticket);
        setMode('confirm-delete');
      }
      return;
    }

    if (key.escape) {
      if (searchQuery) {
        setSearchQuery('');
      }
      return;
    }
  });

  const filteredTickets = getFilteredTickets();

  if (mode === 'create') {
    return (
      <Box flexDirection="column" width="100%" height="100%">
        <Header store={store} />
        <Box flexGrow={1} alignItems="center" justifyContent="center">
          <CreateModal
            onSubmit={(data) => {
              addTicket(data);
              setMode('board');
            }}
            onCancel={() => setMode('board')}
          />
        </Box>
        <Footer mode="create" />
      </Box>
    );
  }

  if (mode === 'confirm-delete' && deleteTarget) {
    return (
      <Box flexDirection="column" width="100%" height="100%">
        <Header store={store} />
        <Box flexGrow={1} alignItems="center" justifyContent="center">
          <ConfirmDialog
            message={`Delete #${deleteTarget.id} "${deleteTarget.title}"?`}
            onConfirm={() => {
              deleteTicket(deleteTarget.id);
              const col = deleteTarget.column;
              setDeleteTarget(null);
              setMode('board');
              setDetailTicket(null);
              clampIndex(col);
            }}
            onCancel={() => {
              setDeleteTarget(null);
              setMode(detailTicket ? 'detail' : 'board');
            }}
          />
        </Box>
        <Footer mode="confirm" />
      </Box>
    );
  }

  if (mode === 'detail' && detailTicket) {
    const fresh = store.tickets.find((t) => t.id === detailTicket.id);
    if (fresh && fresh !== detailTicket) setDetailTicket(fresh);

    return (
      <Box flexDirection="column" width="100%" height="100%">
        <Header store={store} />
        <Box flexGrow={1} paddingX={1}>
          <TicketDetail ticket={fresh ?? detailTicket} />
        </Box>
        <Footer mode="detail" />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" width="100%" height="100%">
      <Header store={store} />
      {mode === 'search' ? (
        <SearchBar
          onSubmit={(q) => {
            setSearchQuery(q);
            setMode('board');
          }}
          onCancel={() => setMode('board')}
        />
      ) : searchQuery ? (
        <Box paddingX={1}>
          <Text>🔍 "{searchQuery}" </Text>
          <Text dimColor>(Esc to clear)</Text>
        </Box>
      ) : null}
      <Board
        tickets={filteredTickets}
        activeColumn={activeColumn}
        selectedIndices={selectedIndices}
        termWidth={termWidth}
        termHeight={termHeight}
      />
      <Footer mode="board" />
    </Box>
  );
}
