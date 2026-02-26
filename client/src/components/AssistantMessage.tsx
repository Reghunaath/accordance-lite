import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import CitationBadge from './CitationBadge';
import SourcesList from './SourcesList';
import type { Citation } from '../types';

interface AssistantMessageProps {
  content: string;
  citations?: Citation[];
  messageId?: string;
  isStreaming?: boolean;
}

function renderContentWithCitations(content: string, messageId: string): ReactNode[] {
  // Split text by citation markers like [1], [2], etc.
  const parts = content.split(/(\[\d+\])/g);

  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (match) {
      const index = parseInt(match[1], 10);
      return <CitationBadge key={i} index={index} messageId={messageId} />;
    }
    // Render non-citation parts as markdown
    return <ReactMarkdown key={i}>{part}</ReactMarkdown>;
  });
}

export default function AssistantMessage({
  content,
  citations = [],
  messageId = '',
  isStreaming = false,
}: AssistantMessageProps) {
  const hasCitations = citations.length > 0 && messageId;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary flex items-center justify-center rounded-lg h-8 w-8 text-white shadow-lg shadow-primary/30">
          <span className="material-symbols-outlined text-lg">smart_toy</span>
        </div>
        <span className="text-sm font-semibold text-slate-900">Accordance AI</span>
      </div>
      <div className="bg-white border border-slate-100 p-6 rounded-2xl rounded-tl-sm shadow-sm text-slate-700">
        <div className="prose prose-slate max-w-none text-base leading-7">
          {hasCitations
            ? renderContentWithCitations(content, messageId)
            : <ReactMarkdown>{content}</ReactMarkdown>
          }
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />
          )}
        </div>
        {hasCitations && (
          <SourcesList citations={citations} messageId={messageId} />
        )}
      </div>
    </div>
  );
}
