import { useState, useEffect, useRef } from 'react';

const SUGGESTED = [
  'What should I fix first?',
  'Are customers happy with the quality?',
  'What do people love most?',
  'Any delivery complaints?',
];

export default function AskMeera({ analysisId, reviews, apiBase }) {
  const [enabled, setEnabled] = useState(null); // gateway reachable?
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [messages, setMessages] = useState([]); // { role: 'user'|'meera', text, error? }
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
  }, [messages, loading, open]);

  const hasContext = Boolean((reviews && reviews.trim()) || analysisId);

  const ask = async (question) => {
    const q = (question ?? input).trim();
    if (!q || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    // No reviews loaded yet (e.g. empty homepage) — guide instead of erroring.
    if (!hasContext) {
      setMessages(prev => [...prev, { role: 'meera', text: 'Paste or load some customer reviews first (try a sample category), then I can answer questions about them.' }]);
      return;
    }
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

  // Show the bubble whenever AI is configured (key present). If the gateway is
  // unreachable, asking surfaces a clear error in the chat instead of hiding it.
  if (enabled !== true) return null;

  return (
    <>
      {/* One-time hint label so users know what the bubble is for */}
      {!open && showHint && (
        <div className="fixed bottom-6 right-24 z-50 max-w-[220px] bg-white border border-meesho-purple/20 rounded-2xl rounded-br-sm shadow-card px-3.5 py-2.5 animate-fade-in">
          <button
            onClick={(e) => { e.stopPropagation(); setShowHint(false); }}
            aria-label="Dismiss"
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center hover:bg-gray-300"
          >✕</button>
          <button onClick={() => { setOpen(true); setShowHint(false); }} className="text-left">
            <div className="text-xs font-bold text-meesho-purple mb-0.5">💬 Ask Meera — AI assistant</div>
            <div className="text-[11px] text-gray-500 leading-snug">
              Ask questions about these reviews in plain language — "what should I fix?", "are customers happy?" — answered from the actual review text.
            </div>
          </button>
        </div>
      )}

      {/* Floating launcher button */}
      <button
        onClick={() => { setOpen(o => !o); setShowHint(false); }}
        aria-label="Ask Meera"
        title="Ask Meera — AI Q&A about your reviews"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-meesho-pink text-white shadow-pink flex items-center justify-center text-2xl hover:bg-meesho-pink-dark active:scale-95 transition-all"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white rounded-2xl shadow-2xl border border-meesho-pink-light flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-meesho-purple text-white px-4 py-3 flex items-center gap-2 flex-shrink-0">
            <span className="text-lg">💬</span>
            <div className="flex-1">
              <div className="font-bold text-sm leading-tight">Ask Meera</div>
              <div className="text-[11px] opacity-70 leading-tight">Answers from your reviews only</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="opacity-80 hover:opacity-100 text-lg leading-none">✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-meesho-pink-bg/40">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-xs mt-3 mb-2 px-2">
                <div className="text-3xl mb-2">🧵</div>
                <p className="font-semibold text-meesho-purple mb-1">Hi, I'm Meera's AI assistant</p>
                <p className="leading-relaxed text-gray-400">
                  I read all your customer reviews so you don't have to.
                  Ask me anything in plain language — what to fix, what customers love, delivery issues —
                  and I'll answer using only what they actually wrote, with quotes. I never make things up.
                </p>
                <p className="text-gray-300 mt-2">Tap a question below to start 👇</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
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
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 shadow-sm">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-meesho-purple/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-meesho-purple/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-meesho-purple/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Suggested questions (before first message) */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-1.5 px-3 pb-2 flex-shrink-0">
              {SUGGESTED.map(s => (
                <button key={s} onClick={() => ask(s)} disabled={loading}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-meesho-purple/30 text-meesho-purple hover:bg-meesho-purple/5 transition-all disabled:opacity-40 font-medium">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-gray-100 flex-shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') ask(); }}
              placeholder="Ask about these reviews…"
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-200 focus:border-meesho-purple focus:ring-2 focus:ring-meesho-purple/20 px-3.5 py-2 text-sm text-gray-700 transition-all disabled:opacity-50 placeholder-gray-400"
            />
            <button onClick={() => ask()} disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-xl bg-meesho-purple text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? '…' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
