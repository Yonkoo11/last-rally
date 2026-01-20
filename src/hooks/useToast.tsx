import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Toast, Achievement } from '../types';

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showAchievement: (achievement: Achievement) => void;
  showQuestComplete: (questName: string, nextQuestName?: string) => void;
  showCosmeticUnlock: (cosmeticName: string) => void;
  showInfo: (title: string, message?: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${++toastIdCounter}`;
    const duration = toast.duration || 3000;

    setToasts(prev => [...prev, { ...toast, id }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showAchievement = useCallback(
    (achievement: Achievement) => {
      addToast({
        type: 'achievement',
        title: achievement.name,
        message: achievement.description,
        icon: achievement.icon,
        duration: 4000,
      });
    },
    [addToast]
  );

  const showQuestComplete = useCallback(
    (questName: string, nextQuestName?: string) => {
      addToast({
        type: 'quest',
        title: `Quest Complete: ${questName}`,
        message: nextQuestName
          ? `New quest unlocked: ${nextQuestName}`
          : undefined,
        duration: 4000,
      });
    },
    [addToast]
  );

  const showCosmeticUnlock = useCallback(
    (cosmeticName: string) => {
      addToast({
        type: 'cosmetic',
        title: 'New Cosmetic Unlocked!',
        message: cosmeticName,
        duration: 3500,
      });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      addToast({
        type: 'info',
        title,
        message,
        duration: 2500,
      });
    },
    [addToast]
  );

  const showError = useCallback(
    (message: string) => {
      addToast({
        type: 'error',
        title: 'Error',
        message,
        duration: 3000,
      });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        showAchievement,
        showQuestComplete,
        showCosmeticUnlock,
        showInfo,
        showError,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
