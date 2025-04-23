
import React from 'react';

// Using the two uploaded images for avatars (URLs given by your system)
const CHATBOT_AVATAR_URL = "/lovable-uploads/7d7a7653-7c29-41e9-84eb-b8f5f9939e91.png"; // better avatar for bot, from user attachment, first image
const USER_AVATAR_URL = "/lovable-uploads/636d3f3b-f98d-4539-a003-5afe36b96701.png"; // user avatar from original system image

import { X, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChatHeaderProps {
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
  return (
    <div 
      className="
        finny-chat-header 
        flex items-center justify-between 
        bg-gradient-to-r from-green-400 via-teal-500 to-green-600 
        shadow-md 
        rounded-t-xl 
        px-4 py-3
        border-b border-green-700
        "
    >
      <div className="flex items-center gap-3">
        <img 
          src={CHATBOT_AVATAR_URL} 
          alt="Finny Avatar" 
          className="w-10 h-10 rounded-full ring-2 ring-green-300 shadow-sm object-cover" 
          draggable={false}
        />
        <div className="text-lg font-semibold text-white flex items-center gap-2 select-none">
          <span className="text-yellow-400 text-2xl">💰</span>
          Finny
          <Badge 
            variant="outline" 
            className="px-2 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
          >
            AI Assistant
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          className="text-white hover:text-green-100 rounded-full p-2 hover:bg-green-700/50 transition-colors"
          aria-label="Help"
          title="Help"
        >
          <HelpCircle size={18} />
        </button>
        <button 
          onClick={onClose} 
          className="text-white hover:text-green-100 rounded-full p-2 hover:bg-green-700/50 transition-colors"
          aria-label="Close chat"
          title="Close chat"
        >
          <X size={18} />
        </button>
        <img 
          src={USER_AVATAR_URL}
          alt="User Avatar"
          className="w-9 h-9 rounded-full ring-2 ring-green-300 shadow-sm object-cover"
          draggable={false}
          title="You"
        />
      </div>
    </div>
  );
};

export default ChatHeader;
