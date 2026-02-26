import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import type { Message } from '../types';

interface ChatViewProps {
  threadTitle: string;
  lastUpdated: string;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export default function ChatView({ threadTitle, lastUpdated, messages, onSendMessage }: ChatViewProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-bg-light relative">
      <ChatHeader title={threadTitle} lastUpdated={lastUpdated} />
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 lg:px-24 xl:px-48 pb-48 scroll-smooth">
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-20">Messages will appear here</p>
          ) : (
            <p className="text-slate-400 text-sm text-center py-20">
              {messages.length} message{messages.length > 1 ? 's' : ''} loaded — rendering in Step 6
            </p>
          )}
        </div>
      </div>
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}
