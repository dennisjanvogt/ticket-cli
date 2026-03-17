import Database from 'better-sqlite3';
import { join } from 'node:path';
import type { Ticket, TicketStore, Column, Priority } from './types.js';

const DB_PATH = join(process.cwd(), '.tickets.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    _db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        "column" TEXT NOT NULL DEFAULT 'backlog',
        priority TEXT NOT NULL DEFAULT 'medium',
        tags TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  }
  return _db;
}

function rowToTicket(row: Record<string, unknown>): Ticket {
  return {
    id: row.id as number,
    title: row.title as string,
    description: row.description as string,
    column: row.column as Column,
    priority: row.priority as Priority,
    tags: JSON.parse(row.tags as string) as string[],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export function loadStore(): TicketStore {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM tickets ORDER BY id').all() as Record<string, unknown>[];
  return { tickets: rows.map(rowToTicket) };
}

export function addTicket(opts: {
  title: string;
  description?: string;
  column?: Column;
  priority?: Priority;
  tags?: string[];
}): Ticket {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db
    .prepare(
      `INSERT INTO tickets (title, description, "column", priority, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      opts.title,
      opts.description ?? '',
      opts.column ?? 'backlog',
      opts.priority ?? 'medium',
      JSON.stringify(opts.tags ?? []),
      now,
      now
    );

  return getTicket(Number(result.lastInsertRowid))!;
}

export function moveTicket(id: number, column: Column): Ticket | null {
  const db = getDb();
  const now = new Date().toISOString();
  const changes = db
    .prepare('UPDATE tickets SET "column" = ?, updated_at = ? WHERE id = ?')
    .run(column, now, id).changes;
  if (changes === 0) return null;
  return getTicket(id);
}

export function editTicket(
  id: number,
  updates: Partial<Pick<Ticket, 'title' | 'description' | 'priority' | 'column' | 'tags'>>
): Ticket | null {
  const db = getDb();
  const existing = getTicket(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const title = updates.title ?? existing.title;
  const description = updates.description ?? existing.description;
  const priority = updates.priority ?? existing.priority;
  const column = updates.column ?? existing.column;
  const tags = updates.tags ?? existing.tags;

  db.prepare(
    `UPDATE tickets SET title = ?, description = ?, priority = ?, "column" = ?, tags = ?, updated_at = ?
     WHERE id = ?`
  ).run(title, description, priority, column, JSON.stringify(tags), now, id);

  return getTicket(id);
}

export function deleteTicket(id: number): boolean {
  const db = getDb();
  const changes = db.prepare('DELETE FROM tickets WHERE id = ?').run(id).changes;
  return changes > 0;
}

export function getTicket(id: number): Ticket | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return rowToTicket(row);
}

export function listTickets(column?: Column): Ticket[] {
  const db = getDb();
  if (column) {
    const rows = db.prepare('SELECT * FROM tickets WHERE "column" = ? ORDER BY id').all(column) as Record<string, unknown>[];
    return rows.map(rowToTicket);
  }
  const rows = db.prepare('SELECT * FROM tickets ORDER BY id').all() as Record<string, unknown>[];
  return rows.map(rowToTicket);
}

export function getStorePath(): string {
  return DB_PATH;
}
