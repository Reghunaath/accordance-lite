interface NewThreadButtonProps {
  onClick: () => void;
}

export default function NewThreadButton({ onClick }: NewThreadButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-slate-200 hover:border-primary/30 hover:shadow-sm transition-all group"
    >
      <span className="material-symbols-outlined text-slate-400 group-hover:text-primary text-[20px]">
        add
      </span>
      <span className="text-slate-700 text-sm font-medium">New Thread</span>
    </button>
  );
}
