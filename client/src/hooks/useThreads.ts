import { useState, useEffect, useCallback } from 'react';
import type { Thread, Message } from '../types';
import * as api from '../utils/api';

interface UseThreadsReturn {
  threads: Thread[];
  activeThread: Thread | null;
  activeMessages: Message[];
  loading: boolean;
  selectThread: (id: string) => Promise<void>;
  createAndSendMessage: (content: string) => Promise<void>;
  deleteThread: (id: string) => Promise<void>;
  clearActiveThread: () => void;
}

export function useThreads(): UseThreadsReturn {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const loadThreads = useCallback(async () => {
    try {
      const { threads } = await api.fetchThreads();
      setThreads(threads);
    } catch (err) {
      console.error('Failed to load threads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const selectThread = useCallback(async (id: string) => {
    try {
      const { thread, messages } = await api.fetchThread(id);
      setActiveThread(thread);
      setActiveMessages(messages);
    } catch (err) {
      console.error('Failed to load thread:', err);
    }
  }, []);

  const createAndSendMessage = useCallback(async (content: string) => {
    try {
      // Create a new thread with a placeholder title
      const { thread } = await api.createThread(content.substring(0, 60));

      // Send the message (this will also update the thread title on the server)
      const { userMessage, assistantMessage } = await api.sendMessage(thread.id, content);

      // Update local state
      setActiveThread({ ...thread, title: content.substring(0, 60) });
      setActiveMessages([userMessage, assistantMessage]);
      await loadThreads();
    } catch (err) {
      console.error('Failed to create thread and send message:', err);
    }
  }, [loadThreads]);

  const handleDeleteThread = useCallback(async (id: string) => {
    try {
      await api.deleteThread(id);
      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (activeThread?.id === id) {
        setActiveThread(null);
        setActiveMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete thread:', err);
    }
  }, [activeThread]);

  const clearActiveThread = useCallback(() => {
    setActiveThread(null);
    setActiveMessages([]);
  }, []);

  return {
    threads,
    activeThread,
    activeMessages,
    loading,
    selectThread,
    createAndSendMessage,
    deleteThread: handleDeleteThread,
    clearActiveThread,
  };
}
