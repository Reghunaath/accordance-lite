import type { Citation } from '../types';

interface SourceCardProps {
  citation: Citation;
  messageId: string;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export default function SourceCard({ citation, messageId }: SourceCardProps) {
  return (
    <a
      id={`source-${messageId}-${citation.index}`}
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-primary hover:shadow-sm transition-all bg-slate-50 group"
    >
      <div className="shrink-0 h-6 w-6 rounded flex items-center justify-center bg-white border border-slate-200 text-xs font-medium text-slate-600 group-hover:border-primary/30 group-hover:text-primary transition-colors">
        [{citation.index}]
      </div>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 truncate">
            {citation.title}
          </span>
          <span className="text-xs text-slate-400 font-normal whitespace-nowrap">
            {extractDomain(citation.url)}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate">{citation.snippet}</p>
      </div>
    </a>
  );
}
