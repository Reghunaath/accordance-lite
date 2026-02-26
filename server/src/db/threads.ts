import { v4 as uuidv4 } from 'uuid';
import { getDb } from './index.js';
import type { Thread } from '../types/index.js';

export function getAllThreads(): Thread[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM threads ORDER BY updated_at DESC'
  ).all() as Thread[];
}

export function getThreadById(id: string): Thread | undefined {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM threads WHERE id = ?'
  ).get(id) as Thread | undefined;
}

export function createThread(title: string): Thread {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO threads (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)'
  ).run(id, title, now, now);

  return { id, title, created_at: now, updated_at: now };
}

export function updateThreadTitle(id: string, title: string): void {
  const db = getDb();
  db.prepare(
    'UPDATE threads SET title = ?, updated_at = ? WHERE id = ?'
  ).run(title, new Date().toISOString(), id);
}

export function updateThreadTimestamp(id: string): void {
  const db = getDb();
  db.prepare(
    'UPDATE threads SET updated_at = ? WHERE id = ?'
  ).run(new Date().toISOString(), id);
}

export function deleteThread(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM threads WHERE id = ?').run(id);
}
