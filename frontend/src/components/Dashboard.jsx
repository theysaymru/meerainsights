import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import SentimentChart from './SentimentChart';
import ThemesChart from './ThemesChart';
import AutoReplies from './AutoReplies';

// ─── Constants ───────────────────────────────────────────────────────────────

const SENTIMENT_THEME = {
  positive: { bg: 'bg-green-50', border: 'border-green-100', bar: 'bg-green-400', text: 'text-green-600', track: 'bg-green-100' },
  neutral:  { bg: 'bg-slate-50', border: 'border-slate-100', bar: 'bg-slate-400', text: 'text-slate-500', track: 'bg-slate-100' },
  negative: { bg: 'bg-red-50',   border: 'border-red-100',   bar: 'bg-red-400',   text: 'text-red-500',  track: 'bg-red-100'  },
};

const THEME_CARD_SENTIMENT = {
  positive: { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700',  dot: 'bg-green-400'  },
  negative: { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-600',      dot: 'bg-red-400'    },
  mixed:    { bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400'  },
  neutral:  { bg: 'bg-slate-50',  border: 'border-slate-200',  badge: 'bg-slate-100 text-slate-600',  dot: 'bg-slate-400'  },
};

const CATEGORY_META = {
  clothing:    { label: 'Clothing & Apparel', icon: '🥻' },
  electronics: { label: 'Electronics',        icon: '📱' },
  furniture:   { label: 'Furniture',          icon: '🪑' },
  kitchen:     { label: 'Kitchen & Cookware', icon: '🍳' },
  beauty:      { label: 'Beauty & Personal',  icon: '💄' },
};

const HEALTH_CONFIG = {
  A: { label: 'Excellent', color: '#16a34a', bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-700' },
  B: { label: 'Good',      color: '#2563eb', bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-700'  },
  C: { label: 'Average',   color: '#d97706', bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-700' },
  D: { label: 'Poor',      color: '#dc2626', bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-700'   },
  F: { label: 'Critical',  color: '#7f1d1d', bg: 'bg-red-100',   border: 'border-red-300',   text: 'text-red-900'   },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function HealthScore({ score, grade }) {
  const cfg = HEALTH_CONFIG[grade] || HEALTH_CONFIG.C;
  const circumference = 2 * Math.PI * 44;
  const dash = (score / 100) * circumference;
  return (
    <div className={`${cfg.bg} ${cfg.border} border rounded-2xl p-5 flex flex-col items-center text-center`}>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Seller Health Score</div>
      <div className="relative w-28 h-28 mb-3">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle cx="50" cy="50" r="44" fill="none" stroke={cfg.color} strokeWidth="10"
            strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: cfg.color }}>{score}</span>
          <span className="text-xs text-gray-400 font-medium">/100</span>
        </div>
      </div>
      <span className={`text-lg font-bold ${cfg.text}`}>Grade {grade}</span>
      <span className={`text-sm font-medium ${cfg.text} mt-0.5`}>{cfg.label}</span>
    </div>
  );
}

function SentimentCard({ value, type, totalReviews, benchmark }) {
  const s = SENTIMENT_THEME[type];
  const diff = benchmark != null ? value - benchmark : null;
  const hints = {
    positive: value >= 70 ? 'Healthy — keep it up!' : value >= 50 ? 'Room to improve' : 'Needs urgent attention',
    neutral:  'Factual or indifferent reviews',
    negative: value <= 20 ? 'Well controlled' : value <= 40 ? 'Worth investigating' : 'Critical — act now',
  };
  const count = Math.round((value / 100) * totalReviews);
  return (
    <div className={`${s.bg} ${s.border} border rounded-2xl p-5 flex flex-col items-center text-center`}>
      <div className={`text-3xl font-bold ${s.text}`}>{value}%</div>
      <div className="text-sm text-gray-500 mt-1 font-medium capitalize">{type}</div>
      <div className="text-xs text-gray-400 mt-0.5">{count} of {totalReviews} reviews</div>
      <div className={`w-full h-2 ${s.track} rounded-full mt-3`}>
        <div className={`h-2 ${s.bar} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <div className={`text-xs mt-2 font-medium ${s.text}`}>{hints[type]}</div>
      {diff != null && (
        <div className={`text-xs mt-1 font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {diff >= 0 ? `▲ ${diff}%` : `▼ ${Math.abs(diff)}%`} vs category avg
        </div>
      )}
    </div>
  );
}

function ThemeCard({ theme, rank }) {
  const s = THEME_CARD_SENTIMENT[theme.sentiment] || THEME_CARD_SENTIMENT.neutral;
  const isHighPriority = theme.sentiment === 'negative' && theme.count >= 5;
  const isMedPriority  = theme.sentiment === 'negative' && theme.count < 5;
  return (
    <div className={`${s.bg} ${s.border} border rounded-2xl p-4 hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold w-5">#{rank}</span>
          <span className="font-semibold text-gray-800 text-sm">{theme.name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${s.badge}`}>{theme.sentiment}</span>
      </div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
        <span className="text-xs text-gray-500 font-medium">{theme.count} mentions</span>
        {isHighPriority && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-semibold">🔴 High</span>}
        {isMedPriority  && <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">🟡 Medium</span>}
        {theme.sentiment === 'positive' && <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-semibold">🟢 Praise</span>}
      </div>
      {theme.sampleQuote && (
        <p className="text-xs text-gray-500 italic line-clamp-2 leading-relaxed">"{theme.sampleQuote}"</p>
      )}
    </div>
  );
}

function TrendView({ apiBase }) {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    fetch(`${apiBase}/api/analyses/history`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setHistory(data))
      .catch(() => {});
  }, []);

  if (history.length < 2) return null;

  const data = history.map((h, i) => ({
    name: `#${h.id}`,
    Positive: h.positive,
    Negative: h.negative,
    Score: h.healthScore,
  }));

  return (
    <section>
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Trend — Last {history.length} Analyses</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Line type="monotone" dataKey="Positive" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Negative" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Score"    stroke="#7c3aed" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-gray-500 justify-center flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-600 inline-block" /> Positive %</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-600 inline-block" /> Negative %</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-purple-700 inline-block" /> Health Score</span>
        </div>
      </div>
    </section>
  );
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

function exportPDF(analysis) {
  const { totalReviews, productCategory, overallSentiment, themes, topComplaints, topPraises, actions, autoReplies, healthScore, healthGrade, benchmark } = analysis;
  const cat = CATEGORY_META[productCategory]?.label || 'General';
  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const hCfg = HEALTH_CONFIG[healthGrade] || HEALTH_CONFIG.C;

  const sentBar = (pct, color) =>
    `<div style="display:inline-block;width:${pct}%;height:8px;background:${color};border-radius:4px;vertical-align:middle;max-width:100%;"></div>`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>Meera Insights Report</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;color:#1a1a2e;background:#fff;padding:36px;font-size:13px;line-height:1.5}
.header{background:#5a0b6c;color:white;border-radius:12px;padding:24px 28px;margin-bottom:24px}
.header h1{font-size:20px;font-weight:700;margin-bottom:4px}
.header p{opacity:.75;font-size:11px}
.meta{display:flex;gap:12px;margin-top:10px;flex-wrap:wrap}
.meta span{background:rgba(255,255,255,.15);padding:3px 10px;border-radius:20px;font-size:11px}
.section{margin-bottom:22px}
.section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:10px;border-bottom:1px solid #eee;padding-bottom:5px}
.cards3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.cards4{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.card{border-radius:10px;padding:12px 14px;text-align:center}
.pct{font-size:24px;font-weight:700}.lbl{font-size:11px;color:#666;margin-top:2px}.hint{font-size:10px;margin-top:5px;font-weight:600}
.bench{font-size:10px;margin-top:3px}
.pos{background:#f0fdf4}.pos .pct,.pos .hint{color:#16a34a}
.neu{background:#f8fafc}.neu .pct,.neu .hint{color:#64748b}
.neg{background:#fef2f2}.neg .pct,.neg .hint{color:#dc2626}
.health-card{border-radius:10px;padding:14px;text-align:center}
.health-score{font-size:36px;font-weight:700}
.health-grade{font-size:18px;font-weight:700;margin-top:4px}
.theme-chip{border-radius:8px;padding:10px 12px;border:1px solid #eee;margin-bottom:8px}
.theme-name{font-weight:700;font-size:12px}.theme-meta{font-size:11px;color:#888;margin-top:2px}
.theme-quote{font-size:11px;color:#555;font-style:italic;margin-top:5px;border-left:2px solid #e91e8c;padding-left:6px}
.badge{display:inline-block;font-size:10px;padding:2px 7px;border-radius:10px;font-weight:600;margin-left:4px}
.bp{background:#dcfce7;color:#166534}.bn{background:#fee2e2;color:#991b1b}.bm{background:#fef3c7;color:#92400e}
.fix-list{list-style:none}
.fix-list li{display:flex;gap:10px;margin-bottom:10px;align-items:flex-start}
.fix-num{background:#e91e8c;color:white;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}
.fix-text{font-size:12px;color:#333;padding-top:2px}
.fix-tag{font-size:10px;padding:1px 6px;border-radius:8px;font-weight:600;margin-left:6px}
.fix-now{background:#dcfce7;color:#166534}.big-fix{background:#fee2e2;color:#991b1b}
.list-item{display:flex;gap:6px;margin-bottom:7px;font-size:12px;color:#444}
.reply-block{border:1px solid #eee;border-radius:8px;padding:12px;margin-bottom:10px}
.reply-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.reply-theme{font-weight:700;color:#5a0b6c;font-size:12px}
.reply-count{font-size:10px;background:#fce4ec;color:#e91e8c;padding:2px 8px;border-radius:10px}
.reply-text{font-size:12px;color:#444;margin-top:6px}
.alert-box{background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:12px 16px;margin-bottom:20px;display:flex;gap:10px;align-items:flex-start}
.alert-text{font-size:12px;color:#991b1b;font-weight:600}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.footer{margin-top:28px;text-align:center;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:14px}
@media print{body{padding:20px}}
</style></head><body>
<div class="header">
  <h1>Meera Insights — Analysis Report</h1>
  <p>Evidence-based customer review analysis · by Meesho</p>
  <div class="meta">
    <span>📅 ${date}</span><span>${cat}</span><span>${totalReviews} reviews</span>
    ${healthScore != null ? `<span>Health Score: ${healthScore}/100 (Grade ${healthGrade})</span>` : ''}
  </div>
</div>

${analysis.overallSentiment.negative > 40 ? `<div class="alert-box">
  <span style="font-size:18px">⚠️</span>
  <div class="alert-text">Critical: ${analysis.overallSentiment.negative}% of reviews are negative. Immediate action required on ${topComplaints[0] ? topComplaints[0].split('—')[0].trim() : 'top issues'}.</div>
</div>` : ''}

${healthScore != null ? `<div class="section">
  <div class="section-title">Seller Health Score</div>
  <div class="cards3">
    <div class="health-card" style="background:${hCfg.bg.replace('bg-','').includes('green') ? '#f0fdf4' : hCfg.bg.replace('bg-','').includes('blue') ? '#eff6ff' : hCfg.bg.replace('bg-','').includes('amber') ? '#fffbeb' : '#fef2f2'};border:1px solid #eee;grid-column:span 1">
      <div class="health-score" style="color:${hCfg.color}">${healthScore}</div>
      <div style="font-size:11px;color:#888">/100</div>
      <div class="health-grade" style="color:${hCfg.color}">Grade ${healthGrade} — ${hCfg.label}</div>
    </div>
    <div style="grid-column:span 2;padding:12px;background:#f9fafb;border-radius:10px;border:1px solid #eee;font-size:12px;color:#555;display:flex;align-items:center;">
      The Seller Health Score is calculated from sentiment ratio, complaint severity, and theme frequency. A score above 80 indicates a healthy product with satisfied customers.
    </div>
  </div>
</div>` : ''}

<div class="section">
  <div class="section-title">Sentiment Summary</div>
  <div class="cards3">
    <div class="card pos">
      <div class="pct">${overallSentiment.positive}%</div><div class="lbl">Positive</div>
      <div style="margin:5px 0">${sentBar(overallSentiment.positive, '#4ade80')}</div>
      <div class="hint">${overallSentiment.positive >= 70 ? 'Healthy' : overallSentiment.positive >= 50 ? 'Room to improve' : 'Needs attention'}</div>
      ${benchmark ? `<div class="bench" style="color:${overallSentiment.positive >= benchmark.positive ? '#16a34a' : '#dc2626'}">${overallSentiment.positive >= benchmark.positive ? '▲' : '▼'} ${Math.abs(overallSentiment.positive - benchmark.positive)}% vs avg</div>` : ''}
    </div>
    <div class="card neu">
      <div class="pct">${overallSentiment.neutral}%</div><div class="lbl">Neutral</div>
      <div style="margin:5px 0">${sentBar(overallSentiment.neutral, '#94a3b8')}</div>
      <div class="hint">Factual / indifferent</div>
    </div>
    <div class="card neg">
      <div class="pct">${overallSentiment.negative}%</div><div class="lbl">Negative</div>
      <div style="margin:5px 0">${sentBar(overallSentiment.negative, '#f87171')}</div>
      <div class="hint">${overallSentiment.negative <= 20 ? 'Well controlled' : overallSentiment.negative <= 40 ? 'Worth investigating' : 'Critical — act now'}</div>
      ${benchmark ? `<div class="bench" style="color:${overallSentiment.negative <= benchmark.negative ? '#16a34a' : '#dc2626'}">${overallSentiment.negative <= benchmark.negative ? '▼' : '▲'} ${Math.abs(overallSentiment.negative - benchmark.negative)}% vs avg</div>` : ''}
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Themes Detected (${themes.length})</div>
  <div class="cards4">
    ${themes.map((th, i) => `<div class="theme-chip">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="theme-name">#${i+1} ${th.name}</span>
        <span class="badge ${th.sentiment==='positive'?'bp':th.sentiment==='negative'?'bn':'bm'}">${th.sentiment}</span>
      </div>
      <div class="theme-meta">${th.count} mentions</div>
      ${th.sampleQuote ? `<div class="theme-quote">${th.sampleQuote}</div>` : ''}
    </div>`).join('')}
  </div>
</div>

${actions.length > 0 ? `<div class="section">
  <div class="section-title">Recommended Fixes</div>
  <ul class="fix-list">
    ${actions.map((a, i) => `<li>
      <div class="fix-num">${i+1}</div>
      <div class="fix-text">
        ${typeof a === 'object' ? a.text : a}
        ${typeof a === 'object' ? `<span class="fix-tag ${a.type === 'fix_now' ? 'fix-now' : 'big-fix'}">${a.type === 'fix_now' ? '🟢 Fix Now' : '🔴 Big Fix'}</span>` : ''}
      </div>
    </li>`).join('')}
  </ul>
</div>` : ''}

<div class="two-col" style="margin-bottom:22px">
  ${topComplaints.length > 0 ? `<div><div class="section-title">Top Complaints</div>${topComplaints.map(c=>`<div class="list-item"><span style="color:#f87171">●</span><span>${c}</span></div>`).join('')}</div>` : ''}
  ${topPraises.length > 0 ? `<div><div class="section-title">Top Praises</div>${topPraises.map(p=>`<div class="list-item"><span style="color:#4ade80">●</span><span>${p}</span></div>`).join('')}</div>` : ''}
</div>

<div class="section">
  <div class="section-title">Auto-Reply Drafts (${autoReplies.length})</div>
  ${autoReplies.map(r=>`<div class="reply-block">
    <div class="reply-header"><span class="reply-theme">${r.theme}</span><span class="reply-count">${r.affectedReviewsCount} customers</span></div>
    <div class="reply-text">${r.suggestedReply}</div>
  </div>`).join('')}
</div>

<div class="footer">Generated by Meera Insights · Meesho Buildathon 2026</div>
</body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
}

// ─── WhatsApp Brief Generator ────────────────────────────────────────────────

function generateWhatsAppBrief(analysis) {
  const { totalReviews, productCategory, overallSentiment, themes = [], topComplaints = [], topPraises = [], actions = [], healthScore, healthGrade } = analysis;
  const CATEGORY_META_WA = { clothing: 'Clothing & Apparel', electronics: 'Electronics', furniture: 'Furniture', kitchen: 'Kitchen & Cookware', beauty: 'Beauty & Personal' };
  const cat = CATEGORY_META_WA[productCategory] || 'General';
  const gradeEmoji = { A: '🏆', B: '✅', C: '⚡', D: '⚠️', F: '🚨' }[healthGrade] || '📊';
  const negThemes = themes.filter(t => t.sentiment === 'negative').slice(0, 3);
  const posThemes = themes.filter(t => t.sentiment === 'positive').slice(0, 3);
  const topActions = actions.slice(0, 2).map(a => typeof a === 'object' ? a.text : a);

  const lines = [
    `*📊 Meera Insights — Seller Brief*`,
    `Product: ${cat} | ${totalReviews} reviews`,
    ``,
    `*${gradeEmoji} Health Score: ${healthScore}/100 (Grade ${healthGrade})*`,
    `🟢 ${overallSentiment.positive}% positive  🔴 ${overallSentiment.negative}% negative`,
    ``,
    negThemes.length > 0 ? `*⚠️ Top Issues:*` : null,
    ...negThemes.map((t, i) => `${i+1}. 🔴 ${t.name} — ${t.count} reviews`),
    ``,
    posThemes.length > 0 ? `*✅ What's Working:*` : null,
    ...posThemes.map((t, i) => `${i+1}. ⭐ ${t.name} — ${t.count} mentions`),
    ``,
    topActions.length > 0 ? `*🎯 This Week's Actions:*` : null,
    ...topActions.map(a => `→ ${a}`),
    ``,
    `_Generated by Meera Insights · Meesho Buildathon 2026_`,
  ].filter(l => l !== null).join('\n');

  return lines;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard({ analysis, onBack, t, onShowToast, onUpdateReplyStatus, apiBase }) {
  if (!analysis) {
    return (
      <div className="text-center py-24 text-gray-400 animate-fade-in">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-lg font-medium mb-2">No analysis yet</p>
        <button onClick={onBack} className="text-meesho-pink hover:text-meesho-pink-dark font-semibold underline mt-4">
          ← {t.backToInput}
        </button>
      </div>
    );
  }

  const {
    overallSentiment, themes = [], topComplaints = [], topPraises = [],
    actions = [], autoReplies = [], totalReviews = 0, id,
    productCategory, healthScore, healthGrade, benchmark
  } = analysis;

  const catMeta = CATEGORY_META[productCategory];
  const isAlert = overallSentiment.negative > 40;

  const sentimentData = [
    { name: 'Positive', value: overallSentiment.positive },
    { name: 'Neutral',  value: overallSentiment.neutral  },
    { name: 'Negative', value: overallSentiment.negative },
  ].filter(d => d.value > 0);

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?analysis=${id}`;
    navigator.clipboard.writeText(url).then(() => {
      onShowToast('Share link copied to clipboard!', 'success');
    }).catch(() => {
      onShowToast(`Share link: ?analysis=${id}`, 'info');
    });
  };

  const handleWhatsApp = async () => {
    const brief = generateWhatsAppBrief(analysis);
    try {
      await navigator.clipboard.writeText(brief);
      onShowToast('WhatsApp brief copied — paste into WhatsApp! 📱', 'success');
    } catch {
      onShowToast('Could not copy — try again.', 'error');
    }
  };

  const handleCopyActions = async () => {
    const text = actions.map((a, i) => `${i+1}. ${typeof a === 'object' ? a.text : a}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      onShowToast('Fixes copied!', 'success');
    } catch {
      onShowToast(t.copyFailed, 'error');
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">

      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-meesho-pink font-semibold hover:text-meesho-pink-dark text-sm">
          ← {t.backToInput}
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          {catMeta && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-meesho-purple text-white px-3 py-1.5 rounded-full font-semibold">
              {catMeta.icon} Detected: {catMeta.label}
            </span>
          )}
          <span className="text-xs text-gray-400 font-medium">#{id} · {totalReviews} reviews</span>
          <button onClick={handleShare}
            className="text-xs border border-meesho-pink text-meesho-pink px-3 py-1.5 rounded-lg font-semibold hover:bg-meesho-pink-light transition-colors flex items-center gap-1">
            🔗 Share
          </button>
          <button onClick={handleWhatsApp}
            className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-600 flex items-center gap-1">
            📱 WhatsApp Brief
          </button>
          <button onClick={() => exportPDF(analysis)}
            className="text-xs bg-meesho-purple text-white px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 flex items-center gap-1">
            ⬇️ PDF Report
          </button>
        </div>
      </div>

      {/* Smart Alert Banner */}
      {isAlert && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <p className="font-bold text-red-700 text-sm">Critical: {overallSentiment.negative}% of reviews are negative</p>
            <p className="text-red-600 text-xs mt-0.5">
              Immediate action required.
              {topComplaints[0] && ` Top issue: ${topComplaints[0].split('—')[0].trim()}.`}
              {' '}Address the fixes below before more reviews come in.
            </p>
          </div>
        </div>
      )}

      {/* Health Score + Sentiment Cards */}
      <section>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {healthScore != null && (
            <div className="col-span-2 sm:col-span-1">
              <HealthScore score={healthScore} grade={healthGrade} />
            </div>
          )}
          <div className={`${healthScore != null ? 'col-span-2 sm:col-span-3 grid grid-cols-3 gap-4' : 'col-span-2 sm:col-span-4 grid grid-cols-3 gap-4'}`}>
            <SentimentCard value={overallSentiment.positive} type="positive" totalReviews={totalReviews} benchmark={benchmark?.positive} />
            <SentimentCard value={overallSentiment.neutral}  type="neutral"  totalReviews={totalReviews} benchmark={null} />
            <SentimentCard value={overallSentiment.negative} type="negative" totalReviews={totalReviews} benchmark={benchmark?.negative} />
          </div>
        </div>
      </section>

      {/* Trend View */}
      <TrendView apiBase={apiBase} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-meesho-purple mb-4 text-sm">Sentiment Breakdown</h3>
          <SentimentChart data={sentimentData} t={t} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-x-auto">
          <h3 className="font-bold text-meesho-purple mb-4 text-sm">Themes by Frequency</h3>
          <ThemesChart themes={themes} t={t} />
        </div>
      </div>

      {/* Theme cards */}
      {themes.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Theme Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {themes.map((theme, idx) => <ThemeCard key={theme.name} theme={theme} rank={idx + 1} />)}
          </div>
        </section>
      )}

      {/* Recommended Fixes with Fix Now / Big Fix tags */}
      {actions.length > 0 && (
        <section>
          <div className="bg-gradient-to-br from-meesho-pink/5 to-meesho-purple/5 rounded-2xl border border-meesho-pink/20 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-meesho-purple text-lg">Recommended Fixes</h2>
                <p className="text-xs text-gray-400 mt-0.5">Based on actual customer complaints only</p>
              </div>
              <button onClick={handleCopyActions}
                className="text-xs text-meesho-pink border border-meesho-pink/30 hover:border-meesho-pink px-3 py-1.5 rounded-lg font-medium">
                📋 Copy list
              </button>
            </div>
            <ol className="space-y-3">
              {actions.map((action, i) => {
                const text = typeof action === 'object' ? action.text : action;
                const type = typeof action === 'object' ? action.type : null;
                return (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="w-7 h-7 rounded-full bg-meesho-pink text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 pt-1">
                      <span className="text-sm text-gray-700 leading-relaxed">{text}</span>
                      {type && (
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                          type === 'fix_now'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {type === 'fix_now' ? '🟢 Fix Now' : '🔴 Big Fix'}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 flex gap-4 text-xs text-gray-400">
              <span>🟢 Fix Now — update listing/photos (quick)</span>
              <span>🔴 Big Fix — supplier/product change (takes time)</span>
            </div>
          </div>
        </section>
      )}

      {/* Complaints & Praises */}
      {(topComplaints.length > 0 || topPraises.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topComplaints.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5">
              <h3 className="font-bold text-red-500 mb-3 flex items-center gap-2"><span>🔴</span> Top Complaints</h3>
              <ul className="space-y-2">
                {topComplaints.map((c, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600 leading-snug">
                    <span className="text-red-300 flex-shrink-0 mt-0.5">•</span><span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {topPraises.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5">
              <h3 className="font-bold text-green-600 mb-3 flex items-center gap-2"><span>🟢</span> Top Praises</h3>
              <ul className="space-y-2">
                {topPraises.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600 leading-snug">
                    <span className="text-green-400 flex-shrink-0 mt-0.5">•</span><span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Auto Replies */}
      <AutoReplies autoReplies={autoReplies} t={t} onShowToast={onShowToast} onUpdateStatus={onUpdateReplyStatus} />
    </div>
  );
}
