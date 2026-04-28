import { useState, useEffect, createContext, useContext, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  const colors = {
    success: { background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d" },
    error: { background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626" },
    warning: { background: "#fffbeb", border: "1px solid #fcd34d", color: "#d97706" },
    info: { background: "#eff6ff", border: "1px solid #93c5fd", color: "#1d4ed8" },
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", display: "flex", flexDirection: "column", gap: "10px", zIndex: 9999 }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ ...colors[toast.type], padding: "12px 16px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "8px", fontSize: 14, minWidth: "250px", animation: "fadeIn 0.3s ease" }}>
            <span>{icons[toast.type]}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}