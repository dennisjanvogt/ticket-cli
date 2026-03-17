import Database from 'better-sqlite3';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';
import type { Ticket, TicketStore, Column, Priority, Project } from './types.js';

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
    `);
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
    // Update path if changed
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

function rowToTicket(row: Record<string, unknown>): Ticket {
  return {
    id: row.id as number,
    project_id: row.project_id as number,
    title: row.title as string,
    description: row.description as string,
    column: row.column as Column,
    priority: row.priority as Priority,
    tags: JSON.parse(row.tags as string) as string[],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

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

export function loadStore(): TicketStore {
  const project = ensureProject();
  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM tickets WHERE project_id = ? ORDER BY id')
    .all(project.id) as Record<string, unknown>[];
  return { project, tickets: rows.map(rowToTicket) };
}

export function addTicket(opts: {
  title: string;
  description?: string;
  column?: Column;
  priority?: Priority;
  tags?: string[];
}): Ticket {
  const project = ensureProject();
  const db = getDb();
  const now = new Date().toISOString();
  const result = db
    .prepare(
      `INSERT INTO tickets (project_id, title, description, "column", priority, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      project.id,
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
  const project = ensureProject();
  const db = getDb();
  if (column) {
    const rows = db
      .prepare('SELECT * FROM tickets WHERE project_id = ? AND "column" = ? ORDER BY id')
      .all(project.id, column) as Record<string, unknown>[];
    return rows.map(rowToTicket);
  }
  const rows = db
    .prepare('SELECT * FROM tickets WHERE project_id = ? ORDER BY id')
    .all(project.id) as Record<string, unknown>[];
  return rows.map(rowToTicket);
}

export function getStorePath(): string {
  return DB_PATH;
}
