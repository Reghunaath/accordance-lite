import ThreadItem from './ThreadItem';

interface Thread {
  id: string;
  title: string;
  timestamp: string;
}

interface ThreadListProps {
  threads: Thread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onDeleteThread: (id: string) => void;
}

export default function ThreadList({ threads, activeThreadId, onSelectThread, onDeleteThread }: ThreadListProps) {
  return (
    <div className="flex-1 overflow-y-auto sidebar-scroll p-3 flex flex-col gap-1">
      <div className="text-xs font-medium text-slate-400 px-3 py-2 uppercase tracking-wider">
        Recent
      </div>
      {threads.length === 0 ? (
        <p className="text-slate-400 text-xs px-3 py-2">No conversations yet.</p>
      ) : (
        threads.map((thread) => (
          <ThreadItem
            key={thread.id}
            title={thread.title}
            timestamp={thread.timestamp}
            isActive={thread.id === activeThreadId}
            onClick={() => onSelectThread(thread.id)}
            onDelete={() => onDeleteThread(thread.id)}
          />
        ))
      )}
    </div>
  );
}
