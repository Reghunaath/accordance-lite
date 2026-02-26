import { useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import StreamingIndicator from './StreamingIndicator';
import type { Message, Citation } from '../types';

interface ChatViewProps {
  threadTitle: string;
  lastUpdated: string;
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  error: string | null;
  onSendMessage: (content: string, files?: File[]) => void;
  threadLoading?: boolean;
  threadId?: string;
  onOpenSidebar?: () => void;
}

export default function ChatView({
  threadTitle,
  lastUpdated,
  messages,
  streamingContent,
  isStreaming,
  error,
  onSendMessage,
  threadLoading,
  threadId,
  onOpenSidebar,
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-light relative">
      <ChatHeader title={threadTitle} lastUpdated={lastUpdated} onOpenSidebar={onOpenSidebar} />
      {threadLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[32px] animate-spin">progress_activity</span>
            <span className="text-sm text-slate-400">Loading conversation...</span>
          </div>
        </div>
      ) : (
        <div
          key={threadId}
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-24 xl:px-48 pb-48 scroll-smooth animate-fade-in"
        >
          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {messages.length === 0 && !isStreaming && !error && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-slate-300 text-[40px] mb-3">forum</span>
                <p className="text-slate-400 text-sm">Send a message to start the conversation</p>
              </div>
            )}
            {messages.map((msg) => {
              if (msg.role === 'user') {
                return <UserMessage key={msg.id} message={msg} />;
              }
              const citations: Citation[] = msg.citations ? JSON.parse(msg.citations) : [];
              return (
                <AssistantMessage
                  key={msg.id}
                  content={msg.content}
                  citations={citations}
                  messageId={msg.id}
                />
              );
            })}
            {isStreaming && streamingContent && (
              <AssistantMessage content={streamingContent} isStreaming />
            )}
            {isStreaming && !streamingContent && (
              <StreamingIndicator />
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
      <ChatInput onSendMessage={onSendMessage} disabled={isStreaming} />
    </div>
  );
}
