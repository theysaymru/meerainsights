import { useState, useEffect, useRef } from 'react';

const SUGGESTED = [
  'What should I fix first?',
  'Are customers happy with the quality?',
  'What do people love most?',
  'Any delivery or packaging complaints?',
];

export default function AskMeera({ analysisId, reviews, apiBase, onShowToast }) {
  const [enabled, setEnabled] = useState(null); // null = checking
  const [messages, setMessages] = useState([]); // { role: 'user'|'meera', text }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch(`${apiBase}/api/ai-status`)
      .then(r => r.ok ? r.json() : { enabled: false })
      .then(d => setEnabled(Boolean(d.enabled)))
      .catch(() => setEnabled(false));
  }, [apiBase]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const ask = async (question) => {
    const q = (question ?? input).trim();
    if (!q || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, analysisId, reviews }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'meera', text: data.error || 'Sorry, I could not answer that right now.', error: true }]);
      } else {
        setMessages(prev => [...prev, { role: 'meera', text: data.answer }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'meera', text: 'Could not reach the server. Please try again.', error: true }]);
    } finally {
      setLoading(false);
    }
  };

  // AI mode not configured — hide the feature entirely so the app looks complete.
  if (enabled === false) return null;
  if (enabled === null) return null; // still checking; render nothing to avoid flicker

  return (
    <section>
      <div className="bg-gradient-to-br from-meesho-purple/5 to-meesho-pink/5 rounded-2xl border border-meesho-purple/20 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">💬</span>
          <h2 className="font-bold text-meesho-purple text-lg">Ask Meera</h2>
          <span className="text-xs bg-meesho-purple/10 text-meesho-purple px-2 py-0.5 rounded-full font-semibold">AI</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">Ask anything about these reviews — answers are grounded in the actual customer text.</p>

        {/* Conversation */}
        {messages.length > 0 && (
          <div ref={scrollRef} className="max-h-80 overflow-y-auto space-y-3 mb-4 pr-1">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-meesho-pink text-white rounded-br-sm'
                    : m.error
                      ? 'bg-red-50 text-red-600 border border-red-100 rounded-bl-sm'
                      : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-meesho-purple/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-meesho-purple/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-meesho-purple/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Suggested questions (only before first message) */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTED.map(s => (
              <button key={s} onClick={() => ask(s)} disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full border border-meesho-purple/30 text-meesho-purple hover:bg-meesho-purple/5 transition-all disabled:opacity-40 font-medium">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') ask(); }}
            placeholder="Ask about these reviews…"
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-200 focus:border-meesho-purple focus:ring-2 focus:ring-meesho-purple/20 px-4 py-2.5 text-sm text-gray-700 transition-all disabled:opacity-50 placeholder-gray-400"
          />
          <button onClick={() => ask()} disabled={loading || !input.trim()}
            className="px-5 py-2.5 rounded-xl bg-meesho-purple text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? '…' : 'Ask'}
          </button>
        </div>
        <p className="text-xs text-gray-300 mt-2">Meera only answers from your reviews and won't invent information.</p>
      </div>
    </section>
  );
}
