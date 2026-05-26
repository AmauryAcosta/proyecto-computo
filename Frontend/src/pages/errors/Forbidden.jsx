import { useNavigate } from "react-router-dom";

export default function Forbidden() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: "600px", width: "100%", padding: "40px 20px" }}>
        <h1 style={{ fontSize: "120px", fontWeight: "900", color: "#1b4332", margin: "0 0 8px", lineHeight: 1, letterSpacing: "-4px" }}>403</h1>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 8px" }}>Acceso denegado.</h2>
        <p style={{ fontSize: "15px", color: "#9ca3af", margin: "0 0 32px" }}>No tienes permisos para acceder a esta sección del sistema.</p>
        <img
          src="https://img.freepik.com/free-vector/access-control-system-abstract-concept_335657-3180.jpg"
          alt="403"
          style={{ width: "260px", height: "220px", objectFit: "contain", margin: "0 auto 40px", display: "block" }}
        />
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "#1b4332", color: "white", border: "none", borderRadius: "8px", padding: "14px 48px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}>
            ← Regresar
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            style={{ background: "white", color: "#1b4332", border: "2px solid #1b4332", borderRadius: "8px", padding: "14px 48px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}