import { useState, useCallback, useRef } from 'react';
import type { Message } from '../types';

interface SSEUserMessageEvent {
  type: 'user_message';
  message: Message;
}

interface SSETokenEvent {
  type: 'token';
  content: string;
}

interface SSEDoneEvent {
  type: 'done';
  message: Message;
}

interface SSEErrorEvent {
  type: 'error';
  message: string;
}

type SSEEvent = SSEUserMessageEvent | SSETokenEvent | SSEDoneEvent | SSEErrorEvent;

interface UseChatReturn {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (threadId: string, content: string, files?: File[]) => Promise<void>;
  setMessages: (messages: Message[]) => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (threadId: string, content: string, files?: File[]) => {
    // Abort any existing stream
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const formData = new FormData();
    formData.append('content', content);
    if (files) {
      for (const file of files) {
        formData.append('files', file);
      }
    }

    setIsStreaming(true);
    setStreamingContent('');
    setError(null);

    try {
      const response = await fetch(`/api/threads/${threadId}/messages`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          const event = JSON.parse(jsonStr) as SSEEvent;

          if (event.type === 'user_message') {
            setMessages((prev) => [...prev, event.message]);
          } else if (event.type === 'token') {
            setStreamingContent((prev) => prev + event.content);
          } else if (event.type === 'done') {
            setMessages((prev) => [...prev, event.message]);
            setStreamingContent('');
            setIsStreaming(false);
          } else if (event.type === 'error') {
            setError(event.message);
            setStreamingContent('');
            setIsStreaming(false);
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('Streaming error:', err);
      setError('Failed to send message. Please try again.');
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, []);

  return {
    messages,
    streamingContent,
    isStreaming,
    error,
    sendMessage,
    setMessages,
  };
}
