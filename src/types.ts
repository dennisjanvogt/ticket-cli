export type Column = 'backlog' | 'todo' | 'in-progress' | 'done';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export const COLUMNS: Column[] = ['backlog', 'todo', 'in-progress', 'done'];
export const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];

export const COLUMN_LABELS: Record<Column, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  'in-progress': 'In Progress',
  done: 'Done',
};

export interface Project {
  id: number;
  name: string;
  path: string;
  created_at: string;
}

export interface Subtask {
  id: number;
  ticket_id: number;
  title: string;
  done: boolean;
  sort_order: number;
}

export interface Ticket {
  id: number;
  project_id: number;
  title: string;
  description: string;
  column: Column;
  priority: Priority;
  tags: string[];
  due_date: string | null;
  subtask_count: number;
  subtask_done: number;
  created_at: string;
  updated_at: string;
}

export interface TicketStore {
  project: Project;
  tickets: Ticket[];
}
