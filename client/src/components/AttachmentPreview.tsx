interface AttachmentPreviewProps {
  files: File[];
  onRemove: (index: number) => void;
}

export default function AttachmentPreview({ files, onRemove }: AttachmentPreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pt-3">
      {files.map((file, i) => (
        <div
          key={`${file.name}-${i}`}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
        >
          <div className="h-7 w-7 bg-red-50 rounded flex items-center justify-center text-red-500 shrink-0">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
          </div>
          <span className="text-slate-700 truncate max-w-[160px]">{file.name}</span>
          <span className="text-xs text-slate-400">
            {(file.size / (1024 * 1024)).toFixed(1)} MB
          </span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="ml-1 text-slate-400 hover:text-slate-600 transition-colors rounded focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
            aria-label={`Remove ${file.name}`}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
