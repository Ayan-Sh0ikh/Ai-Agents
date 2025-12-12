import React from 'react';
import { Menu, Zap, History, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
  historyContent: React.ReactNode;
  isLeftSidebarOpen: boolean;
  setIsLeftSidebarOpen: (v: boolean) => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (v: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  sidebarContent, 
  historyContent, 
  isLeftSidebarOpen, 
  setIsLeftSidebarOpen,
  isHistoryOpen,
  setIsHistoryOpen
}) => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-700 selection:text-white">
      {/* Left Sidebar (Settings/Controls) */}
      <aside 
        className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-[#09090b]/95 backdrop-blur-xl border-r border-zinc-900/50 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
            ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:relative md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
            <div className="p-6 flex items-center gap-3">
                <div className="w-9 h-9 bg-zinc-100 rounded-xl flex items-center justify-center shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
                    <span className="font-bold text-black text-lg">C5</span>
                </div>
                <div>
                    <h1 className="font-semibold text-zinc-100 tracking-tight text-sm">NextGen-AI</h1>
                    <p className="text-[10px] text-zinc-500 font-medium">Research Operating System</p>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {sidebarContent}
            </div>

            <div className="p-4 border-t border-zinc-900/50">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
                    <Zap className="w-3 h-3 text-emerald-500" />
                    <span>System Online</span>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative w-full bg-[#09090b] transition-all duration-300">
        
        {/* Header (Top Bar) */}
        <header className="flex items-center justify-between p-4 border-b border-zinc-900/50 bg-[#09090b]/80 backdrop-blur-md z-40 sticky top-0">
             <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} 
                    className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <span className="md:hidden font-semibold text-zinc-100 text-sm">C5 NextGen</span>
             </div>

             <button 
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={`p-2.5 rounded-xl transition-all duration-200 border ${isHistoryOpen ? 'bg-zinc-100 text-black border-zinc-100 shadow-[0_0_15px_-3px_rgba(255,255,255,0.4)]' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'}`}
                title="Chat History"
             >
                <History className="w-5 h-5" />
             </button>
        </header>
        
        <main className="flex-1 overflow-hidden relative">
            {children}
        </main>
      </div>

      {/* Right Sidebar (History) - Slide Over */}
      <aside 
        className={`
            fixed inset-y-0 right-0 z-50 w-80 bg-[#0c0c0e]/95 backdrop-blur-2xl border-l border-zinc-900/50 shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]
            ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
         <div className="flex flex-col h-full">
            <div className="p-5 flex items-center justify-between border-b border-zinc-900/50">
                <h2 className="text-sm font-semibold text-zinc-100">Chat History</h2>
                <button onClick={() => setIsHistoryOpen(false)} className="p-1 text-zinc-500 hover:text-zinc-100 rounded-md hover:bg-zinc-800">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-1 overflow-hidden">
                {historyContent}
            </div>
         </div>
      </aside>

      {/* Overlay for mobile sidebars */}
      {(isLeftSidebarOpen || isHistoryOpen) && (
        <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => {
                setIsLeftSidebarOpen(false);
                setIsHistoryOpen(false);
            }}
        />
      )}
      
      {/* Desktop Overlay for Right Sidebar (Optional, if we want to dim main content) */}
      {isHistoryOpen && (
          <div 
            className="hidden md:block fixed inset-0 bg-black/20 z-30 pointer-events-none transition-opacity duration-300"
          />
      )}
    </div>
  );
};

export default Layout;
