interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmation({ onConfirm, onCancel }: DeleteConfirmationProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onConfirm();
        }}
        className="material-symbols-outlined text-[16px] text-red-500 hover:text-red-700 transition-colors p-0.5 rounded focus-visible:ring-2 focus-visible:ring-red-400 outline-none"
        aria-label="Confirm delete"
      >
        check
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCancel();
        }}
        className="material-symbols-outlined text-[16px] text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded focus-visible:ring-2 focus-visible:ring-slate-400 outline-none"
        aria-label="Cancel delete"
      >
        close
      </button>
    </div>
  );
}
