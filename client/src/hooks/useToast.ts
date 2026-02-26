import { useState, useCallback, useRef } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    const timer = setTimeout(() => {
      dismissToast(id);
    }, 4000);
    timersRef.current.set(id, timer);
  }, [dismissToast]);

  return { toasts, addToast, dismissToast };
}
