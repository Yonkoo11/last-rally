// ============================================
// CHAINBREAK - TOAST COMPONENT
// Visual notification display with dark/brutal theme
// ============================================

import { useToast, Toast as ToastType } from '../lib/toast-context';

const TOAST_STYLES: Record<ToastType['type'], { bg: string; border: string; icon: string }> = {
  error: {
    bg: 'linear-gradient(180deg, #3a0a0a 0%, #1a0505 100%)',
    border: '#8B0000',
    icon: '\u2716', // X mark
  },
  success: {
    bg: 'linear-gradient(180deg, #0a2a0a 0%, #051a05 100%)',
    border: '#228B22',
    icon: '\u2714', // Check mark
  },
  warning: {
    bg: 'linear-gradient(180deg, #3a2a0a 0%, #1a1505 100%)',
    border: '#DAA520',
    icon: '\u26A0', // Warning triangle
  },
  info: {
    bg: 'linear-gradient(180deg, #0a1a3a 0%, #050a1a 100%)',
    border: '#4169E1',
    icon: '\u2139', // Info circle
  },
};

function ToastItem({ toast, onClose }: { toast: ToastType; onClose: () => void }) {
  const style = TOAST_STYLES[toast.type];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: 6,
        boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 15px ${style.border}40`,
        animation: 'toastSlideIn 0.3s ease-out',
        maxWidth: 400,
      }}
    >
      {/* Icon */}
      <span
        style={{
          fontSize: 18,
          color: style.border,
          flexShrink: 0,
        }}
      >
        {style.icon}
      </span>

      {/* Message */}
      <p
        style={{
          flex: 1,
          margin: 0,
          fontSize: 14,
          color: '#c0a080',
          fontFamily: 'serif',
          lineHeight: 1.4,
        }}
      >
        {toast.message}
      </p>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#5a4a3a',
          fontSize: 16,
          cursor: 'pointer',
          padding: '4px 8px',
          flexShrink: 0,
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#8a7a6a')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#5a4a3a')}
        aria-label="Dismiss notification"
      >
        \u2715
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <>
      {/* Animation keyframes */}
      <style>
        {`
          @keyframes toastSlideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>

      {/* Toast container */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
        }}
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </>
  );
}

// Re-export for convenience
export { useToast } from '../lib/toast-context';
