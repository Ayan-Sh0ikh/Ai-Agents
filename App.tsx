import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import InputArea from './components/InputArea';
import MessageBubble from './components/MessageBubble';
import CognitiveGraph from './components/CognitiveGraph';
import ChatHistory from './components/ChatHistory';
import LoginPage from './components/LoginPage';
import OnboardingPage from './components/OnboardingPage';
import LiveSession from './components/LiveSession';
import { sendMessageToC5 } from './services/geminiService';
import { Message, UserLevel, LearningMode, SkillNode, Attachment, ChatSession, AppState, UserProfile } from './types';
import { Settings, BarChart3, GraduationCap, Microscope, BookOpen, Layers, Target, Compass, Brain, LogOut, Phone } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  // --- Global App State ---
  const [appState, setAppState] = useState<AppState>('AUTH');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // --- Chat State ---
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
     try {
         const saved = localStorage.getItem('c5_sessions');
         return saved ? JSON.parse(saved) : [];
     } catch (e) { return []; }
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // --- Derived State ---
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession ? currentSession.messages : [];

  // --- UI State ---
  const [userLevel, setUserLevel] = useState<UserLevel>(UserLevel.INTERMEDIATE);
  const [learningMode, setLearningMode] = useState<LearningMode>(LearningMode.STANDARD);
  const [isLoading, setIsLoading] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showLiveSession, setShowLiveSession] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Persistence & Initialization ---
  useEffect(() => {
    // Check for existing login session
    const savedProfile = localStorage.getItem('c5_profile');
    if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
        setAppState('APP');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('c5_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // --- Auth Handlers ---
  const handleLoginSuccess = () => {
      // If we have a profile saved already, skip onboarding, else go to onboarding
      if (localStorage.getItem('c5_profile')) {
          setAppState('APP');
      } else {
          setAppState('ONBOARDING');
      }
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
      setUserProfile(profile);
      localStorage.setItem('c5_profile', JSON.stringify(profile));
      setAppState('APP');
      
      // Initialize first chat customized to user
      if (sessions.length === 0) {
          createNewSession(profile);
      }
  };

  // --- Chat Logic ---
  useEffect(() => {
    if (appState === 'APP') {
        if (sessions.length === 0) {
            createNewSession(userProfile || undefined);
        } else if (!currentSessionId) {
            const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
            setCurrentSessionId(sorted[0].id);
        }
    }
  }, [appState]);

  const createNewSession = (profile?: UserProfile) => {
    const greeting = profile 
        ? `Hello ${profile.name.split(' ')[0]}! I see you are at the ${profile.educationLevel} level. How can I help with your studies today?` 
        : "Hello! I'm C5 NextGen-AI. Ready to assist.";

    const newSession: ChatSession = {
        id: generateId(),
        title: 'New Conversation',
        messages: [{
            id: 'welcome',
            role: 'model',
            content: greeting,
            timestamp: Date.now(),
            levelUsed: UserLevel.BEGINNER
        }],
        updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 768) setHistoryOpen(false);
  };

  const updateCurrentSessionMessages = (newMessages: Message[]) => {
      if (!currentSessionId) return;
      
      setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
              let title = s.title;
              if (s.messages.length <= 1 && newMessages.length > 1) {
                  const firstUserMsg = newMessages.find(m => m.role === 'user');
                  if (firstUserMsg) {
                      title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
                  }
              }
              return { ...s, messages: newMessages, title, updatedAt: Date.now() };
          }
          return s;
      }));
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments: attachments
    };

    const updatedMessages = [...messages, newUserMsg];
    updateCurrentSessionMessages(updatedMessages);
    setIsLoading(true);

    // Simulate cognitive drift
    setSkillData(prev => prev.map(node => ({
        ...node,
        score: Math.min(100, Math.max(0, node.score + (Math.random() * 6 - 2)))
    })));

    try {
      const history = updatedMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      // Inject user profile context into system if needed (simplified here)
      const contextPrompt = userProfile 
        ? `[User Context: Name=${userProfile.name}, Level=${userProfile.educationLevel}] ${text}` 
        : text;

      const responseText = await sendMessageToC5(
        contextPrompt, 
        history, 
        userLevel, 
        learningMode,
        attachments
      );

      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
        levelUsed: userLevel
      };

      updateCurrentSessionMessages([...updatedMessages, newBotMsg]);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I encountered a cognitive processing error. Please check your connection.",
        timestamp: Date.now(),
        levelUsed: userLevel
      };
      updateCurrentSessionMessages([...updatedMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const handleDeleteSession = (id: string) => {
      const remaining = sessions.filter(s => s.id !== id);
      setSessions(remaining);
      if (currentSessionId === id) {
          if (remaining.length > 0) setCurrentSessionId(remaining[0].id);
          else if (appState === 'APP') createNewSession(userProfile || undefined);
      }
  };

  // Mock Cognitive Data
  const [skillData, setSkillData] = useState<SkillNode[]>([
    { subject: 'Conceptual', score: 65, fullMark: 100 },
    { subject: 'Logic', score: 40, fullMark: 100 },
    { subject: 'Application', score: 80, fullMark: 100 },
    { subject: 'Retention', score: 55, fullMark: 100 },
    { subject: 'Creativity', score: 70, fullMark: 100 },
  ]);

  // --- RENDER FLOW ---

  if (appState === 'AUTH') {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (appState === 'ONBOARDING') {
      return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  // --- APP CONTENT ---

  const SidebarContent = (
    <div className="flex flex-col gap-8 animate-fade-in h-full">
      <div className="space-y-8 flex-1">
        {/* Profile Summary */}
        {userProfile && (
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Scholar Profile</div>
                <div className="text-zinc-100 font-semibold">{userProfile.name}</div>
                <div className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" /> {userProfile.educationLevel}
                </div>
            </div>
        )}

        {/* Level Selector */}
        <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                Cognitive Depth
            </h3>
            <div className="flex flex-col gap-1.5">
            {Object.values(UserLevel).map((lvl) => (
                <button
                key={lvl}
                onClick={() => setUserLevel(lvl)}
                className={`text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border font-medium flex items-center justify-between ${
                    userLevel === lvl 
                    ? 'bg-zinc-900/80 text-zinc-100 border-zinc-800 shadow-sm'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900/40'
                }`}
                >
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        lvl === UserLevel.BEGINNER ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : lvl === UserLevel.INTERMEDIATE ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                    }`} />
                    {lvl}
                </div>
                </button>
            ))}
            </div>
        </div>

        {/* Mode Selector */}
        <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                Learning Mode
            </h3>
            <div className="flex flex-col gap-1.5">
            {Object.values(LearningMode).map((mode) => (
                <button
                key={mode}
                onClick={() => setLearningMode(mode)}
                className={`text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 border flex items-center gap-3 font-medium ${
                    learningMode === mode
                    ? 'bg-zinc-900/80 text-zinc-100 border-zinc-800 shadow-sm'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900/40'
                }`}
                >
                {mode === LearningMode.SOCRATIC && <Brain className="w-4 h-4" />}
                {mode === LearningMode.DEVILS_ADVOCATE && <Target className="w-4 h-4" />}
                {mode === LearningMode.RESEARCH && <BookOpen className="w-4 h-4" />}
                {mode === LearningMode.STANDARD && <Compass className="w-4 h-4" />}
                {mode === LearningMode.EXPLAIN_BACK && <GraduationCap className="w-4 h-4" />}
                {mode}
                </button>
            ))}
            </div>
        </div>

        {/* Cognitive Stats */}
        <div className="pt-4 border-t border-zinc-900/50">
            <CognitiveGraph data={skillData} />
        </div>
      </div>

      {/* Sign Out Button - Brighter and Professional */}
      <div className="pt-2">
         <button 
            onClick={() => {
                // Logout Logic
                localStorage.removeItem('c5_profile');
                setAppState('AUTH');
            }} 
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 hover:bg-red-600 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-900/40 transition-all duration-200 group font-semibold shadow-md"
         >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-sm">Sign Out</span>
         </button>
      </div>
    </div>
  );

  return (
    <>
      {showLiveSession && <LiveSession onClose={() => setShowLiveSession(false)} />}
      
      <Layout 
        sidebarContent={SidebarContent} 
        historyContent={
          <ChatHistory 
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={(id) => {
              setCurrentSessionId(id);
              if (window.innerWidth < 768) setHistoryOpen(false);
            }}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
            onNewChat={() => createNewSession(userProfile || undefined)}
          />
        }
        isLeftSidebarOpen={leftSidebarOpen}
        setIsLeftSidebarOpen={setLeftSidebarOpen}
        isHistoryOpen={historyOpen}
        setIsHistoryOpen={setHistoryOpen}
      >
        <div className="flex flex-col h-full relative">
          
          {/* Header Override to add Call Button */}
          <div className="absolute top-0 right-14 z-50 p-2.5">
              <button 
                  onClick={() => setShowLiveSession(true)}
                  className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all"
              >
                  <Phone className="w-3.5 h-3.5" /> Live Call
              </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-4 bg-[#09090b]">
            <div className="max-w-3xl mx-auto flex flex-col gap-4">
              {messages.map((msg, index) => (
                <div key={msg.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <MessageBubble message={msg} />
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-6 animate-fade-in">
                    <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
              )}
              <div ref={chatEndRef} className="h-4" />
            </div>
          </div>

          <div className="w-full bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent pt-10 pb-4 z-10">
            <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default App;