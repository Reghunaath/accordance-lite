export default function StreamingIndicator() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary flex items-center justify-center rounded-lg h-8 w-8 text-white shadow-lg shadow-primary/30">
          <span className="material-symbols-outlined text-lg">smart_toy</span>
        </div>
        <span className="text-sm font-semibold text-slate-900">Accordance AI</span>
      </div>
      <div className="bg-white border border-slate-100 p-6 rounded-2xl rounded-tl-sm shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
