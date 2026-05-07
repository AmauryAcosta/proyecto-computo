import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navGroups = [
  {
    label: "GESTIÓN",
    items: [
      { to: "/usuarios", label: "Usuarios" },
      { to: "/clientes", label: "Clientes" },
      { to: "/proveedores", label: "Proveedores" },
    ],
  },
  {
    label: "INVENTARIO",
    items: [
      { to: "/productos", label: "Productos" },
      { to: "/inventario", label: "Inventario" },
      { to: "/recepciones", label: "Recepciones" },
    ],
  },
  {
    label: "SISTEMA",
    items: [{ to: "/auditoria", label: "Auditoría" }],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  const initials = user?.usuario
    ? user.usuario.slice(0, 2).toUpperCase()
    : "AD";

  return (
    <aside
      style={{
        width: "260px",
        minHeight: "100vh",
        backgroundColor: "#1a3535",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "24px 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div>
            <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <img src="/logo-dash.png" alt="ByteStore" style={{ width: "100%", maxWidth: "200px", height: "auto", display: "block", mixBlendMode: "lighten" }} />
              </div>
          </div>
        </div>
      </div>

      {/* Dashboard link */}
      <div style={{ padding: "8px 12px" }}>
        <NavLink
          to="/dashboard"
          style={({ isActive }) => ({
            display: "block",
            padding: "10px 12px",
            borderRadius: "8px",
            color: isActive ? "#1a3535" : "rgba(255,255,255,0.85)",
            backgroundColor: isActive ? "#51BD9C" : "transparent",
            textDecoration: "none",
            fontWeight: "500",
            fontSize: "14px",
          })}
        >
          Dashboard
        </NavLink>
      </div>

      {/* Nav groups */}
      <nav style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: "8px" }}>
            <div
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "11px",
                fontWeight: "600",
                padding: "8px 12px 4px",
                letterSpacing: "0.05em",
              }}
            >
              {group.label}
            </div>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: "block",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  color: isActive ? "#1a3535" : "rgba(255,255,255,0.75)",
                  backgroundColor: isActive ? "#51BD9C" : "transparent",
                  textDecoration: "none",
                  fontSize: "14px",
                  marginBottom: "2px",
                  transition: "background-color 0.15s",
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User info */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#2d5a5a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#51BD9C",
            fontWeight: "700",
            fontSize: "13px",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: "white",
              fontSize: "13px",
              fontWeight: "500",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.usuario || "admin"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px" }}>
            ADMIN · ByteStore
          </div>
        </div>
        <button
          onClick={logout}
          title="Cerrar sesión"
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            fontSize: "16px",
            padding: "4px",
          }}
        >
          ⏻
        </button>
      </div>
    </aside>
  );
}
