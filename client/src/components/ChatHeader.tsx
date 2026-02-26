interface ChatHeaderProps {
  title: string;
  lastUpdated: string;
}

export default function ChatHeader({ title, lastUpdated }: ChatHeaderProps) {
  return (
    <header className="shrink-0 h-16 bg-white border-b border-slate-200 flex items-center px-6">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <span className="text-xs text-slate-500">{lastUpdated}</span>
      </div>
    </header>
  );
}
