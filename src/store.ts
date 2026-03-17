import { readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import type { Ticket, TicketStore, Column, Priority } from './types.js';

const STORE_FILE = join(process.cwd(), '.tickets.json');

function defaultStore(): TicketStore {
  return { next_id: 1, tickets: [] };
}

export function loadStore(): TicketStore {
  if (!existsSync(STORE_FILE)) return defaultStore();
  try {
    const data = readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(data) as TicketStore;
  } catch {
    return defaultStore();
  }
}

function saveStore(store: TicketStore): void {
  const tmp = join(tmpdir(), `tickets-${randomBytes(8).toString('hex')}.json`);
  writeFileSync(tmp, JSON.stringify(store, null, 2) + '\n', 'utf-8');
  renameSync(tmp, STORE_FILE);
}

export function addTicket(opts: {
  title: string;
  description?: string;
  column?: Column;
  priority?: Priority;
  tags?: string[];
}): Ticket {
  const store = loadStore();
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: store.next_id++,
    title: opts.title,
    description: opts.description ?? '',
    column: opts.column ?? 'backlog',
    priority: opts.priority ?? 'medium',
    tags: opts.tags ?? [],
    created_at: now,
    updated_at: now,
  };
  store.tickets.push(ticket);
  saveStore(store);
  return ticket;
}

export function moveTicket(id: number, column: Column): Ticket | null {
  const store = loadStore();
  const ticket = store.tickets.find((t) => t.id === id);
  if (!ticket) return null;
  ticket.column = column;
  ticket.updated_at = new Date().toISOString();
  saveStore(store);
  return ticket;
}

export function editTicket(
  id: number,
  updates: Partial<Pick<Ticket, 'title' | 'description' | 'priority' | 'column' | 'tags'>>
): Ticket | null {
  const store = loadStore();
  const ticket = store.tickets.find((t) => t.id === id);
  if (!ticket) return null;
  if (updates.title !== undefined) ticket.title = updates.title;
  if (updates.description !== undefined) ticket.description = updates.description;
  if (updates.priority !== undefined) ticket.priority = updates.priority;
  if (updates.column !== undefined) ticket.column = updates.column;
  if (updates.tags !== undefined) ticket.tags = updates.tags;
  ticket.updated_at = new Date().toISOString();
  saveStore(store);
  return ticket;
}

export function deleteTicket(id: number): boolean {
  const store = loadStore();
  const idx = store.tickets.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  store.tickets.splice(idx, 1);
  saveStore(store);
  return true;
}

export function getTicket(id: number): Ticket | null {
  const store = loadStore();
  return store.tickets.find((t) => t.id === id) ?? null;
}

export function listTickets(column?: Column): Ticket[] {
  const store = loadStore();
  if (column) return store.tickets.filter((t) => t.column === column);
  return store.tickets;
}

export function getStorePath(): string {
  return STORE_FILE;
}
