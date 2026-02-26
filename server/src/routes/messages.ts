import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getThreadById, updateThreadTitle, updateThreadTimestamp } from '../db/threads.js';
import { createMessage, getMessageCountByThreadId } from '../db/messages.js';
import { createAttachment, getAttachmentsByMessageId } from '../db/attachments.js';
import { streamPerplexityResponse } from '../services/perplexity.js';
import { extractPdfText } from '../services/pdf.js';

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

  // Build enriched content with PDF text if attachments present
  let enrichedContent = content.trim();
  if (files && files.length > 0) {
    const fileContexts: string[] = [];
    for (const file of files) {
      try {
        const text = await extractPdfText(file.path);
        fileContexts.push(`[Attached Document: ${file.originalname}]\n---\n${text}\n---`);
      } catch (err) {
        console.error(`Failed to extract text from ${file.originalname}:`, err);
        fileContexts.push(`[Attached Document: ${file.originalname}]\n---\n(Could not extract text from this PDF)\n---`);
      }
    }
    enrichedContent = fileContexts.join('\n\n') + '\n\n' + enrichedContent;
  }

  try {
    await streamPerplexityResponse(enrichedContent, {
      onToken: (token) => {
        res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
      },
      onDone: (fullContent, citations) => {
        // Save assistant message to DB
        const assistantMessage = createMessage(
          threadId,
          'assistant',
          fullContent,
          JSON.stringify(citations)
        );

        // Send done event with full message and citations
        res.write(`data: ${JSON.stringify({ type: 'done', message: { ...assistantMessage, attachments: [] }, citations })}\n\n`);
        res.end();
      },
      onError: (error) => {
        console.error('Perplexity streaming error:', error);
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to get AI response. Please try again.' })}\n\n`);
        res.end();
      },
    });
  } catch (error) {
    console.error('Perplexity request failed:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to connect to AI service. Please try again.' })}\n\n`);
    res.end();
  }
});

export default router;
