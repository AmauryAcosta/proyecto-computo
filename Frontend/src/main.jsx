// src/main.jsx — este casi no se toca, solo verifica que esté así
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ToastProvider } from "./components/ui/Toast.jsx";
import { AuthProvider } from "./context/AuthContext.jsx"; 

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>        
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>        
  </StrictMode>,
);