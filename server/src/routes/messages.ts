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

const MOCK_RESPONSE = `Based on the Tax Cuts and Jobs Act of 2017, Section 1031 now applies exclusively to real property held for productive use in a trade or business or for investment. Personal property no longer qualifies for like-kind exchange treatment [1].

Real property is generally defined under local law, but Treasury Regulations provide specific guidance. Distinct assets such as machinery or equipment, even if fixed to a building, may be treated as personal property rather than real property for these purposes [2].

Therefore, the items listed in your schedule classified as personal property would trigger taxable gains upon sale, whereas the real estate components can still defer tax under §1031 [3]. It is crucial to segregate these assets accurately to determine the recognizable gain.

**Key considerations:**
- Only **real property** qualifies for like-kind exchange treatment post-TCJA
- Personal property exchanges are now fully taxable events
- A cost segregation study may be needed to properly classify assets`;

const MOCK_CITATIONS: Citation[] = [
  {
    index: 1,
    url: 'https://www.law.cornell.edu/uscode/text/26/1031',
    title: '26 U.S. Code § 1031 - Exchange of real property',
    snippet: 'Like-kind exchanges limited to real property not held primarily for sale.',
  },
  {
    index: 2,
    url: 'https://www.law.cornell.edu/cfr/text/26/1.1031(a)-3',
    title: 'Treas. Reg. § 1.1031(a)-3',
    snippet: 'Definition of real property for purposes of section 1031 like-kind exchanges.',
  },
  {
    index: 3,
    url: 'https://www.congress.gov/bill/115th-congress/house-bill/1/text',
    title: 'TCJA Conference Report',
    snippet: 'Legislative history regarding the limitation of like-kind exchanges.',
  },
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// POST /api/threads/:threadId/messages — SSE streaming
router.post('/:threadId/messages', upload.array('files', 10), async (req, res) => {
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

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send user message event
  res.write(`data: ${JSON.stringify({ type: 'user_message', message: { ...userMessage, attachments: getAttachmentsByMessageId(userMessage.id) } })}\n\n`);

  // Stream mock tokens with small delays
  const words = MOCK_RESPONSE.split(' ');
  let accumulated = '';

  for (let i = 0; i < words.length; i++) {
    accumulated += (i === 0 ? '' : ' ') + words[i];
    res.write(`data: ${JSON.stringify({ type: 'token', content: words[i] + (i < words.length - 1 ? ' ' : '') })}\n\n`);
    await sleep(30);
  }

  // Save assistant message to DB
  const assistantMessage = createMessage(
    threadId,
    'assistant',
    accumulated,
    JSON.stringify(MOCK_CITATIONS)
  );

  // Send done event with full message and citations
  res.write(`data: ${JSON.stringify({ type: 'done', message: { ...assistantMessage, attachments: [] }, citations: MOCK_CITATIONS })}\n\n`);
  res.end();
});

export default router;
