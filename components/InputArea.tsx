import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Image, FileText, PenTool, MonitorPlay, BookOpen, Code, BarChart, Camera, Sigma, ArrowUp, Mic } from 'lucide-react';
import { Attachment } from '../types';

interface InputAreaProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
}

// Add declaration for browser Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [interimInput, setInterimInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('File');
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const uploadOptions = [
    { label: 'Photo', icon: Image, accept: 'image/*', color: 'text-pink-400' },
    { label: 'PDF', icon: FileText, accept: 'application/pdf', color: 'text-red-400' },
    { label: 'Handwritten Notes', icon: PenTool, accept: 'image/*,application/pdf', color: 'text-yellow-400' },
    { label: 'Lecture Slides', icon: MonitorPlay, accept: 'application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation', color: 'text-orange-400' },
    { label: 'Research Paper', icon: BookOpen, accept: 'application/pdf', color: 'text-blue-400' },
    { label: 'Code Snippet', icon: Code, accept: 'text/*,application/json,.js,.ts,.py,.java,.c,.cpp,.html,.css', color: 'text-emerald-400' },
    { label: 'Graph / Diagram', icon: BarChart, accept: 'image/*', color: 'text-purple-400' },
    { label: 'Whiteboard Capture', icon: Camera, accept: 'image/*', color: 'text-cyan-400' },
    { label: 'Math Equations', icon: Sigma, accept: 'image/*,.tex,.txt', color: 'text-indigo-400' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUploadMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Use continuous to allow flowing speech
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
             setInput(prev => {
                 const trailingSpace = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
                 return prev + trailingSpace + finalTranscript;
             });
        }
        
        setInterimInput(interimTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimInput('');
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setInterimInput('');
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = () => {
    const fullText = input + interimInput;
    if ((!fullText.trim() && attachments.length === 0) || isLoading) return;
    
    onSendMessage(fullText, attachments);
    setInput('');
    setInterimInput('');
    setAttachments([]);
    
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const triggerFileUpload = (option: typeof uploadOptions[0]) => {
    setActiveCategory(option.label);
    if (fileInputRef.current) {
        fileInputRef.current.accept = option.accept;
        fileInputRef.current.click();
    }
    setShowUploadMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAttachments(prev => [...prev, {
            name: file.name,
            type: file.type,
            data: base64String,
            category: activeCategory
        }]);
      };
      
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6 relative z-50">
       {/* Attachments Preview */}
       {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 animate-fade-in">
          {attachments.map((att, index) => (
            <div key={index} className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur px-3 py-2 rounded-lg text-xs text-zinc-300 border border-zinc-800 shadow-lg">
              <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-wider">{att.category || 'File'}</span>
              <span className="truncate max-w-[120px] font-medium">{att.name}</span>
              <button onClick={() => removeAttachment(index)} className="hover:text-red-400 ml-1 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Menu Popover */}
      {showUploadMenu && (
        <div 
            ref={menuRef}
            className="absolute bottom-full left-0 mb-3 w-64 bg-[#18181b]/95 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="p-2 grid grid-cols-1 gap-1 max-h-[320px] overflow-y-auto custom-scrollbar">
                <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Add Input
                </div>
                {uploadOptions.map((option) => (
                    <button
                        key={option.label}
                        onClick={() => triggerFileUpload(option)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-800/60 transition-all text-left w-full group"
                    >
                        <option.icon className={`w-4 h-4 ${option.color} opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all`} />
                        <span className="text-sm text-zinc-400 group-hover:text-zinc-100 font-medium">{option.label}</span>
                    </button>
                ))}
            </div>
        </div>
      )}

      <div className="relative flex items-end bg-[#18181b] rounded-[24px] border border-zinc-800 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-800 shadow-xl shadow-black/20 transition-all duration-300 p-2">
        <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
        />
        
        <button 
            onClick={(e) => {
                e.stopPropagation();
                setShowUploadMenu(!showUploadMenu);
            }}
            className={`p-3 transition-all duration-300 rounded-full mb-0.5 flex-shrink-0 ${showUploadMenu ? 'bg-zinc-800 text-zinc-100 rotate-90' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}`}
            title="Attach Content"
        >
          <Paperclip className="w-5 h-5" />
        </button>

         {/* Mic Button */}
         <button 
            onClick={toggleListening}
            className={`p-3 transition-all duration-300 rounded-full mb-0.5 flex-shrink-0 mr-1 ${
                isListening 
                ? 'bg-red-500/20 text-red-500 animate-pulse' 
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            title="Voice Input"
        >
          <Mic className={`w-5 h-5 ${isListening ? 'fill-current' : ''}`} />
        </button>

        <textarea
          value={input + interimInput}
          onChange={(e) => {
            setInput(e.target.value);
            setInterimInput(''); // Clear interim if user edits manualy
          }}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Ask C5 NextGen..."}
          className="w-full bg-transparent border-none text-zinc-100 placeholder-zinc-500 py-3.5 px-1 focus:ring-0 resize-none max-h-48 text-[15px] scrollbar-hide leading-relaxed"
          rows={1}
          style={{ minHeight: '52px' }}
        />

        <button
          onClick={handleSend}
          disabled={isLoading || (!(input + interimInput).trim() && attachments.length === 0)}
          className={`p-2.5 mb-1 mr-1 rounded-full transition-all duration-300 flex-shrink-0 transform active:scale-95 ${
            isLoading || (!(input + interimInput).trim() && attachments.length === 0)
              ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
              : 'bg-zinc-100 text-black hover:bg-white shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)]'
          }`}
        >
          {isLoading ? (
             <div className="w-5 h-5 border-2 border-zinc-400 border-t-zinc-600 rounded-full animate-spin" />
          ) : (
            <ArrowUp className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default InputArea;