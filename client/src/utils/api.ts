import type {
  ThreadListResponse,
  ThreadDetailResponse,
  CreateThreadResponse,
  SendMessageResponse,
} from '../types';

const BASE = '/api';

export async function fetchThreads(): Promise<ThreadListResponse> {
  const res = await fetch(`${BASE}/threads`);
  if (!res.ok) throw new Error('Failed to fetch threads');
  return res.json();
}

export async function fetchThread(id: string): Promise<ThreadDetailResponse> {
  const res = await fetch(`${BASE}/threads/${id}`);
  if (!res.ok) throw new Error('Failed to fetch thread');
  return res.json();
}

export async function createThread(title: string): Promise<CreateThreadResponse> {
  const res = await fetch(`${BASE}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to create thread');
  return res.json();
}

export async function deleteThread(id: string): Promise<void> {
  const res = await fetch(`${BASE}/threads/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete thread');
}

export async function sendMessage(
  threadId: string,
  content: string,
  files?: File[]
): Promise<SendMessageResponse> {
  const formData = new FormData();
  formData.append('content', content);
  if (files) {
    for (const file of files) {
      formData.append('files', file);
    }
  }
  const res = await fetch(`${BASE}/threads/${threadId}/messages`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}
