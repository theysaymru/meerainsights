import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import InputScreen from './components/InputScreen';
import Dashboard from './components/Dashboard';
import CompareView from './components/CompareView';
import Toast from './components/Toast';
import { translations } from './translations';

// Relative by default so the same build works behind nginx in the single Docker image
// (any host/domain) as well as via the Vite dev proxy locally. Override with VITE_API_BASE
// only for local dev against a backend on a different port than the dev server's proxy.
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export default function App() {
  const [screen, setScreen] = useState('input');
  const [language, setLanguage] = useState('en');
  const [reviewText, setReviewText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [compareReviews, setCompareReviews] = useState({ before: '', after: '' });
  const [compareResult, setCompareResult] = useState(null);

  const t = translations[language] || translations.en;

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Load analysis from URL param on first mount (?analysis=ID)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('analysis');
    if (id) {
      fetch(`${API_BASE}/api/analyses/${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            setAnalysis(data);
            setScreen('dashboard');
          } else {
            window.history.replaceState({}, '', window.location.pathname);
            showToast('That shared analysis has expired — paste reviews below to run a fresh one.', 'warning');
          }
        })
        .catch(() => {
          window.history.replaceState({}, '', window.location.pathname);
          showToast('Could not load the shared analysis — paste reviews below to run a fresh one.', 'warning');
        });
    }
  }, []);

  const handleAnalyze = async () => {
    if (!reviewText.trim()) { showToast(t.emptyWarning, 'warning'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviews: reviewText }),
      });
      if (res.status === 413) { showToast(t.inputTooLarge, 'error'); return; }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || t.analysisError, 'error');
        return;
      }
      const data = await res.json();
      setAnalysis(data);
      setScreen('dashboard');
      window.history.pushState({}, '', `?analysis=${data.id}`);
    } catch {
      showToast(t.backendError, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!compareReviews.before.trim() || !compareReviews.after.trim()) {
      showToast('Both "Before" and "After" reviews are required for comparison.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const [resA, resB] = await Promise.all([
        fetch(`${API_BASE}/api/analyze`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviews: compareReviews.before }),
        }),
        fetch(`${API_BASE}/api/analyze`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviews: compareReviews.after }),
        }),
      ]);
      if (!resA.ok || !resB.ok) throw new Error('Analysis failed');
      const [before, after] = await Promise.all([resA.json(), resB.json()]);
      setCompareResult({ before, after });
      setScreen('compare');
    } catch {
      showToast('Comparison failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReplyStatus = async (replyId, status) => {
    try {
      await fetch(`${API_BASE}/api/auto-replies/${replyId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setAnalysis(prev => prev ? {
        ...prev,
        autoReplies: prev.autoReplies.map(r => r.id === replyId ? { ...r, status } : r)
      } : prev);
    } catch { /* silently fail */ }
  };

  const handleGoHome = () => {
    setScreen('input');
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-meesho-pink-bg">
      <Header language={language} onLanguageChange={setLanguage} t={t} onHome={handleGoHome} />
      <main className="max-w-5xl mx-auto px-4 py-6">
        {screen === 'input' ? (
          <InputScreen
            reviewText={reviewText}
            onChange={setReviewText}
            onAnalyze={handleAnalyze}
            onCompare={handleCompare}
            compareReviews={compareReviews}
            onCompareChange={setCompareReviews}
            loading={loading}
            t={t}
            onShowToast={showToast}
            apiBase={API_BASE}
          />
        ) : screen === 'compare' ? (
          <CompareView result={compareResult} onBack={handleGoHome} t={t} onShowToast={showToast} />
        ) : (
          <Dashboard
            analysis={analysis}
            onBack={handleGoHome}
            t={t}
            onShowToast={showToast}
            onUpdateReplyStatus={handleUpdateReplyStatus}
            apiBase={API_BASE}
          />
        )}
      </main>
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
