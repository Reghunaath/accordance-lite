import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ChatView from './components/ChatView';
import { useThreads } from './hooks/useThreads';
import { useChat } from './hooks/useChat';
import { formatLastUpdated } from './utils/time';

function App() {
  const {
    threads,
    activeThread,
    activeMessages,
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
    sendMessage,
    setMessages: setChatMessages,
  } = useChat();

  // Sync thread messages into chat when selecting a thread
  useEffect(() => {
    setChatMessages(activeMessages);
  }, [activeMessages, setChatMessages]);

  const handleSendFromWelcome = async (content: string) => {
    try {
      const threadId = await createThread(content);
      await sendMessage(threadId, content);
      await refreshThreads();
    } catch (err) {
      console.error('Failed to create thread:', err);
    }
  };

  const handleSendFromChat = async (content: string) => {
    if (!activeThread) return;
    await sendMessage(activeThread.id, content);
    await refreshThreads();
  };

  const handleSelectThread = async (id: string) => {
    await selectThread(id);
  };

  const handleClearThread = () => {
    clearActiveThread();
    setChatMessages([]);
  };

  return (
    <div className="flex h-screen bg-white text-slate-900 font-display antialiased overflow-hidden">
      <Sidebar
        threads={threads}
        activeThreadId={activeThread?.id ?? null}
        onNewThread={handleClearThread}
        onSelectThread={handleSelectThread}
        onDeleteThread={deleteThread}
      />
      <main className="flex-1 flex flex-col h-full bg-white relative">
        {activeThread ? (
          <ChatView
            threadTitle={activeThread.title}
            lastUpdated={formatLastUpdated(activeThread.updated_at)}
            messages={chatMessages}
            streamingContent={streamingContent}
            isStreaming={isStreaming}
            onSendMessage={handleSendFromChat}
          />
        ) : (
          <WelcomeScreen onSendMessage={handleSendFromWelcome} />
        )}
      </main>
    </div>
  );
}

export default App;
