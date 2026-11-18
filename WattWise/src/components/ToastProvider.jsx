import { useCallback, useMemo, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { ToastContext } from '../lib/toast.js';

const DEFAULT_DURATION = 6000;
// A toast carrying an action (Undo) stays longer — the user has to read it,
// decide, and aim for the button, which 6 seconds does not comfortably allow.
const ACTION_DURATION = 11000;

/**
 * Lightweight toast system.
 *
 * Destructive actions (removing a device) push a toast carrying an Undo
 * action rather than opening a confirm dialog. A modal confirm interrupts the
 * user on every delete, including the ones they meant; undo only costs them
 * something in the rare case they were wrong, and keeps the flow moving.
 *
 * The region is `aria-live="polite"` so the message is announced without
 * stealing focus mid-task.
 */
export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    ({ message, tone = 'info', action, duration }) => {
      const life = duration ?? (action ? ACTION_DURATION : DEFAULT_DURATION);
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((current) => [...current.slice(-2), { id, message, tone, action }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), life),
      );
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      push,
      dismiss,
      success: (message, options) => push({ ...options, message, tone: 'success' }),
      warning: (message, options) => push({ ...options, message, tone: 'warning' }),
      info: (message, options) => push({ ...options, message, tone: 'info' }),
    }),
    [dismiss, push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.tone}`}>
            <span className="toast__mark" aria-hidden="true">
              {toast.tone === 'success' ? <Icon name="check" size={12} /> : '!'}
            </span>
            <span className="toast__text">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                className="toast__action"
                onClick={() => {
                  toast.action.onClick();
                  dismiss(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              className="toast__close"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
