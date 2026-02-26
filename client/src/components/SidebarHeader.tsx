export default function SidebarHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center size-8 rounded bg-primary/10 text-primary">
        <span className="material-symbols-outlined text-[20px]">account_balance</span>
      </div>
      <div className="flex flex-col">
        <h1 className="text-slate-900 text-sm font-semibold leading-none">Accordance Lite</h1>
        <span className="text-slate-500 text-xs mt-0.5">Tax Research Assistant</span>
      </div>
    </div>
  );
}
