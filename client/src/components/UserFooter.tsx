export default function UserFooter() {
  return (
    <div className="p-4 border-t border-slate-200 bg-bg-sidebar">
      <div className="flex items-center gap-3 w-full p-2 rounded-lg">
        <div className="flex items-center justify-center size-9 rounded-full bg-slate-200 border border-slate-300 text-slate-600 text-sm font-semibold shrink-0">
          RA
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-slate-900 text-sm font-semibold truncate">Reghunaath Ajith</span>
          <span className="text-slate-500 text-xs truncate">ra@accordance.ai</span>
        </div>
        <span className="material-symbols-outlined text-slate-400 text-[20px]">settings</span>
      </div>
    </div>
  );
}
