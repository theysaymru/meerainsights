import { useState } from 'react';
import { SAMPLE_REVIEWS, SAMPLE_ELECTRONICS, SAMPLE_KITCHEN } from '../sampleData';

const STEPS = [
  { icon: '📋', text: 'Paste reviews — one per line, from any source' },
  { icon: '✨', text: 'Click Analyse — detects category automatically' },
  { icon: '📊', text: 'Get insights — themes, sentiment & reply drafts' },
];

function countLines(text) {
  return text.trim() ? text.split('\n').filter(l => l.trim().length > 3).length : 0;
}

export default function InputScreen({
  reviewText, onChange, onAnalyze, loading, t, onShowToast,
  compareReviews, onCompareChange, onCompare,
}) {
  const [activeSample, setActiveSample] = useState(null);
  const [mode, setMode] = useState('single');

  const lineCount = countLines(reviewText);
  const charCount = reviewText.length;
  const isHuge = charCount > 80000;
  const beforeCount = countLines(compareReviews?.before || '');
  const afterCount  = countLines(compareReviews?.after  || '');

  const handleLoadSample = (type) => {
    const map = { clothing: SAMPLE_REVIEWS, electronics: SAMPLE_ELECTRONICS, kitchen: SAMPLE_KITCHEN };
    if (mode === 'single') {
      onChange(map[type]);
      setActiveSample(type);
      onShowToast(`${type.charAt(0).toUpperCase() + type.slice(1)} sample loaded! Click Analyse.`, 'success');
    } else {
      onCompareChange({ before: map['clothing'], after: map['electronics'] });
      onShowToast('Sample data loaded — Clothing (before) vs Electronics (after).', 'success');
    }
  };

  const handleAnalyzeClick = () => {
    if (!reviewText.trim()) { onShowToast(t.emptyWarning, 'warning'); return; }
    onAnalyze();
  };

  const handleCompareClick = () => {
    if (!compareReviews?.before?.trim() || !compareReviews?.after?.trim()) {
      onShowToast('Paste reviews in both fields before comparing.', 'warning');
      return;
    }
    onCompare();
  };

  return (
    <div className="flex flex-col items-center pt-8 pb-16 gap-8 animate-fade-in">

      {/* Hero */}
      <div className="text-center max-w-2xl px-2">
        <div className="inline-flex items-center gap-2 bg-meesho-pink-light text-meesho-pink text-xs font-semibold px-3 py-1 rounded-full mb-4">
          ✨ AI-free · Deterministic Analysis · Fully Local
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-meesho-purple mb-4 leading-tight">
          {t.headline}
        </h2>
        <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-3">
          {t.subheadline}
        </p>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto">
          Meesho sellers and category managers receive thousands of reviews daily. Meera reads them all in seconds — spotting what's broken, what's loved, and drafting replies by theme.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-white border border-meesho-pink-light rounded-xl p-1 shadow-sm">
        <button
          onClick={() => setMode('single')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === 'single'
              ? 'bg-meesho-pink text-white shadow-sm'
              : 'text-gray-500 hover:text-meesho-pink'
          }`}
        >
          📊 Single Analysis
        </button>
        <button
          onClick={() => setMode('compare')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === 'compare'
              ? 'bg-meesho-purple text-white shadow-sm'
              : 'text-gray-500 hover:text-meesho-purple'
          }`}
        >
          📈 Before vs After
        </button>
      </div>

      {/* ── SINGLE MODE ── */}
      {mode === 'single' && (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-card border border-meesho-pink-light p-6">
          {isHuge && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex gap-2">
              <span className="flex-shrink-0">⚠️</span>
              <span>{t.largeInputWarning} ({Math.round(charCount / 1000)}K chars)</span>
            </div>
          )}

          <textarea
            value={reviewText}
            onChange={e => { onChange(e.target.value); setActiveSample(null); }}
            placeholder="Paste customer reviews here, one per line — copy from Meesho seller panel, Google Sheet, or any source..."
            disabled={loading}
            rows={12}
            className="w-full resize-none rounded-xl border border-gray-200 focus:border-meesho-pink focus:ring-2 focus:ring-meesho-pink/20 p-4 text-sm text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-400 leading-relaxed"
          />

          <div className="flex items-center justify-between mt-2 mb-4 text-xs px-1">
            <span className={lineCount > 0 ? 'text-meesho-purple font-semibold' : 'text-gray-400'}>
              {lineCount > 0 ? `✓ ${lineCount} review${lineCount !== 1 ? 's' : ''} detected` : 'No reviews yet — paste below or try a sample'}
            </span>
            <span className="text-gray-400">{charCount > 0 ? `${charCount.toLocaleString()} chars` : ''}</span>
          </div>

          <div className="mb-4">
            <p className="text-xs text-gray-400 font-medium mb-2">Try a sample category:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'clothing',    label: '🥻 Clothing',    desc: 'Sarees, kurtas, dresses' },
                { key: 'electronics', label: '📱 Electronics', desc: 'Phones, earphones' },
                { key: 'kitchen',     label: '🍳 Kitchen',     desc: 'Cookware, containers' },
              ].map(s => (
                <button key={s.key} onClick={() => handleLoadSample(s.key)} disabled={loading} title={s.desc}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all disabled:opacity-40 ${
                    activeSample === s.key
                      ? 'bg-meesho-pink text-white border-meesho-pink'
                      : 'border-meesho-pink text-meesho-pink hover:bg-meesho-pink-light'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleAnalyzeClick} disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-meesho-pink text-white font-bold text-sm hover:bg-meesho-pink-dark active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-pink">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t.analyzing}
              </span>
            ) : `✨ ${t.analyze}`}
          </button>
        </div>
      )}

      {/* ── COMPARE MODE ── */}
      {mode === 'compare' && (
        <div className="w-full max-w-4xl space-y-4">
          <div className="bg-meesho-purple/5 border border-meesho-purple/20 rounded-2xl p-4 text-center">
            <p className="text-sm text-meesho-purple font-semibold">
              📈 Compare two sets of reviews to see if your product improved
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Paste older reviews in "Before" and recent reviews in "After" — Meera will show what changed
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-gray-400 text-white text-xs font-bold flex items-center justify-center">B</span>
                <h3 className="font-bold text-gray-600 text-sm">Before <span className="text-gray-400 font-normal">(older reviews)</span></h3>
              </div>
              <textarea
                value={compareReviews?.before || ''}
                onChange={e => onCompareChange({ ...compareReviews, before: e.target.value })}
                placeholder="Paste reviews from last month / older batch..."
                disabled={loading}
                rows={10}
                className="w-full resize-none rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 p-3 text-sm text-gray-700 transition-all disabled:opacity-50 placeholder-gray-300 leading-relaxed"
              />
              <div className="mt-1.5 text-xs">
                {beforeCount > 0 ? <span className="text-gray-500 font-semibold">✓ {beforeCount} reviews</span> : <span className="text-gray-300">No reviews yet</span>}
              </div>
            </div>

            {/* After */}
            <div className="bg-white rounded-2xl shadow-card border border-meesho-purple/30 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-meesho-purple text-white text-xs font-bold flex items-center justify-center">A</span>
                <h3 className="font-bold text-meesho-purple text-sm">After <span className="text-meesho-purple/60 font-normal">(recent reviews)</span></h3>
              </div>
              <textarea
                value={compareReviews?.after || ''}
                onChange={e => onCompareChange({ ...compareReviews, after: e.target.value })}
                placeholder="Paste reviews from this month / recent batch..."
                disabled={loading}
                rows={10}
                className="w-full resize-none rounded-xl border border-meesho-purple/30 focus:border-meesho-purple focus:ring-2 focus:ring-meesho-purple/20 p-3 text-sm text-gray-700 transition-all disabled:opacity-50 placeholder-gray-300 leading-relaxed"
              />
              <div className="mt-1.5 text-xs">
                {afterCount > 0 ? <span className="text-meesho-purple font-semibold">✓ {afterCount} reviews</span> : <span className="text-gray-300">No reviews yet</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => handleLoadSample('clothing')} disabled={loading}
              className="flex-1 text-sm border border-meesho-purple text-meesho-purple px-4 py-2.5 rounded-xl font-semibold hover:bg-meesho-purple/5 transition-all disabled:opacity-40">
              📂 Load sample (Clothing vs Electronics)
            </button>
            <button onClick={handleCompareClick} disabled={loading}
              className="flex-1 px-6 py-2.5 rounded-xl bg-meesho-purple text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Comparing...
                </span>
              ) : '📈 Compare Now'}
            </button>
          </div>
        </div>
      )}

      {/* Empty state guide — single mode only */}
      {mode === 'single' && !reviewText && (
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STEPS.map((step, i) => (
              <div key={i} className="bg-white border border-meesho-purple-light rounded-2xl p-4 text-center shadow-sm">
                <div className="text-2xl mb-2">{step.icon}</div>
                <span className="text-xs font-bold text-meesho-purple-mid block mb-1">Step {i + 1}</span>
                <p className="text-xs text-gray-500 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {['Sentiment analysis', 'Category detection', 'Theme detection', 'Auto-reply drafts', 'Before/After compare', 'WhatsApp brief'].map(f => (
          <span key={f} className="text-xs bg-white text-meesho-purple-mid border border-meesho-purple-light px-3 py-1 rounded-full shadow-sm font-medium">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}
