"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  const value = {
    toast: showToast,
    success: (msg: string) => showToast(msg, "success"),
    error: (msg: string) => showToast(msg, "error"),
    info: (msg: string) => showToast(msg, "info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center justify-between p-3.5 rounded-[16px] shadow-md border border-[var(--border)] bg-[var(--surface-white)] text-[var(--text-primary)] text-xs sm:text-sm font-medium transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-center gap-2.5">
              {t.type === "success" && (
                <CheckCircle2 className="w-4 h-4 text-[var(--green-primary)] shrink-0 stroke-[2.5]" />
              )}
              {t.type === "error" && (
                <AlertCircle className="w-4 h-4 text-[var(--red-text)] shrink-0 stroke-[2.5]" />
              )}
              {t.type === "info" && (
                <Info className="w-4 h-4 text-[var(--orange-primary)] shrink-0 stroke-[2.5]" />
              )}
              <span className="leading-snug">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition-colors ml-2"
              aria-label="ปิดการแจ้งเตือน"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
