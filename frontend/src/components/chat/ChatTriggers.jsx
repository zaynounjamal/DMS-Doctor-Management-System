import React, { useState, useRef, useEffect } from 'react';
import { Bot, MessageCircle } from 'lucide-react';

const ChatTriggers = ({ user, onAIClick, onMessagingClick }) => {
  const [showAITooltip, setShowAITooltip] = useState(false);
  const [showMsgTooltip, setShowMsgTooltip] = useState(false);
  const aiTimeoutRef = useRef(null);
  const msgTimeoutRef = useRef(null);

  const handleMouseEnter = (type) => {
    if (type === 'ai') {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
      setShowAITooltip(true);
    } else {
      if (msgTimeoutRef.current) clearTimeout(msgTimeoutRef.current);
      setShowMsgTooltip(true);
    }
  };

  const handleMouseLeave = (type) => {
    if (type === 'ai') {
      aiTimeoutRef.current = setTimeout(() => setShowAITooltip(false), 200);
    } else {
      msgTimeoutRef.current = setTimeout(() => setShowMsgTooltip(false), 200);
    }
  };

  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
      if (msgTimeoutRef.current) clearTimeout(msgTimeoutRef.current);
    };
  }, []);

  const isPatient = user?.role?.toLowerCase() === 'patient';

  return (
    <div className="flex items-center gap-2">
      {/* AI Chat Button */}
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAIClick();
          }}
          onMouseEnter={() => handleMouseEnter('ai')}
          onMouseLeave={() => handleMouseLeave('ai')}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="AI Chat"
        >
          <Bot className="w-5 h-5" />
        </button>
        {showAITooltip && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
            AI Chat
          </div>
        )}
      </div>

      {/* Messaging Chat Button - Only for patients */}
      {isPatient && (
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMessagingClick();
            }}
            onMouseEnter={() => handleMouseEnter('msg')}
            onMouseLeave={() => handleMouseLeave('msg')}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Messaging"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          {showMsgTooltip && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
              Secretary Chat
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatTriggers;
