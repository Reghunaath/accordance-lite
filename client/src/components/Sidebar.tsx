import SidebarHeader from './SidebarHeader';
import NewThreadButton from './NewThreadButton';
import ThreadList from './ThreadList';
import UserFooter from './UserFooter';
import type { Thread } from '../types';

interface SidebarProps {
  threads: Thread[];
  activeThreadId: string | null;
  onNewThread: () => void;
  onSelectThread: (id: string) => void;
  onDeleteThread: (id: string) => void;
}

export default function Sidebar({ threads, activeThreadId, onNewThread, onSelectThread, onDeleteThread }: SidebarProps) {
  return (
    <aside className="w-[280px] h-full flex flex-col bg-bg-sidebar border-r border-slate-200 shrink-0">
      <div className="p-4 border-b border-slate-200/50">
        <div className="mb-6">
          <SidebarHeader />
        </div>
        <NewThreadButton onClick={onNewThread} />
      </div>
      <ThreadList
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={onSelectThread}
        onDeleteThread={onDeleteThread}
      />
      <UserFooter />
    </aside>
  );
}
