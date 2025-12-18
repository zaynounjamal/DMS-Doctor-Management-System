import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Bot, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AIChatWidget from './AIChatWidget';
import PatientChatWidget from './PatientChatWidget';
import { useAuth } from '../../contexts/AuthContext';
import { getUnreadCount } from '../../chatApi';

const UnifiedChatManager = () => {
  const { user } = useAuth();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null); // 'ai' | 'secretary' | null
  const [unreadCount, setUnreadCount] = useState(0);
  const prevUnreadRef = useRef(0);

  const role = (user?.role ?? '').toString().toLowerCase();
  const isPatient = role === 'patient';
  const isSecretary = role === 'secretary';
  const isDoctor = role === 'doctor';
  const isAdmin = role === 'admin';

  const handleOpenSelector = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setIsSelectorOpen(!isSelectorOpen);
  };

  const handleSelectChat = (chatType) => {
    setActiveChat(chatType);
    setIsSelectorOpen(false);
    setUnreadCount(0); // Clear on open
    prevUnreadRef.current = 0;
  };

  const handleCloseChat = () => {
    setActiveChat(null);
  };

  const handleNewMessage = (count = 1) => {
    if (!activeChat) {
      setUnreadCount((prev) => prev + count);
    }
  };

  // Poll unread count from backend (patient only).
  // This makes badge accurate even if message arrives when widget isn't polling yet.
  useEffect(() => {
    if (!isPatient) return;

    let mounted = true;

    const refresh = async () => {
      try {
        const data = await getUnreadCount();
        const next = Number(data?.unreadMessages || 0);
        if (!mounted) return;

        // Only show badge when no chat is open (matches requirement)
        if (!activeChat) {
          setUnreadCount(next);
        }

        prevUnreadRef.current = next;
      } catch {
      }
    };

    refresh();
    const interval = setInterval(refresh, 6000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isPatient, activeChat]);

  // Don't show the unified floating selector for staff panels
  if (isSecretary || isDoctor || isAdmin) {
    return null;
  }

  return (
    <>
      {/* Floating Messages Icon */}
      <div className="fixed bottom-6 right-6 z-[9990]">
        <button
          type="button"
          onClick={handleOpenSelector}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 relative"
          aria-label="Open Messages"
        >
          <MessageSquare className="w-6 h-6" />
          
          {/* Notification Badge */}
          {unreadCount > 0 && !activeChat && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-gray-900 shadow-lg"
            >
              <span className="animate-pulse">{unreadCount}</span>
            </motion.div>
          )}
        </button>

        {/* Selector Popup */}
        <AnimatePresence>
          {isSelectorOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Popup Header */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-primary-light to-accent-light dark:from-primary-dark dark:to-accent-dark">
                <h3 className="font-semibold text-white">Select Chat</h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsSelectorOpen(false);
                  }}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Chat Options */}
              <div className="p-3 space-y-2">
                {/* AI Chat Option */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectChat('ai');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-light dark:bg-primary-dark text-white group-hover:scale-110 transition-transform">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900 dark:text-white">AI Chat</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Ask about treatments & services</div>
                  </div>
                </button>

                {/* Secretary Chat Option - Only for patients */}
                {isPatient && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectChat('secretary');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">Secretary Chat</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Message our support team</div>
                    </div>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Chat Windows */}
      <AIChatWidget
        hideButton={true}
        open={activeChat === 'ai'}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleCloseChat();
        }}
        onNewMessage={handleNewMessage}
      />

      {isPatient && (
        <PatientChatWidget
          hideButton={true}
          open={activeChat === 'secretary'}
          onOpenChange={(isOpen) => {
            if (!isOpen) handleCloseChat();
          }}
          onNewMessage={handleNewMessage}
        />
      )}
    </>
  );
};

export default UnifiedChatManager;
