import SourceCard from './SourceCard';
import type { Citation } from '../types';

interface SourcesListProps {
  citations: Citation[];
  messageId: string;
}

export default function SourcesList({ citations, messageId }: SourcesListProps) {
  if (citations.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-slate-100">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Sources
      </h3>
      <div className="flex flex-col gap-2">
        {citations.map((citation) => (
          <SourceCard
            key={citation.index}
            citation={citation}
            messageId={messageId}
          />
        ))}
      </div>
    </div>
  );
}
