import { useState } from 'react';

const HEALTH_CONFIG = {
  A: { color: '#16a34a', label: 'Excellent' },
  B: { color: '#2563eb', label: 'Good'      },
  C: { color: '#d97706', label: 'Average'   },
  D: { color: '#dc2626', label: 'Poor'      },
  F: { color: '#7f1d1d', label: 'Critical'  },
};

function ScoreGauge({ score, grade, label }) {
  const cfg = HEALTH_CONFIG[grade] || HEALTH_CONFIG.C;
  const circ = 2 * Math.PI * 36;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle cx="40" cy="40" r="36" fill="none" stroke={cfg.color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color: cfg.color }}>{score}</span>
          <span className="text-xs font-bold" style={{ color: cfg.color }}>{grade}</span>
        </div>
      </div>
      <div className="text-xs font-medium text-gray-500">{cfg.label}</div>
    </div>
  );
}

function DeltaBadge({ value }) {
  if (value === 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">— No change</span>;
  const good = value > 0;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${good ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {value > 0 ? `▲ +${value}` : `▼ ${value}`} pts
    </span>
  );
}

function SentRow({ label, before, after }) {
  const delta = after - before;
  const good = label === 'Positive' ? delta >= 0 : delta <= 0;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="w-20 text-xs font-semibold text-gray-500">{label}</span>
      <div className="flex-1 flex items-center gap-2">
        <div className="w-16 text-right text-sm font-bold text-gray-400">{before}%</div>
        <div className="flex-1 relative h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute h-full bg-gray-300 rounded-full" style={{ width: `${before}%` }} />
          <div className={`absolute h-full rounded-full transition-all duration-700 ${label === 'Positive' ? 'bg-green-400' : label === 'Negative' ? 'bg-red-400' : 'bg-slate-400'}`}
            style={{ width: `${after}%` }} />
        </div>
        <div className="w-16 text-sm font-bold" style={{ color: good ? '#16a34a' : delta === 0 ? '#6b7280' : '#dc2626' }}>{after}%</div>
      </div>
      <span className={`text-xs font-bold w-14 text-right ${delta === 0 ? 'text-gray-400' : good ? 'text-green-600' : 'text-red-500'}`}>
        {delta === 0 ? '—' : delta > 0 ? `+${delta}%` : `${delta}%`}
      </span>
    </div>
  );
}

function ThemeDiff({ before, after }) {
  const beforeMap = Object.fromEntries(before.themes.map(t => [t.name, t]));
  const afterMap  = Object.fromEntries(after.themes.map(t => [t.name, t]));
  const allNames  = [...new Set([...Object.keys(beforeMap), ...Object.keys(afterMap)])];

  const improved = allNames.filter(n => {
    const b = beforeMap[n], a = afterMap[n];
    if (!b) return false;
    if (b.sentiment !== 'negative') return false;
    return !a || a.sentiment !== 'negative' || a.count < b.count;
  });

  const worsened = allNames.filter(n => {
    const b = beforeMap[n], a = afterMap[n];
    if (!a || a.sentiment !== 'negative') return false;
    return !b || b.count < a.count;
  });

  const newlyPositive = allNames.filter(n => {
    const b = beforeMap[n], a = afterMap[n];
    return !b && a && a.sentiment === 'positive';
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">✅</span>
          <h4 className="font-bold text-green-700 text-sm">Complaints Reduced ({improved.length})</h4>
        </div>
        {improved.length === 0
          ? <p className="text-xs text-gray-400 italic">No improvements detected</p>
          : <ul className="space-y-1.5">
              {improved.map(n => {
                const b = beforeMap[n], a = afterMap[n];
                return (
                  <li key={n} className="text-xs text-green-800 flex items-start gap-1.5">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">↓</span>
                    <span><b>{n}</b> {b?.count} → {a?.count ?? 0} mentions</span>
                  </li>
                );
              })}
            </ul>
        }
      </div>
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">⚠️</span>
          <h4 className="font-bold text-red-700 text-sm">New / Worsened Issues ({worsened.length})</h4>
        </div>
        {worsened.length === 0
          ? <p className="text-xs text-gray-400 italic">No new issues — great!</p>
          : <ul className="space-y-1.5">
              {worsened.map(n => {
                const b = beforeMap[n], a = afterMap[n];
                return (
                  <li key={n} className="text-xs text-red-800 flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">↑</span>
                    <span><b>{n}</b> {b?.count ?? 0} → {a?.count} mentions</span>
                  </li>
                );
              })}
            </ul>
        }
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">⭐</span>
          <h4 className="font-bold text-blue-700 text-sm">New Praise ({newlyPositive.length})</h4>
        </div>
        {newlyPositive.length === 0
          ? <p className="text-xs text-gray-400 italic">No new praise themes</p>
          : <ul className="space-y-1.5">
              {newlyPositive.map(n => (
                <li key={n} className="text-xs text-blue-800 flex items-start gap-1.5">
                  <span className="text-blue-400 mt-0.5 flex-shrink-0">★</span>
                  <span><b>{n}</b></span>
                </li>
              ))}
            </ul>
        }
      </div>
    </div>
  );
}

export default function CompareView({ result, onBack, t, onShowToast }) {
  if (!result) return null;
  const { before, after } = result;

  const scoreDelta = (after.healthScore ?? 0) - (before.healthScore ?? 0);

  const handleExportCompare = () => {
    const scoreDeltaStr = scoreDelta === 0 ? 'No change' : scoreDelta > 0 ? `+${scoreDelta} pts improved` : `${scoreDelta} pts declined`;
    const verdict = scoreDelta > 5 ? '✅ Significant Improvement' : scoreDelta > 0 ? '📈 Slight Improvement' : scoreDelta < -5 ? '🚨 Significant Decline' : scoreDelta < 0 ? '📉 Slight Decline' : '➡️ No Change';

    const text = `MEERA INSIGHTS — BEFORE/AFTER COMPARISON
${'='.repeat(50)}
Date: ${new Date().toLocaleDateString('en-IN')}

HEALTH SCORE
Before: ${before.healthScore}/100 (Grade ${before.healthGrade})
After:  ${after.healthScore}/100 (Grade ${after.healthGrade})
Change: ${scoreDeltaStr}
Verdict: ${verdict}

SENTIMENT CHANGE
           Before  After   Δ
Positive:  ${String(before.overallSentiment.positive+'%').padEnd(7)} ${String(after.overallSentiment.positive+'%').padEnd(7)} ${after.overallSentiment.positive - before.overallSentiment.positive > 0 ? '+' : ''}${after.overallSentiment.positive - before.overallSentiment.positive}%
Negative:  ${String(before.overallSentiment.negative+'%').padEnd(7)} ${String(after.overallSentiment.negative+'%').padEnd(7)} ${after.overallSentiment.negative - before.overallSentiment.negative > 0 ? '+' : ''}${after.overallSentiment.negative - before.overallSentiment.negative}%

Generated by Meera Insights · Meesho Buildathon 2026`;
    navigator.clipboard.writeText(text).then(() => onShowToast('Comparison copied to clipboard!', 'success'));
  };

  const verdict = scoreDelta > 5  ? { text: 'Significant Improvement', icon: '🚀', cls: 'bg-green-50 border-green-200 text-green-700' }
    : scoreDelta > 0               ? { text: 'Slight Improvement',      icon: '📈', cls: 'bg-green-50 border-green-100 text-green-600' }
    : scoreDelta < -5              ? { text: 'Significant Decline',      icon: '🚨', cls: 'bg-red-50 border-red-200 text-red-700' }
    : scoreDelta < 0               ? { text: 'Slight Decline',           icon: '📉', cls: 'bg-red-50 border-red-100 text-red-600' }
    :                                { text: 'No Change Detected',       icon: '➡️', cls: 'bg-gray-50 border-gray-200 text-gray-600' };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">

      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-meesho-pink font-semibold hover:text-meesho-pink-dark text-sm">
          ← {t.backToInput}
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCompare}
            className="text-xs bg-meesho-purple text-white px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 flex items-center gap-1">
            📋 Copy Report
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-meesho-purple">Before vs After Comparison</h2>
        <p className="text-sm text-gray-400 mt-1">
          {before.totalReviews} older reviews → {after.totalReviews} recent reviews
        </p>
      </div>

      {/* Verdict banner */}
      <div className={`border rounded-2xl p-4 flex items-center gap-3 ${verdict.cls}`}>
        <span className="text-3xl flex-shrink-0">{verdict.icon}</span>
        <div>
          <div className="font-bold text-lg">{verdict.text}</div>
          <div className="text-sm opacity-80">
            Health Score: {before.healthScore}/100 → {after.healthScore}/100
            {' '}({scoreDelta === 0 ? 'unchanged' : scoreDelta > 0 ? `+${scoreDelta} points` : `${scoreDelta} points`})
          </div>
        </div>
      </div>

      {/* Health score side by side */}
      <section>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Health Score</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-around gap-6">
          <ScoreGauge score={before.healthScore ?? 0} grade={before.healthGrade ?? 'C'} label="Before" />
          <div className="flex flex-col items-center gap-1">
            <div className="text-4xl">→</div>
            <DeltaBadge value={scoreDelta} />
          </div>
          <ScoreGauge score={after.healthScore ?? 0} grade={after.healthGrade ?? 'C'} label="After" />
        </div>
      </section>

      {/* Sentiment comparison */}
      <section>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Sentiment Shift</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex gap-8 text-xs text-gray-400 mb-3 pl-20">
            <span className="w-16 text-right">Before</span>
            <span className="flex-1 text-center">Progress</span>
            <span className="w-16">After</span>
            <span className="w-14 text-right">Change</span>
          </div>
          <SentRow label="Positive" before={before.overallSentiment.positive} after={after.overallSentiment.positive} />
          <SentRow label="Neutral"  before={before.overallSentiment.neutral}  after={after.overallSentiment.neutral}  />
          <SentRow label="Negative" before={before.overallSentiment.negative} after={after.overallSentiment.negative} />
        </div>
      </section>

      {/* Theme diff */}
      <section>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Theme Changes</h2>
        <ThemeDiff before={before} after={after} />
      </section>

      {/* Quick verdict cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-600 text-sm mb-3">📋 Before Snapshot</h3>
          <ul className="space-y-1.5 text-sm text-gray-500">
            <li><b>{before.totalReviews}</b> reviews · <b>{before.productCategory || 'General'}</b></li>
            <li>🟢 {before.overallSentiment.positive}% positive &nbsp; 🔴 {before.overallSentiment.negative}% negative</li>
            <li>Top issue: {before.topComplaints?.[0]?.split('—')[0]?.trim() || 'None'}</li>
          </ul>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-meesho-purple text-sm mb-3">📋 After Snapshot</h3>
          <ul className="space-y-1.5 text-sm text-gray-500">
            <li><b>{after.totalReviews}</b> reviews · <b>{after.productCategory || 'General'}</b></li>
            <li>🟢 {after.overallSentiment.positive}% positive &nbsp; 🔴 {after.overallSentiment.negative}% negative</li>
            <li>Top issue: {after.topComplaints?.[0]?.split('—')[0]?.trim() || 'None'}</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
