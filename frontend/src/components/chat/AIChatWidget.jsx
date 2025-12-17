import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AI_URL } from '../../config';

const DEFAULT_SUGGESTIONS = [
  { en: 'What payment methods are supported?', ar: 'ما هي طرق الدفع المتاحة؟' },
  { en: 'Show me available appointment slots for a doctor.', ar: 'أظهر لي أوقات المواعيد المتاحة لطبيب.' },
  { en: 'What treatments do you provide?', ar: 'ما هي العلاجات المتوفرة؟' },
];

const AIChatWidget = ({ bottomOffsetPx = 20 }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Ask me about treatments, doctors availability, and payment methods.\nاسألني عن العلاجات، توفر الأطباء، وطرق الدفع.',
    },
  ]);

  const listRef = useRef(null);

  const aiBaseUrl = useMemo(() => (AI_URL || 'http://localhost:8001').replace(/\/$/, ''), []);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, messages]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || loading) return;

    setError('');
    setLoading(true);
    setInput('');

    const nextMessages = [...messages, { role: 'user', content: message }];
    setMessages(nextMessages);

    try {
      const res = await fetch(`${aiBaseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = data?.detail || `AI service error (${res.status})`;
        throw new Error(detail);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data?.answer ?? '' }]);
    } catch (e) {
      setError(e?.message || 'Failed to contact AI service');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'AI service is not reachable right now. Please make sure it is running on http://localhost:8001.\nالخدمة غير متاحة الآن. تأكد من تشغيلها على http://localhost:8001.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-5 z-[9999]" style={{ bottom: bottomOffsetPx }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full px-4 py-3 bg-primary-light dark:bg-primary-dark text-white shadow-lg hover:shadow-xl transition"
        >
          AI Chat
        </button>
      ) : (
        <div className="w-[320px] sm:w-[380px] h-[520px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="font-semibold text-gray-900 dark:text-white">Clinic AI</div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Close
            </button>
          </div>

          <div ref={listRef} className="flex-1 px-3 py-3 overflow-y-auto space-y-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={
                  m.role === 'user'
                    ? 'flex justify-end'
                    : 'flex justify-start'
                }
              >
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] bg-primary-light dark:bg-primary-dark text-white rounded-2xl rounded-br-md px-3 py-2 text-sm whitespace-pre-wrap'
                      : 'max-w-[85%] bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md px-3 py-2 text-sm whitespace-pre-wrap'
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl rounded-bl-md px-3 py-2 text-sm">
                  Typing...
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-600 dark:text-red-400 px-1">{error}</div>
            )}
          </div>

          <div className="px-3 pb-3">
            <div className="flex gap-2 flex-wrap mb-2">
              {DEFAULT_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => send(`${s.ar} / ${s.en}`)}
                  className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {s.en}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') send();
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm outline-none"
                placeholder="Type your question... / اكتب سؤالك"
                disabled={loading}
              />
              <button
                onClick={() => send()}
                disabled={loading || !input.trim()}
                className="px-4 py-2 rounded-xl bg-accent-light dark:bg-accent-dark text-white text-sm disabled:opacity-50"
              >
                Send
              </button>
            </div>

            <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
              AI URL: {aiBaseUrl}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatWidget;
