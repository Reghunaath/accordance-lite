function App() {
  return (
    <div className="flex h-screen bg-white text-slate-900 font-display antialiased">
      <aside className="w-[280px] h-full flex flex-col bg-bg-sidebar border-r border-slate-200 shrink-0">
        <div className="p-4 flex items-center justify-center h-full">
          <p className="text-slate-400 text-sm">Sidebar placeholder</p>
        </div>
      </aside>
      <main className="flex-1 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Accordance Lite — scaffolding complete</p>
      </main>
    </div>
  )
}

export default App
