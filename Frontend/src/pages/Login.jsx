import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Completa todos los campos");
      return;
    }
    login({ username: form.username }, "token-temporal");
    navigate("/dashboard");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb" }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", padding: "40px", width: "100%", maxWidth: "360px" }}>
        
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", textAlign: "center", marginBottom: "4px" }}>
          Iniciar sesión
        </h1>
        <p style={{ color: "#6b7280", fontSize: "14px", textAlign: "center", marginBottom: "24px" }}>
          Ingresa tus credenciales
        </p>

        {error && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Usuario</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Tu usuario"
              style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", outline: "none" }}
            />
          </div>

          <button
            type="submit"
            style={{ backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "8px", padding: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginTop: "4px" }}
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}