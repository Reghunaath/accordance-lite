import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getThreadById, updateThreadTitle, updateThreadTimestamp } from '../db/threads.js';
import { createMessage, getMessageCountByThreadId } from '../db/messages.js';
import { createAttachment, getAttachmentsByMessageId } from '../db/attachments.js';
import type { Citation } from '../types/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted'));
    }
  },
});

const router = Router();

// POST /api/threads/:threadId/messages
router.post('/:threadId/messages', upload.array('files', 10), (req, res) => {
  const { threadId } = req.params;
  const content = req.body.content as string;
  const files = req.files as Express.Multer.File[] | undefined;

  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400).json({ error: 'content is required' });
    return;
  }

  const thread = getThreadById(threadId);
  if (!thread) {
    res.status(404).json({ error: 'Thread not found' });
    return;
  }

  // Save user message
  const userMessage = createMessage(threadId, 'user', content.trim());

  // Save attachments if any
  if (files && files.length > 0) {
    for (const file of files) {
      createAttachment(
        userMessage.id,
        file.originalname,
        file.mimetype,
        file.size,
        file.path
      );
    }
  }

  // If first message in thread, update thread title
  const messageCount = getMessageCountByThreadId(threadId);
  if (messageCount === 1) {
    const title = content.trim().substring(0, 60);
    updateThreadTitle(threadId, title);
  }

  // Update thread timestamp
  updateThreadTimestamp(threadId);

  // Mock assistant response
  const mockCitations: Citation[] = [
    {
      index: 1,
      url: 'https://www.law.cornell.edu/uscode/text/26/1031',
      title: '26 U.S. Code § 1031 - Exchange of real property',
      snippet: 'No gain or loss shall be recognized on the exchange of real property held for productive use.',
    },
    {
      index: 2,
      url: 'https://www.law.cornell.edu/cfr/text/26/1.1031(a)-1',
      title: 'Treas. Reg. § 1.1031(a)-1',
      snippet: 'Definition of real property for purposes of section 1031 like-kind exchanges.',
    },
  ];

  const mockContent = `This is a mock response from Accordance AI. In a real implementation, this would come from the Perplexity API with streaming.

Here is some analysis with citations [1] referencing the relevant code section, and additional regulatory guidance [2] that supports this interpretation.

**Key points:**
- Point one with detailed analysis
- Point two with supporting authority
- Point three with practical implications`;

  const assistantMessage = createMessage(
    threadId,
    'assistant',
    mockContent,
    JSON.stringify(mockCitations)
  );

  res.status(201).json({
    userMessage: {
      ...userMessage,
      attachments: getAttachmentsByMessageId(userMessage.id),
    },
    assistantMessage: {
      ...assistantMessage,
      attachments: [],
    },
  });
});

export default router;
