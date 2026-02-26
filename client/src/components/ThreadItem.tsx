import { useState } from 'react';
import DeleteConfirmation from './DeleteConfirmation';

interface ThreadItemProps {
  title: string;
  timestamp: string;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function ThreadItem({ title, timestamp, isActive, onClick, onDelete }: ThreadItemProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-1 px-3 py-3 rounded-lg text-left transition-colors w-full group focus-visible:ring-2 focus-visible:ring-primary/40 outline-none ${
        isActive
          ? 'bg-white border border-slate-200 shadow-sm'
          : 'hover:bg-slate-200/50'
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <span
          className={`text-sm font-medium truncate w-[180px] ${
            isActive ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
          }`}
        >
          {title}
        </span>
        {confirming ? (
          <DeleteConfirmation
            onConfirm={() => {
              setConfirming(false);
              onDelete();
            }}
            onCancel={() => setConfirming(false)}
          />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirming(true);
            }}
            className="material-symbols-outlined text-[16px] text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/40 outline-none rounded"
            aria-label="Delete thread"
          >
            delete
          </button>
        )}
      </div>
      <span className="text-slate-400 text-xs">{timestamp}</span>
    </button>
  );
}
