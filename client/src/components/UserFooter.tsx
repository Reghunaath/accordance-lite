export default function UserFooter() {
  return (
    <div className="p-4 border-t border-slate-200 bg-bg-sidebar">
      <div className="flex items-center gap-3 w-full p-2 rounded-lg">
        <div className="flex items-center justify-center size-9 rounded-full bg-slate-200 border border-slate-300 text-slate-600 text-sm font-semibold shrink-0">
          RA
        </div>
        <div className="flex flex-col flex-1 min-w-0" title="Placeholder — not a real account">
          <span className="text-slate-900 text-sm font-semibold truncate">Reghunaath Ajith</span>
          <span className="text-slate-500 text-xs truncate">ajithkumarahila.r@northeastern.edu</span>
        </div>
        <button
          className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
          aria-label="Settings (coming soon)"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </div>
    </div>
  );
}
