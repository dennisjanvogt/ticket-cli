import Database from 'better-sqlite3';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';
import type { Ticket, TicketStore, Column, Priority, Project, Subtask } from './types.js';

const DB_PATH = join(homedir(), '.tickets.db');

let _db: Database.Database | null = null;
let _projectOverride: string | null = null;

export function setProjectOverride(name: string): void {
  _projectOverride = name;
}

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    _db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        path TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        "column" TEXT NOT NULL DEFAULT 'backlog',
        priority TEXT NOT NULL DEFAULT 'medium',
        tags TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_tickets_project ON tickets(project_id);
      CREATE TABLE IF NOT EXISTS subtasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_subtasks_ticket ON subtasks(ticket_id);
    `);

    // Migrations for existing databases
    const cols = _db.pragma('table_info(tickets)') as { name: string }[];
    if (!cols.some((c) => c.name === 'due_date')) {
      _db.exec('ALTER TABLE tickets ADD COLUMN due_date TEXT DEFAULT NULL');
    }
  }
  return _db;
}

function resolveProjectName(): string {
  if (_projectOverride) return _projectOverride;
  return basename(process.cwd());
}

function ensureProject(): Project {
  const db = getDb();
  const name = resolveProjectName();
  const cwd = process.cwd();

  const existing = db
    .prepare('SELECT * FROM projects WHERE name = ?')
    .get(name) as Record<string, unknown> | undefined;

  if (existing) {
    if (existing.path !== cwd) {
      db.prepare('UPDATE projects SET path = ? WHERE id = ?').run(cwd, existing.id);
    }
    return {
      id: existing.id as number,
      name: existing.name as string,
      path: cwd,
      created_at: existing.created_at as string,
    };
  }

  const now = new Date().toISOString();
  const result = db
    .prepare('INSERT INTO projects (name, path, created_at) VALUES (?, ?, ?)')
    .run(name, cwd, now);

  return {
    id: Number(result.lastInsertRowid),
    name,
    path: cwd,
    created_at: now,
  };
}

const TICKET_SELECT = `
  SELECT t.*,
    (SELECT COUNT(*) FROM subtasks WHERE ticket_id = t.id) as subtask_count,
    (SELECT COUNT(*) FROM subtasks WHERE ticket_id = t.id AND done = 1) as subtask_done
  FROM tickets t
`;

function rowToTicket(row: Record<string, unknown>): Ticket {
  return {
    id: row.id as number,
    project_id: row.project_id as number,
    title: row.title as string,
    description: row.description as string,
    column: row.column as Column,
    priority: row.priority as Priority,
    tags: JSON.parse(row.tags as string) as string[],
    due_date: (row.due_date as string) ?? null,
    subtask_count: (row.subtask_count as number) ?? 0,
    subtask_done: (row.subtask_done as number) ?? 0,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

// --- Project ---

export function getProject(): Project {
  return ensureProject();
}

export function listProjects(): Project[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM projects ORDER BY name').all() as Record<string, unknown>[];
  return rows.map((r) => ({
    id: r.id as number,
    name: r.name as string,
    path: r.path as string,
    created_at: r.created_at as string,
  }));
}

// --- Tickets ---

export function loadStore(): TicketStore {
  const project = ensureProject();
  const db = getDb();
  const rows = db
    .prepare(`${TICKET_SELECT} WHERE t.project_id = ? ORDER BY t.id`)
    .all(project.id) as Record<string, unknown>[];
  return { project, tickets: rows.map(rowToTicket) };
}

export function addTicket(opts: {
  title: string;
  description?: string;
  column?: Column;
  priority?: Priority;
  tags?: string[];
  due_date?: string | null;
}): Ticket {
  const project = ensureProject();
  const db = getDb();
  const now = new Date().toISOString();
  const result = db
    .prepare(
      `INSERT INTO tickets (project_id, title, description, "column", priority, tags, due_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      project.id,
      opts.title,
      opts.description ?? '',
      opts.column ?? 'backlog',
      opts.priority ?? 'medium',
      JSON.stringify(opts.tags ?? []),
      opts.due_date ?? null,
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
  updates: {
    title?: string;
    description?: string;
    priority?: Priority;
    column?: Column;
    tags?: string[];
    due_date?: string | null;
  }
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
  const due_date = updates.due_date !== undefined ? updates.due_date : existing.due_date;

  db.prepare(
    `UPDATE tickets SET title = ?, description = ?, priority = ?, "column" = ?, tags = ?, due_date = ?, updated_at = ?
     WHERE id = ?`
  ).run(title, description, priority, column, JSON.stringify(tags), due_date, now, id);

  return getTicket(id);
}

export function deleteTicket(id: number): boolean {
  const db = getDb();
  const changes = db.prepare('DELETE FROM tickets WHERE id = ?').run(id).changes;
  return changes > 0;
}

export function getTicket(id: number): Ticket | null {
  const db = getDb();
  const row = db
    .prepare(`${TICKET_SELECT} WHERE t.id = ?`)
    .get(id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return rowToTicket(row);
}

export function listTickets(column?: Column): Ticket[] {
  const project = ensureProject();
  const db = getDb();
  if (column) {
    const rows = db
      .prepare(`${TICKET_SELECT} WHERE t.project_id = ? AND t."column" = ? ORDER BY t.id`)
      .all(project.id, column) as Record<string, unknown>[];
    return rows.map(rowToTicket);
  }
  const rows = db
    .prepare(`${TICKET_SELECT} WHERE t.project_id = ? ORDER BY t.id`)
    .all(project.id) as Record<string, unknown>[];
  return rows.map(rowToTicket);
}

// --- Subtasks ---

function rowToSubtask(row: Record<string, unknown>): Subtask {
  return {
    id: row.id as number,
    ticket_id: row.ticket_id as number,
    title: row.title as string,
    done: (row.done as number) === 1,
    sort_order: row.sort_order as number,
  };
}

export function getSubtasks(ticketId: number): Subtask[] {
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM subtasks WHERE ticket_id = ? ORDER BY sort_order, id')
    .all(ticketId) as Record<string, unknown>[];
  return rows.map(rowToSubtask);
}

export function addSubtask(ticketId: number, title: string): Subtask {
  const db = getDb();
  const maxOrder = (
    db.prepare('SELECT MAX(sort_order) as m FROM subtasks WHERE ticket_id = ?').get(ticketId) as {
      m: number | null;
    }
  ).m;
  const result = db
    .prepare('INSERT INTO subtasks (ticket_id, title, sort_order) VALUES (?, ?, ?)')
    .run(ticketId, title, (maxOrder ?? -1) + 1);
  return rowToSubtask(
    db.prepare('SELECT * FROM subtasks WHERE id = ?').get(Number(result.lastInsertRowid)) as Record<
      string,
      unknown
    >
  );
}

export function toggleSubtask(id: number): Subtask | null {
  const db = getDb();
  const changes = db.prepare('UPDATE subtasks SET done = 1 - done WHERE id = ?').run(id).changes;
  if (changes === 0) return null;
  const row = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? rowToSubtask(row) : null;
}

export function deleteSubtask(id: number): boolean {
  const db = getDb();
  return db.prepare('DELETE FROM subtasks WHERE id = ?').run(id).changes > 0;
}

export function getStorePath(): string {
  return DB_PATH;
}
