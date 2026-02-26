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
  loading?: boolean;
  sidebarOpen?: boolean;
  onCloseSidebar?: () => void;
}

export default function Sidebar({
  threads,
  activeThreadId,
  onNewThread,
  onSelectThread,
  onDeleteThread,
  loading,
  sidebarOpen,
  onCloseSidebar,
}: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-[280px] h-full flex flex-col bg-bg-sidebar border-r border-slate-200 shrink-0 transition-transform duration-200 md:relative md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-4 border-b border-slate-200/50">
        <div className={activeThreadId ? 'mb-6' : ''}>
          <SidebarHeader />
        </div>
        {activeThreadId && (
          <NewThreadButton onClick={() => {
            onNewThread();
            onCloseSidebar?.();
          }} />
        )}
      </div>
      <ThreadList
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={(id) => {
          onSelectThread(id);
          onCloseSidebar?.();
        }}
        onDeleteThread={onDeleteThread}
        loading={loading}
      />
      <UserFooter />
    </aside>
  );
}
