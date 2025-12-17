import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, RefreshCw, Send } from 'lucide-react';
import { getSecretaryInbox, getConversationMessages, sendConversationMessage, setSecretaryAvailability } from '../chatApi';
import { useToast } from '../contexts/ToastContext';

const SecretaryChat = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [tab, setTab] = useState('open');
  const [inbox, setInbox] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [text, setText] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);

  const selectedConversation = useMemo(
    () => inbox.find((c) => c.id === selectedConversationId) || null,
    [inbox, selectedConversationId]
  );

  const loadInbox = async (nextTab = tab) => {
    setLoadingInbox(true);
    try {
      const data = await getSecretaryInbox(nextTab);
      setInbox(data || []);
      if (!selectedConversationId && (data || []).length > 0) {
        setSelectedConversationId(data[0].id);
      }
    } catch (e) {
      showToast(e.message || 'Failed to load inbox', 'error');
    } finally {
      setLoadingInbox(false);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;
    setLoadingMessages(true);
    try {
      const data = await getConversationMessages(conversationId);
      setMessages(data || []);
    } catch (e) {
      showToast(e.message || 'Failed to load messages', 'error');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadInbox('open');
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await loadInbox(tab);
        if (selectedConversationId) {
          await loadMessages(selectedConversationId);
        }
      } catch {
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [tab, selectedConversationId]);

  const handleSend = async () => {
    if (!selectedConversationId || text.trim().length === 0) return;

    const toSend = text.trim();
    setText('');

    try {
      await sendConversationMessage(selectedConversationId, toSend);
      await loadMessages(selectedConversationId);
      await loadInbox(tab);
    } catch (e) {
      showToast(e.message || 'Failed to send message', 'error');
      setText(toSend);
    }
  };

  const toggleAvailability = async () => {
    try {
      const next = !isAvailable;
      await setSecretaryAvailability(next);
      setIsAvailable(next);
      showToast(next ? 'You are now available' : 'You are now away', 'info');
    } catch (e) {
      showToast(e.message || 'Failed to update availability', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/secretary-dashboard')}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Back to Dashboard
            </button>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Chat Inbox</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ticket-style messages from patients</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleAvailability}
              className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                isAvailable
                  ? 'bg-green-600 text-white border-green-700 hover:bg-green-700'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {isAvailable ? 'Available' : 'Away'}
            </button>
            <button
              onClick={() => {
                loadInbox(tab);
                if (selectedConversationId) loadMessages(selectedConversationId);
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex gap-2">
                {['open', 'waiting', 'closed'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t);
                      setSelectedConversationId(null);
                      setMessages([]);
                      loadInbox(t);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      tab === t
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto">
              {loadingInbox ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : inbox.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No conversations.</div>
              ) : (
                inbox.map((c) => {
                  const active = c.id === selectedConversationId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConversationId(c.id)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        active ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">{c.patientName}</div>
                        <div className="text-xs text-gray-500">#{c.id}</div>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {c.status}
                        </div>
                        <div>{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleString() : ''}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="font-semibold text-gray-900 dark:text-white">
                {selectedConversation ? `Conversation with ${selectedConversation.patientName}` : 'Select a conversation'}
              </div>
              {selectedConversation ? (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Status: {selectedConversation.status} {selectedConversation.assignedSecretaryId ? '' : '(unassigned)'}
                </div>
              ) : null}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-900">
              {!selectedConversationId ? (
                <div className="text-center text-gray-500">Pick a conversation from the inbox.</div>
              ) : loadingMessages ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">No messages yet.</div>
              ) : (
                messages.map((m) => {
                  const isSecretary = (m.senderRole || '').toLowerCase() === 'secretary';
                  return (
                    <div key={m.id} className={`flex ${isSecretary ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                          isSecretary
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div>{m.text}</div>
                        <div className={`mt-1 text-[11px] ${isSecretary ? 'text-white/70' : 'text-gray-400'}`}>
                          {m.sentAt ? new Date(m.sentAt).toLocaleString() : ''}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                  }}
                  disabled={!selectedConversationId}
                  placeholder={selectedConversationId ? 'Type a reply...' : 'Select a conversation first'}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!selectedConversationId || text.trim().length === 0}
                  className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretaryChat;
