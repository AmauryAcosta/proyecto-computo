import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { loginRequest } from "../api/auth";

const labelColor = "rgba(59, 71, 54, 0.85)";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ usuario: "", password: "" });
  const [error, setError] = useState(null);
  const [pressing, setPressing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.usuario || !form.password) {
      setError("Completa todos los campos");
      return;
    }
    try {
      const data = await loginRequest(form.usuario, form.password);
      login({ usuario: form.usuario }, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Usuario o contraseña incorrectos",
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/bg-login.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.9,
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "#F3F2F7",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          padding: "40px 36px",
          width: "100%",
          maxWidth: "380px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "28px",
          }}
        >
          <img
            src="/logo.png"
            alt="ByteStore logo"
            style={{ width: "340px" }}
          />
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#dc2626",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <div>
            <label
              style={{ fontSize: "13px", fontWeight: "500", color: labelColor }}
            >
              Usuario
            </label>
            <input
              type="text"
              name="usuario"
              value={form.usuario}
              onChange={handleChange}
              placeholder="usuario"
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                padding: "9px 12px",
                fontSize: "14px",
                width: "100%",
                backgroundColor: "#F3F2F7",
              }}
            />
          </div>

          <div>
            <label
              style={{ fontSize: "13px", fontWeight: "500", color: labelColor }}
            >
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                padding: "9px 12px",
                fontSize: "14px",
                width: "100%",
                backgroundColor: "#F3F2F7",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            onMouseDown={() => setPressing(true)}
            onMouseUp={() => setPressing(false)}
            onMouseLeave={() => setPressing(false)}
            style={{
              backgroundColor: pressing ? "#244242" : "#F3F2F7",
              color: pressing ? "white" : "#111827",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "10px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: labelColor,
            marginTop: "20px",
          }}
        >
          ByteStore ERP - Universidad de Guanajuato
        </p>
      </div>
    </div>
  );
}
