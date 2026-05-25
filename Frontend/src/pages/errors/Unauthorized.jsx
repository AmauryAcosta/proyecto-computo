import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: "600px", width: "100%", padding: "40px 20px" }}>
        <h1 style={{ fontSize: "120px", fontWeight: "900", color: "#1b4332", margin: "0 0 8px", lineHeight: 1, letterSpacing: "-4px" }}>401</h1>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 8px" }}>No autenticado.</h2>
        <p style={{ fontSize: "15px", color: "#9ca3af", margin: "0 0 32px" }}>Necesitas iniciar sesión para acceder a este recurso.</p>
        <img
          src="https://img.freepik.com/free-vector/privacy-policy-concept-illustration_114360-7853.jpg"
          alt="401"
          style={{ width: "260px", height: "220px", objectFit: "contain", margin: "0 auto 40px", display: "block" }}
        />
        <button
          onClick={() => navigate("/login")}
          style={{ background: "#1b4332", color: "white", border: "none", borderRadius: "8px", padding: "14px 48px", fontSize: "16px", fontWeight: "600", cursor: "pointer" }}>
          Ir al Login
        </button>
      </div>
    </div>
  );
}