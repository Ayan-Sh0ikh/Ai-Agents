import React from 'react';
import { Message, UserLevel } from '../types';
import { User, Bot, Paperclip, BookOpen, Brain, ShieldCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Format the text with markdown-like logic (simple bolding/headers)
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('### ')) {
          return <h4 key={i} className="text-base font-bold text-zinc-100 mt-5 mb-2">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
           return <p key={i} className="mb-3 font-bold text-zinc-200">{line.replace(/\*\*/g, '')}</p>
      }
      
      // List items
      if (line.trim().startsWith('- ')) {
         const parts = line.split('**');
         return (
             <li key={i} className="ml-4 list-disc pl-1 mb-1 text-zinc-300">
                {parts.map((part, index) => 
                  index % 2 === 1 ? <strong key={index} className="text-zinc-100 font-semibold">{part}</strong> : part
                )}
             </li>
         )
      }

      // Normal paragraph
      const boldPattern = /\*\*(.*?)\*\*/g;
      const parts = line.split(boldPattern);
      return (
        <p key={i} className="mb-3 leading-7 text-zinc-300">
          {parts.map((part, index) => 
            index % 2 === 1 ? <strong key={index} className="text-zinc-100 font-semibold">{part}</strong> : part
          )}
        </p>
      );
    });
  };

  if (isUser) {
      return (
        <div className="flex w-full mb-6 justify-end">
            <div className="flex max-w-[85%] md:max-w-[70%] justify-end">
                <div className="bg-[#27272a] text-zinc-100 px-5 py-3 rounded-2xl rounded-tr-sm">
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {message.attachments.map((att, idx) => (
                            <div key={idx} className="bg-black/20 px-2 py-1 rounded text-xs flex items-center gap-1 border border-white/10">
                                <Paperclip className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">{att.name}</span>
                            </div>
                            ))}
                        </div>
                    )}
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {message.content}
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // Bot Response - Clean, transparent, icon on left
  return (
    <div className="flex w-full mb-8 justify-start group">
        <div className="flex max-w-3xl gap-4 w-full">
            {/* Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center bg-black mt-1">
                 <span className="font-bold text-[10px] text-zinc-100">C5</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                 {/* Name */}
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-zinc-100">C5 Smart Intelligence</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider border border-zinc-800 px-1.5 py-0.5 rounded">
                        {message.levelUsed || 'AI'}
                    </span>
                 </div>

                 <div className="prose prose-invert max-w-none text-[15px] text-zinc-300">
                    {formatText(message.content)}
                 </div>
            </div>
        </div>
    </div>
  );
};

export default MessageBubble;
