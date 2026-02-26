import { useState, useRef, useCallback } from 'react';
import { getGreeting } from '../utils/greeting';
import AttachmentPreview from './AttachmentPreview';

interface WelcomeScreenProps {
  onSendMessage: (content: string, files?: File[]) => void;
  onOpenSidebar?: () => void;
}

export default function WelcomeScreen({ onSendMessage, onOpenSidebar }: WelcomeScreenProps) {
  const [input, setInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed, selectedFiles.length > 0 ? selectedFiles : undefined);
    setInput('');
    setSelectedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setSelectedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 pb-20 max-w-3xl mx-auto w-full relative">
      {onOpenSidebar && (
        <button
          onClick={onOpenSidebar}
          className="absolute top-4 left-4 md:hidden p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
          aria-label="Open sidebar"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
      )}
      <div className="text-center mb-10 space-y-2">
        <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/5 text-primary mb-4">
          <span className="material-symbols-outlined text-[28px]">smart_toy</span>
        </div>
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">
          {getGreeting()}, Reghunaath.
        </h2>
        <p className="text-slate-500 text-lg font-light">How can I be of service today?</p>
      </div>

      <div className="w-full bg-white border border-slate-200 shadow-lg shadow-slate-200/40 rounded-lg overflow-hidden transition-shadow focus-within:shadow-xl focus-within:shadow-primary/5 focus-within:border-primary/40">
        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="p-4">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full resize-none bg-transparent text-slate-900 placeholder-slate-400 text-base focus:outline-none min-h-[120px]"
              placeholder="How can Accordance help you today? e.g. 'Summarize the latest changes to Section 174 regarding R&E expenditures'"
            />
          </div>
          <AttachmentPreview files={selectedFiles} onRemove={handleRemoveFile} />
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-slate-500 hover:text-primary hover:bg-white px-3 py-1.5 rounded text-sm font-medium transition-colors border border-transparent hover:border-slate-200 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
                aria-label="Attach file"
              >
                <span className="material-symbols-outlined text-[20px]">attach_file</span>
                <span className="hidden sm:inline">Attach File</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 hidden sm:inline">Press Enter to send</span>
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors shadow-sm flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
                aria-label="Submit question"
              >
                <span>Ask Accordance</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <p className="mt-6 text-xs text-slate-400 text-center max-w-lg">
        Accordance Lite may produce inaccurate information about people, places, or facts. Always verify important information.
      </p>
    </div>
  );
}
