import React from 'react';
import { useToast } from '../hooks/useToast';
import { ToastType } from '../types';
import './ToastContainer.css';

const TOAST_ICONS: Record<ToastType, string> = {
  achievement: '🏆',
  quest: '📜',
  cosmetic: '✨',
  info: 'ℹ️',
  error: '⚠️',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="toast-icon">
            {toast.icon || TOAST_ICONS[toast.type]}
          </span>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            {toast.message && (
              <div className="toast-message">{toast.message}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
