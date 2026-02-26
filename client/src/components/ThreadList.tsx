import ThreadItem from './ThreadItem';
import { formatRelativeTime } from '../utils/time';
import type { Thread } from '../types';

interface ThreadListProps {
  threads: Thread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onDeleteThread: (id: string) => void;
  loading?: boolean;
}

function SkeletonRow() {
  return (
    <div className="px-3 py-3 rounded-lg animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-1/3" />
    </div>
  );
}

export default function ThreadList({ threads, activeThreadId, onSelectThread, onDeleteThread, loading }: ThreadListProps) {
  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll p-3 flex flex-col gap-1">
      <div className="text-xs font-medium text-slate-400 px-3 py-2 uppercase tracking-wider">
        Recent
      </div>
      {loading ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : threads.length === 0 ? (
        <div className="flex flex-col items-center py-8 px-3 text-center">
          <span className="material-symbols-outlined text-slate-300 text-[32px] mb-2">chat_bubble_outline</span>
          <p className="text-slate-400 text-sm font-medium">No conversations yet</p>
          <p className="text-slate-400 text-xs mt-1">Start a new thread to begin</p>
        </div>
      ) : (
        threads.map((thread) => (
          <ThreadItem
            key={thread.id}
            title={thread.title}
            timestamp={formatRelativeTime(thread.updated_at)}
            isActive={thread.id === activeThreadId}
            onClick={() => onSelectThread(thread.id)}
            onDelete={() => onDeleteThread(thread.id)}
          />
        ))
      )}
    </div>
  );
}
