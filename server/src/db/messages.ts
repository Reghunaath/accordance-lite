import { v4 as uuidv4 } from 'uuid';
import { getDb } from './index.js';
import type { Message, MessageWithAttachments } from '../types/index.js';
import { getAttachmentsByMessageId } from './attachments.js';

export function getMessagesByThreadId(threadId: string): MessageWithAttachments[] {
  const db = getDb();
  const messages = db.prepare(
    'SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC'
  ).all(threadId) as Message[];

  return messages.map((msg) => ({
    ...msg,
    attachments: getAttachmentsByMessageId(msg.id),
  }));
}

export function getMessageCountByThreadId(threadId: string): number {
  const db = getDb();
  const row = db.prepare(
    'SELECT COUNT(*) as count FROM messages WHERE thread_id = ?'
  ).get(threadId) as { count: number };
  return row.count;
}

export function createMessage(
  threadId: string,
  role: 'user' | 'assistant',
  content: string,
  citations: string | null = null
): Message {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO messages (id, thread_id, role, content, citations, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, threadId, role, content, citations, now);

  return { id, thread_id: threadId, role, content, citations, created_at: now };
}
