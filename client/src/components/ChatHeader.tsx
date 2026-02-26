interface ChatHeaderProps {
  title: string;
  lastUpdated: string;
  onOpenSidebar?: () => void;
}

export default function ChatHeader({ title, lastUpdated, onOpenSidebar }: ChatHeaderProps) {
  return (
    <header className="shrink-0 h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-3">
      {onOpenSidebar && (
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
          aria-label="Open sidebar"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
      )}
      <div className="flex flex-col min-w-0">
        <h2 className="text-lg font-semibold text-slate-900 truncate">{title}</h2>
        <span className="text-xs text-slate-500">{lastUpdated}</span>
      </div>
    </header>
  );
}
