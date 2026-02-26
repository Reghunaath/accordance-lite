import ReactMarkdown from 'react-markdown';

interface AssistantMessageProps {
  content: string;
  isStreaming?: boolean;
}

export default function AssistantMessage({ content, isStreaming = false }: AssistantMessageProps) {
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
          <ReactMarkdown>{content}</ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-primary/60 animate-pulse ml-0.5 align-text-bottom" />
          )}
        </div>
      </div>
    </div>
  );
}
