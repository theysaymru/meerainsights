import { useState } from 'react';

const STATUS_STYLES = {
  draft:  'bg-amber-100 text-amber-700 border-amber-200',
  ready:  'bg-green-100 text-green-700 border-green-200',
  copied: 'bg-blue-100 text-blue-700 border-blue-200',
};

const STATUS_LABELS = {
  draft:  '✏️ Draft',
  ready:  '✅ Ready',
  copied: '📋 Copied',
};

export default function AutoReplies({ autoReplies, t, onShowToast, onUpdateStatus }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  // Build filter chips dynamically from actual themes in data
  const availableFilters = ['All', ...autoReplies.map(r => r.theme)];

  const filtered = autoReplies.filter(r =>
    activeFilter === 'All' || r.theme === activeFilter
  );

  const handleCopyReply = async reply => {
    try {
      await navigator.clipboard.writeText(reply.suggestedReply);
      onShowToast(`Reply copied for "${reply.theme}"`, 'success');
      onUpdateStatus(reply.id, 'copied');
    } catch {
      onShowToast(t.copyFailed, 'error');
    }
  };

  const handleCopyAll = async () => {
    if (filtered.length === 0) {
      onShowToast(t.noAutoReplies, 'warning');
      return;
    }
    try {
      const text = filtered
        .map(r => `=== ${r.theme} (${r.affectedReviewsCount} customers) ===\n${r.suggestedReply}`)
        .join('\n\n');
      await navigator.clipboard.writeText(text);
      onShowToast(`${filtered.length} replies copied to clipboard!`, 'success');
    } catch {
      onShowToast(t.copyFailed, 'error');
    }
  };

  const handleMarkReady = reply => {
    const next = reply.status === 'ready' ? 'draft' : 'ready';
    onUpdateStatus(reply.id, next);
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h3 className="font-bold text-meesho-purple text-lg">{t.autoReplyByTheme}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Evidence-based replies — edit before posting</p>
        </div>
        <button
          onClick={handleCopyAll}
          className="text-sm bg-meesho-pink text-white px-4 py-2 rounded-xl hover:bg-meesho-pink-dark active:scale-95 transition-all font-semibold shadow-sm"
        >
          📋 {t.copyAllReplies}
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-xs text-gray-400 mb-4 flex-wrap">
        <span>📝 {autoReplies.filter(r => r.status === 'draft').length} drafts</span>
        <span>✅ {autoReplies.filter(r => r.status === 'ready').length} ready</span>
        <span>📋 {autoReplies.filter(r => r.status === 'copied').length} copied</span>
      </div>

      {/* Filter chips — built from actual themes */}
      <div className="flex flex-wrap gap-2 mb-5">
        {availableFilters.map(theme => (
          <button
            key={theme}
            onClick={() => setActiveFilter(theme)}
            className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
              activeFilter === theme
                ? 'bg-meesho-pink text-white border-meesho-pink shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-meesho-pink hover:text-meesho-pink'
            }`}
          >
            {theme}
            {theme !== 'All' && (
              <span className={`ml-1.5 text-xs ${activeFilter === theme ? 'opacity-75' : 'opacity-50'}`}>
                ({autoReplies.filter(r => r.theme === theme).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reply cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-sm">{t.noAutoReplies}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(reply => {
            const isExpanded = expandedId === reply.id;
            return (
              <div
                key={reply.id}
                className="border border-gray-100 rounded-2xl p-4 hover:shadow-card-hover transition-shadow bg-gray-50/60"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-meesho-purple text-sm">{reply.theme}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[reply.status]}`}>
                        {STATUS_LABELS[reply.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-snug">{reply.complaintPattern}</p>
                  </div>
                  <div className="flex-shrink-0 bg-meesho-pink-light text-meesho-pink text-xs px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">
                    {reply.affectedReviewsCount} {t.customers}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-3 mb-3">
                  <p className={`text-sm text-gray-600 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
                    {reply.suggestedReply}
                  </p>
                  {reply.suggestedReply.length > 180 && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : reply.id)}
                      className="text-xs text-meesho-pink mt-1 hover:underline font-medium"
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyReply(reply)}
                    className="flex-1 text-sm bg-meesho-pink text-white px-3 py-2 rounded-xl hover:bg-meesho-pink-dark active:scale-95 transition-all font-semibold"
                  >
                    📋 {t.copyReply}
                  </button>
                  <button
                    onClick={() => handleMarkReady(reply)}
                    className={`flex-1 text-sm px-3 py-2 rounded-xl transition-all font-semibold border ${
                      reply.status === 'ready'
                        ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-meesho-pink hover:text-meesho-pink active:scale-95'
                    }`}
                  >
                    {reply.status === 'ready' ? '✅ Ready' : t.markReady}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
