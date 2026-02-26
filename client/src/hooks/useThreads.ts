import { useState, useEffect, useCallback } from 'react';
import type { Thread, Message } from '../types';
import * as api from '../utils/api';

interface UseThreadsReturn {
  threads: Thread[];
  activeThread: Thread | null;
  loading: boolean;
  error: string | null;
  threadLoading: boolean;
  selectThread: (id: string) => Promise<void>;
  createThread: (content: string) => Promise<string>;
  deleteThread: (id: string) => Promise<void>;
  clearActiveThread: () => void;
  refreshThreads: () => Promise<void>;
  setActiveMessages: (messages: Message[]) => void;
  activeMessages: Message[];
}

export function useThreads(): UseThreadsReturn {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);

  const loadThreads = useCallback(async () => {
    try {
      setError(null);
      const { threads } = await api.fetchThreads();
      setThreads(threads);
    } catch (err) {
      console.error('Failed to load threads:', err);
      setError('Failed to load threads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const selectThread = useCallback(async (id: string) => {
    try {
      setThreadLoading(true);
      const { thread, messages } = await api.fetchThread(id);
      setActiveThread(thread);
      setActiveMessages(messages);
    } catch (err) {
      console.error('Failed to load thread:', err);
      throw err;
    } finally {
      setThreadLoading(false);
    }
  }, []);

  const createNewThread = useCallback(async (content: string): Promise<string> => {
    const title = content.length > 60 ? content.substring(0, 60) + '...' : content;
    const { thread } = await api.createThread(title);
    setActiveThread(thread);
    setActiveMessages([]);
    return thread.id;
  }, []);

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
      throw err;
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
    error,
    threadLoading,
    selectThread,
    createThread: createNewThread,
    deleteThread: handleDeleteThread,
    clearActiveThread,
    refreshThreads: loadThreads,
    setActiveMessages,
  };
}
