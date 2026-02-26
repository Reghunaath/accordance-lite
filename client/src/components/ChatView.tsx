import { useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import StreamingIndicator from './StreamingIndicator';
import type { Message } from '../types';

interface ChatViewProps {
  threadTitle: string;
  lastUpdated: string;
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
  onSendMessage: (content: string) => void;
}

export default function ChatView({
  threadTitle,
  lastUpdated,
  messages,
  streamingContent,
  isStreaming,
  onSendMessage,
}: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-light relative">
      <ChatHeader title={threadTitle} lastUpdated={lastUpdated} />
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-24 xl:px-48 pb-48 scroll-smooth"
      >
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          {messages.map((msg) =>
            msg.role === 'user' ? (
              <UserMessage key={msg.id} message={msg} />
            ) : (
              <AssistantMessage key={msg.id} content={msg.content} />
            )
          )}
          {isStreaming && streamingContent && (
            <AssistantMessage content={streamingContent} isStreaming />
          )}
          {isStreaming && !streamingContent && (
            <StreamingIndicator />
          )}
        </div>
      </div>
      <ChatInput onSendMessage={onSendMessage} disabled={isStreaming} />
    </div>
  );
}
