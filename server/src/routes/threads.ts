import { Router } from 'express';
import {
  getAllThreads,
  getThreadById,
  createThread,
  deleteThread,
} from '../db/threads.js';
import { getMessagesByThreadId } from '../db/messages.js';
import type { CreateThreadBody } from '../types/index.js';

const router = Router();

// GET /api/threads — list all threads
router.get('/', (_req, res) => {
  const threads = getAllThreads();
  res.json({ threads });
});

// POST /api/threads — create a new thread
router.post('/', (req, res) => {
  const { title } = req.body as CreateThreadBody;

  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const thread = createThread(title.trim());
  res.status(201).json({ thread });
});

// GET /api/threads/:id — get thread with messages
router.get('/:id', (req, res) => {
  const thread = getThreadById(req.params.id);

  if (!thread) {
    res.status(404).json({ error: 'Thread not found' });
    return;
  }

  const messages = getMessagesByThreadId(thread.id);
  res.json({ thread, messages });
});

// DELETE /api/threads/:id — delete thread and cascade
router.delete('/:id', (req, res) => {
  const thread = getThreadById(req.params.id);

  if (!thread) {
    res.status(404).json({ error: 'Thread not found' });
    return;
  }

  deleteThread(thread.id);
  res.json({ success: true });
});

export default router;
