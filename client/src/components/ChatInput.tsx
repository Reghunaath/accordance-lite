import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-bg-light via-bg-light to-transparent pt-10 pb-6 px-6 md:px-12 lg:px-24 xl:px-48 z-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col p-2 bg-white border border-slate-200 rounded-xl shadow-xl">
          <div className="flex items-end gap-2 p-2">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors shrink-0"
              title="Attach file"
            >
              <span className="material-symbols-outlined">attach_file</span>
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="w-full resize-none bg-transparent border-0 text-slate-900 placeholder-slate-400 focus:ring-0 py-2 px-1 text-base max-h-[160px] overflow-y-auto"
              placeholder="Ask a follow-up question or request a summary..."
              rows={1}
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || disabled}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-2 shadow-lg shadow-primary/20 transition-all flex items-center justify-center shrink-0 mb-0.5"
            >
              <span className="material-symbols-outlined">arrow_upward</span>
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-3">
          Accordance Lite can make mistakes. Verify important tax information.
        </p>
      </div>
    </div>
  );
}
