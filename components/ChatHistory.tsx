import React, { useState, useRef, useEffect } from 'react';
import { ChatSession } from '../types';
import { MessageSquare, MoreVertical, Trash2, Edit2, Check, X, Plus } from 'lucide-react';

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onNewChat: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onDeleteSession, 
  onRenameSession,
  onNewChat
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartEdit = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
    setOpenMenuId(null);
  };

  const handleSaveEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle);
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(id);
    setOpenMenuId(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-zinc-300">
      <div className="p-4 border-b border-zinc-900">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-zinc-100 text-black py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-lg shadow-zinc-900/50"
        >
          <Plus className="w-4 h-4" /> New Conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
        {sessions.length === 0 && (
            <div className="text-center text-zinc-600 text-xs mt-10">No history yet.</div>
        )}
        
        {sessions.map((session) => (
          <div 
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
              currentSessionId === session.id 
                ? 'bg-zinc-900 border-zinc-800 text-zinc-100' 
                : 'border-transparent hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentSessionId === session.id ? 'text-zinc-100' : 'text-zinc-600'}`} />
              
              {editingId === session.id ? (
                <div className="flex items-center gap-1 flex-1" onClick={e => e.stopPropagation()}>
                  <input 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-zinc-950 text-xs p-1 rounded border border-zinc-700 focus:border-zinc-500 outline-none text-zinc-100"
                    autoFocus
                  />
                  <button onClick={(e) => handleSaveEdit(session.id, e)} className="p-1 hover:text-green-400"><Check className="w-3 h-3" /></button>
                  <button onClick={() => setEditingId(null)} className="p-1 hover:text-red-400"><X className="w-3 h-3" /></button>
                </div>
              ) : (
                <span className="text-sm font-medium truncate select-none">{session.title}</span>
              )}
            </div>

            {/* Menu Trigger */}
            {!editingId && (
              <div className="relative ml-2" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === session.id ? null : session.id);
                  }}
                  className={`p-1.5 rounded-md transition-colors ${
                      openMenuId === session.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-600 opacity-0 group-hover:opacity-100 hover:bg-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {/* Dropdown Menu */}
                {openMenuId === session.id && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 top-full mt-1 w-32 bg-[#18181b] border border-zinc-800 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                  >
                    <button 
                      onClick={(e) => handleStartEdit(session, e)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 text-left transition-colors"
                    >
                      <Edit2 className="w-3 h-3" /> Rename
                    </button>
                    <button 
                      onClick={(e) => handleDelete(session.id, e)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-zinc-800 text-left transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;
