import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ChatView from './components/ChatView';
import ToastContainer from './components/Toast';
import { useThreads } from './hooks/useThreads';
import { useChat } from './hooks/useChat';
import { useToast } from './hooks/useToast';
import { formatLastUpdated } from './utils/time';

function App() {
  const {
    threads,
    activeThread,
    activeMessages,
    loading,
    error: threadsError,
    threadLoading,
    selectThread,
    createThread,
    deleteThread,
    clearActiveThread,
    refreshThreads,
  } = useThreads();

  const {
    messages: chatMessages,
    streamingContent,
    isStreaming,
    error: chatError,
    sendMessage,
    setMessages: setChatMessages,
  } = useChat();

  const { toasts, addToast, dismissToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync thread messages into chat when selecting a thread
  useEffect(() => {
    setChatMessages(activeMessages);
  }, [activeMessages, setChatMessages]);

  // Show toast when threads fail to load
  useEffect(() => {
    if (threadsError) {
      addToast(threadsError, 'error');
    }
  }, [threadsError, addToast]);

  const handleSendFromWelcome = async (content: string, files?: File[]) => {
    try {
      const threadId = await createThread(content);
      await sendMessage(threadId, content, files);
      await refreshThreads();
    } catch (err) {
      console.error('Failed to create thread:', err);
      addToast('Failed to create thread.', 'error');
    }
  };

  const handleSendFromChat = async (content: string, files?: File[]) => {
    if (!activeThread) return;
    await sendMessage(activeThread.id, content, files);
    await refreshThreads();
  };

  const handleSelectThread = async (id: string) => {
    try {
      await selectThread(id);
    } catch {
      addToast('Failed to load thread.', 'error');
    }
  };

  const handleDeleteThread = async (id: string) => {
    try {
      await deleteThread(id);
      addToast('Thread deleted.', 'success');
    } catch {
      addToast('Failed to delete thread.', 'error');
    }
  };

  const handleClearThread = () => {
    clearActiveThread();
    setChatMessages([]);
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-white text-slate-900 font-display antialiased overflow-hidden">
      <Sidebar
        threads={threads}
        activeThreadId={activeThread?.id ?? null}
        onNewThread={handleClearThread}
        onSelectThread={handleSelectThread}
        onDeleteThread={handleDeleteThread}
        loading={loading}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={closeSidebar}
      />
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={closeSidebar}
        />
      )}
      <main className="flex-1 flex flex-col h-full bg-white relative">
        {activeThread ? (
          <ChatView
            threadTitle={activeThread.title}
            lastUpdated={formatLastUpdated(activeThread.updated_at)}
            messages={chatMessages}
            streamingContent={streamingContent}
            isStreaming={isStreaming}
            error={chatError}
            onSendMessage={handleSendFromChat}
            threadLoading={threadLoading}
            threadId={activeThread.id}
            onOpenSidebar={openSidebar}
          />
        ) : (
          <WelcomeScreen
            onSendMessage={handleSendFromWelcome}
            onOpenSidebar={openSidebar}
          />
        )}
      </main>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
