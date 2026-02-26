import { v4 as uuidv4 } from 'uuid';
import { getDb } from './index.js';
import type { Attachment } from '../types/index.js';

export function getAttachmentsByMessageId(messageId: string): Attachment[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM attachments WHERE message_id = ? ORDER BY created_at ASC'
  ).all(messageId) as Attachment[];
}

export function createAttachment(
  messageId: string,
  filename: string,
  mimeType: string,
  size: number,
  storagePath: string
): Attachment {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  db.prepare(
    'INSERT INTO attachments (id, message_id, filename, mime_type, size, storage_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, messageId, filename, mimeType, size, storagePath, now);

  return {
    id,
    message_id: messageId,
    filename,
    mime_type: mimeType,
    size,
    storage_path: storagePath,
    created_at: now,
  };
}
