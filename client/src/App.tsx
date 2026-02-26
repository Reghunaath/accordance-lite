import { useState } from 'react';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ChatView from './components/ChatView';

// Static placeholder threads for layout testing
const MOCK_THREADS = [
  { id: '1', title: 'Taxability of SaaS Contracts', timestamp: '2 hours ago' },
  { id: '2', title: 'IRC §1031 Exchange Requirements', timestamp: 'Yesterday' },
  { id: '3', title: 'R&D Credit Qualification', timestamp: '2 days ago' },
  { id: '4', title: 'Nexus Thresholds by State', timestamp: '3 days ago' },
  { id: '5', title: 'Crypto Asset Depreciation', timestamp: 'Last week' },
  { id: '6', title: 'Foreign Tax Credit Limits', timestamp: 'Last week' },
  { id: '7', title: 'Section 179 Expensing 2024', timestamp: '2 weeks ago' },
];

function App() {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const handleNewThread = () => {
    setActiveThreadId(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSendFromWelcome = (_content: string) => {
    // Will be wired in Step 5 (thread management)
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSendFromChat = (_content: string) => {
    // Will be wired in Step 6 (chat interface)
  };

  return (
    <div className="flex h-screen bg-white text-slate-900 font-display antialiased overflow-hidden">
      <Sidebar
        threads={MOCK_THREADS}
        activeThreadId={activeThreadId}
        onNewThread={handleNewThread}
        onSelectThread={setActiveThreadId}
        onDeleteThread={() => {}}
      />
      <main className="flex-1 flex flex-col h-full bg-white relative">
        {activeThreadId ? (
          <ChatView
            threadTitle="IRC §1031 Exchange Requirements"
            lastUpdated="Last updated today at 10:42 AM"
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
