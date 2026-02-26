import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ChatView from './components/ChatView';
import { useThreads } from './hooks/useThreads';
import { formatLastUpdated } from './utils/time';

function App() {
  const {
    threads,
    activeThread,
    activeMessages,
    selectThread,
    createAndSendMessage,
    deleteThread,
    clearActiveThread,
  } = useThreads();

  return (
    <div className="flex h-screen bg-white text-slate-900 font-display antialiased overflow-hidden">
      <Sidebar
        threads={threads}
        activeThreadId={activeThread?.id ?? null}
        onNewThread={clearActiveThread}
        onSelectThread={selectThread}
        onDeleteThread={deleteThread}
      />
      <main className="flex-1 flex flex-col h-full bg-white relative">
        {activeThread ? (
          <ChatView
            threadTitle={activeThread.title}
            lastUpdated={formatLastUpdated(activeThread.updated_at)}
            messages={activeMessages}
            onSendMessage={(content) => {
              // Will be fully wired in Step 6 (chat interface)
              console.log('Send from chat:', content);
            }}
          />
        ) : (
          <WelcomeScreen onSendMessage={createAndSendMessage} />
        )}
      </main>
    </div>
  );
}

export default App;
