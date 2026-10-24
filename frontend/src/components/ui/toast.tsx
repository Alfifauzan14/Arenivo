import * as React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (type: ToastType, message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (type: ToastType, message: string, title?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:top-6 sm:right-6 z-50 flex flex-col gap-2 max-w-sm mx-auto sm:mx-0 w-auto sm:w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 sm:p-4 shadow-xl transition-all animate-in slide-in-from-top-4 duration-200 bg-white/95 backdrop-blur-md",
              toast.type === "success" && "border-emerald-200 text-slate-800",
              toast.type === "error" && "border-rose-300 text-slate-800",
              toast.type === "warning" && "border-amber-200 text-slate-800",
              toast.type === "info" && "border-blue-200 text-slate-800"
            )}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
              {toast.type === "error" && (
                <AlertCircle className="w-5 h-5 text-rose-600" />
              )}
              {toast.type === "warning" && (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
              {toast.type === "info" && (
                <Info className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              {toast.title && (
                <p className="font-semibold text-sm text-slate-900 leading-tight">
                  {toast.title}
                </p>
              )}
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
