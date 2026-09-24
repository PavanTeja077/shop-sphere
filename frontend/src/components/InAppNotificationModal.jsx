// frontend/src/components/InAppNotificationModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

// Global helper to trigger an in-app confirmation modal with "OK"
export const showInAppAlert = ({
  title = 'Notification',
  message = '',
  type = 'success',
  confirmText = 'OK',
  onConfirm = null
}) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('shopsphere-inapp-alert', {
        detail: { title, message, type, confirmText, onConfirm }
      })
    );
  }
};

// Global helper to trigger a quick non-blocking toast
export const showInAppToast = ({
  message = '',
  type = 'success',
  duration = 4000
}) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('shopsphere-inapp-toast', {
        detail: { message, type, duration }
      })
    );
  }
};

export default function InAppNotificationModal() {
  const [modalAlert, setModalAlert] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Intercept window.alert so even legacy/unhandled calls never show Chrome dialog
    const originalAlert = window.alert;
    window.alert = (msg) => {
      const text = typeof msg === 'string' ? msg : JSON.stringify(msg);
      // Decide if it looks like an error, success, or info
      let type = 'info';
      let title = 'ShopSphere Notification';
      if (/success|dispatched|created|recorded|confirmed/i.test(text)) {
        type = 'success';
        title = 'Success';
      } else if (/fail|error|invalid|denied/i.test(text)) {
        type = 'error';
        title = 'Attention Required';
      }
      showInAppAlert({ title, message: text, type, confirmText: 'OK' });
    };

    const handleAlertEvent = (e) => {
      if (e.detail) {
        setModalAlert(e.detail);
      }
    };

    const handleToastEvent = (e) => {
      if (e.detail) {
        const id = Date.now() + Math.random();
        const newToast = { id, ...e.detail };
        setToasts((prev) => [...prev, newToast]);

        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, e.detail.duration || 4000);
      }
    };

    window.addEventListener('shopsphere-inapp-alert', handleAlertEvent);
    window.addEventListener('shopsphere-inapp-toast', handleToastEvent);

    return () => {
      window.alert = originalAlert;
      window.removeEventListener('shopsphere-inapp-alert', handleAlertEvent);
      window.removeEventListener('shopsphere-inapp-toast', handleToastEvent);
    };
  }, []);

  const handleCloseModal = () => {
    if (modalAlert?.onConfirm && typeof modalAlert.onConfirm === 'function') {
      try {
        modalAlert.onConfirm();
      } catch (err) {
        console.error(err);
      }
    }
    setModalAlert(null);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-8 h-8 text-emerald-400" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-amber-400" />;
      default:
        return <Info className="w-8 h-8 text-cyan-400" />;
    }
  };

  return (
    <>
      {/* 1. Modal Alert Dialog with in-web "OK" Button */}
      <AnimatePresence>
        {modalAlert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* In-Web Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 in-app-alert-card border shadow-2xl z-10 overflow-hidden"
              style={{
                backgroundColor: 'var(--theme-surface, #0e1526)',
                borderColor: 'var(--theme-border, rgba(255,255,255,0.15))',
                color: 'var(--theme-text-primary, #ffffff)'
              }}
            >
              {/* Subtle top ambient glow */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{
                  background: modalAlert.type === 'error'
                    ? 'linear-gradient(90deg, #f43f5e, #fb7185)'
                    : modalAlert.type === 'warning'
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #14b8a6, #2dd4bf)'
                }}
              />

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0">
                  {getIcon(modalAlert.type)}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-xl font-black tracking-tight mb-2">
                    {modalAlert.title || 'Message'}
                  </h3>
                  <div className="text-sm opacity-85 leading-relaxed whitespace-pre-wrap break-words">
                    {modalAlert.message}
                  </div>
                </div>
              </div>

              {/* Action Buttons with "OK" */}
              <div className="mt-7 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={handleCloseModal}
                  autoFocus
                  className="px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-98 flex items-center justify-center min-w-[90px]"
                  style={{
                    backgroundColor: 'var(--theme-accent, #14b8a6)',
                    color: '#ffffff'
                  }}
                >
                  {modalAlert.confirmText || 'OK'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Floating Toasts */}
      <div className="fixed bottom-6 right-6 z-[95] flex flex-col gap-2.5 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="pointer-events-auto rounded-2xl px-4 py-3.5 border shadow-xl flex items-center gap-3 backdrop-blur-xl"
              style={{
                backgroundColor: 'var(--theme-surface, #0e1526)',
                borderColor: 'var(--theme-border, rgba(255,255,255,0.15))',
                color: 'var(--theme-text-primary, #ffffff)'
              }}
            >
              <div className="shrink-0">{getIcon(toast.type)}</div>
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
