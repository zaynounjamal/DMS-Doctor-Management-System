import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { startChat, getConversationMessages, sendConversationMessage, markConversationRead, getUnreadCount } from '../../chatApi';
import { useToast } from '../../contexts/ToastContext';
import { getChatHubConnection, isChatHubConnected, joinConversationGroup, leaveConversationGroup, startChatHub } from '../../signalr/chatHub';

const PatientChatWidget = ({ hideButton = false, open: controlledOpen, onOpenChange, onNewMessage }) => {
  const { showToast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef(null);
  const chatWindowRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const prevMessageCount = useRef(0);

  const canSend = useMemo(() => text.trim().length > 0 && !!conversationId, [text, conversationId]);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loadConversation = async (id) => {
    const msgs = await getConversationMessages(id);
    setMessages(msgs || []);
    setTimeout(scrollToBottom, 50);
  };

  const refreshUnread = async () => {
    try {
      const data = await getUnreadCount();
      const next = Number(data?.unreadMessages || 0);
      setUnreadCount((prev) => {
        if (!open && next > prev) {
          showToast('New chat message received', 'info');
          if (onNewMessage) onNewMessage(next - prev);
        }
        return next;
      });
    } catch {
    }
  };

  const initChat = async () => {
    setLoading(true);
    try {
      const res = await startChat();
      setConversationId(res.conversationId);
      setInfoMessage(res.infoMessage || null);
      await loadConversation(res.conversationId);
    } catch (e) {
      showToast(e.message || 'Failed to start chat', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !conversationId) {
      initChat();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      refreshUnread();
      const interval = setInterval(() => {
        if (!isChatHubConnected()) {
          refreshUnread();
        }
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [open]);

  useEffect(() => {
    if (open && conversationId) {
      markConversationRead(conversationId)
        .then(() => refreshUnread())
        .catch(() => {
        });
    }
  }, [open, conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(async () => {
      if (isChatHubConnected()) return;
      try {
        await loadConversation(conversationId);
      } catch {
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [conversationId]);

  // SignalR: live unread + live messages
  useEffect(() => {
    let mounted = true;
    const conn = getChatHubConnection();

    const onUnread = (payload) => {
      if (!mounted) return;
      const next = Number(payload?.unreadMessages || 0);
      setUnreadCount((prev) => {
        if (!open && next > prev) {
          showToast('New chat message received', 'info');
          if (onNewMessage) onNewMessage(next - prev);
        }
        return next;
      });
    };

    const onMessage = (m) => {
      if (!mounted) return;
      if (!m) return;
      const msgConvId = Number(m.conversationId ?? m.ConversationId);
      if (!conversationId || msgConvId !== Number(conversationId)) return;

      setMessages((prev) => {
        const id = m.id ?? m.Id;
        if (prev.some(x => (x.id ?? x.Id) === id)) return prev;
        return [...prev, m];
      });
      setTimeout(scrollToBottom, 50);
    };

    startChatHub().catch(() => {
    });

    conn.on('chat:unread', onUnread);
    conn.on('chat:message', onMessage);

    return () => {
      mounted = false;
      conn.off('chat:unread', onUnread);
      conn.off('chat:message', onMessage);
    };
  }, [open, conversationId, showToast, onNewMessage]);

  useEffect(() => {
    if (!conversationId) return;
    joinConversationGroup(conversationId);
    return () => {
      leaveConversationGroup(conversationId);
    };
  }, [conversationId]);

  const handleSend = async () => {
    if (!canSend) return;

    const toSend = text.trim();
    setText('');

    try {
      await sendConversationMessage(conversationId, toSend);
      await loadConversation(conversationId);
    } catch (e) {
      showToast(e.message || 'Failed to send message', 'error');
      setText(toSend);
    }
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!open && hideButton) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="relative">
            Chat
            {unreadCount > 0 ? (
              <span className="absolute -top-2 -right-4 inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            ) : null}
          </span>
        </button>
      ) : (
        <div 
          ref={chatWindowRef}
          className="w-[360px] max-w-[90vw] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <div 
            className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white"
            onMouseDown={handleMouseDown}
            style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          >
            <div className="font-semibold">Secretary Support</div>
            <button type="button" onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }} className="p-1 rounded hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700">
            {infoMessage ? infoMessage : 'Send a message to the secretary.'}
          </div>

          <div className="h-[320px] overflow-y-auto px-4 py-3 space-y-2 bg-gray-50 dark:bg-gray-900">
            {loading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500">No messages yet.</div>
            ) : (
              messages.map((m) => {
                const isPatient = (m.senderRole || '').toLowerCase() === 'patient';
                return (
                  <div key={m.id} className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                        isPatient
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div>{m.text}</div>
                      <div className={`mt-1 text-[11px] ${isPatient ? 'text-white/70' : 'text-gray-400'}`}>
                        {m.sentAt ? new Date(m.sentAt).toLocaleString() : ''}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder={conversationId ? 'Type a message...' : 'Starting chat...'}
                disabled={!conversationId || loading}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSend}
                disabled={!canSend || loading}
                className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientChatWidget;
