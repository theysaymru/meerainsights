const TYPE_STYLES = {
  info:    'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  success: 'bg-green-50 border-green-200 text-green-800',
};

const TYPE_ICONS = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  success: '✅',
};

export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm animate-slide-up ${TYPE_STYLES[toast.type] || TYPE_STYLES.info}`}
        >
          <span className="flex-shrink-0 mt-0.5">{TYPE_ICONS[toast.type] || TYPE_ICONS.info}</span>
          <p className="flex-1 leading-snug">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 opacity-50 hover:opacity-90 text-lg leading-none transition-opacity"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
