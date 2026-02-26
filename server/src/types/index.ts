// Database models

export interface Thread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: string | null;
  created_at: string;
}

export interface Attachment {
  id: string;
  message_id: string;
  filename: string;
  mime_type: string;
  size: number;
  storage_path: string;
  created_at: string;
}

export interface Citation {
  index: number;
  url: string;
  title: string;
  snippet: string;
}

// API response shapes

export interface ThreadListResponse {
  threads: Thread[];
}

export interface ThreadDetailResponse {
  thread: Thread;
  messages: MessageWithAttachments[];
}

export interface CreateThreadBody {
  title: string;
}

export interface CreateThreadResponse {
  thread: Thread;
}

export interface DeleteThreadResponse {
  success: true;
}

export interface MessageWithAttachments extends Message {
  attachments: Attachment[];
}

export interface SendMessageResponse {
  userMessage: MessageWithAttachments;
  assistantMessage: MessageWithAttachments;
}
