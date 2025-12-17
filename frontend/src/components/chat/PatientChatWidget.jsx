import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { startChat, getConversationMessages, sendConversationMessage } from '../../chatApi';
import { useToast } from '../../contexts/ToastContext';

const PatientChatWidget = () => {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

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
    if (!open || !conversationId) return;

    const interval = setInterval(async () => {
      try {
        await loadConversation(conversationId);
      } catch {
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [open, conversationId]);

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

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700"
        >
          <MessageCircle className="w-5 h-5" />
          Chat
        </button>
      ) : (
        <div className="w-[360px] max-w-[90vw] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white">
            <div className="font-semibold">Secretary Support</div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/10">
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
