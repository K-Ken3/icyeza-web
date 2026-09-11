import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X, HelpCircle } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const confirmResolver = useRef(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success', duration = 3500) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), duration);
      return id;
    },
    [removeToast]
  );

  const confirm = useCallback(
    (message, options = {}) => {
      return new Promise((resolve) => {
        confirmResolver.current = resolve;
        setConfirmState({
          message,
          title: options.title || 'Are you sure?',
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          tone: options.tone || 'danger',
        });
      });
    },
    []
  );

  const resolveConfirm = useCallback((result) => {
    confirmResolver.current?.(result);
    confirmResolver.current = null;
    setConfirmState(null);
  }, []);

  const value = useMemo(
    () => ({
      toast: showToast,
      success: (msg) => showToast(msg, 'success'),
      error: (msg) => showToast(msg, 'error', 5000),
      info: (msg) => showToast(msg, 'info'),
      warning: (msg) => showToast(msg, 'warning'),
      confirm,
    }),
    [showToast, confirm]
  );

  const icons = {
    success: <CheckCircle2 className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
    warning: <AlertTriangle className="text-amber-500" size={20} />,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex items-center gap-3 rounded-xl bg-white shadow-lg border border-stone-100 px-4 py-3 min-w-[260px] max-w-sm"
              role="status"
            >
              {icons[t.type]}
              <span className="text-sm text-stone-800 flex-1">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {confirmState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4"
            onClick={() => resolveConfirm(false)}
            role="dialog"
            aria-modal="true"
            aria-label={confirmState.title}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-stone-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <span
                    className={`flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center ${
                      confirmState.tone === 'danger'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-amber-50 text-amber-500'
                    }`}
                  >
                    <HelpCircle size={22} />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-stone-900">
                      {confirmState.title}
                    </h2>
                    <p className="text-sm text-stone-500 mt-0.5">{confirmState.message}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={() => resolveConfirm(false)}
                    className="flex-1 rounded-full border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    {confirmState.cancelText}
                  </button>
                  <button
                    onClick={() => resolveConfirm(true)}
                    className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-colors ${
                      confirmState.tone === 'danger'
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-primary hover:bg-primary-dark'
                    }`}
                  >
                    {confirmState.confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
