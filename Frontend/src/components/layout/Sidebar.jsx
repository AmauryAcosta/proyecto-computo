import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usePermission } from "../../hooks/usePermission";

const navGroups = [
  {
    label: "GESTIÓN",
    items: [
      { to: "/usuarios", label: "Usuarios", permiso: "users:read" },
      { to: "/clientes", label: "Clientes", permiso: "clients:read" },
      { to: "/proveedores", label: "Proveedores", permiso: "suppliers:read" },
    ],
  },
  {
    label: "INVENTARIO",
    items: [
      { to: "/productos", label: "Productos", permiso: "products:read" },
      { to: "/inventario", label: "Inventario", permiso: "inventory:read" },
      { to: "/recepciones", label: "Recepciones", permiso: "recepciones:read" },
    ],
  },
  {
    label: "SISTEMA",
    items: [{ to: "/auditoria", label: "Auditoría", permiso: "audit:read" }],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { hasPermission } = usePermission();

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
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: "#2d5a5a",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            🔒
          </div>
          <div>
            <div
              style={{ color: "#4ade80", fontWeight: "700", fontSize: "18px" }}
            >
              ByteStore
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>
              Hardware para todos · B2B & B2C
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard link — siempre visible */}
      <div style={{ padding: "8px 12px" }}>
        <NavLink
          to="/dashboard"
          style={({ isActive }) => ({
            display: "block",
            padding: "10px 12px",
            borderRadius: "8px",
            color: isActive ? "#1a3535" : "rgba(255,255,255,0.85)",
            backgroundColor: isActive ? "#4ade80" : "transparent",
            textDecoration: "none",
            fontWeight: "500",
            fontSize: "14px",
          })}
        >
          Dashboard
        </NavLink>
      </div>

      {/* Nav groups con permisos */}
      <nav style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
        {navGroups.map((group) => {
          const itemsVisibles = group.items.filter((item) =>
            hasPermission(item.permiso),
          );
          if (itemsVisibles.length === 0) return null;

          return (
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
              {itemsVisibles.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    display: "block",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    color: isActive ? "#1a3535" : "rgba(255,255,255,0.75)",
                    backgroundColor: isActive ? "#4ade80" : "transparent",
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
          );
        })}
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
            color: "#4ade80",
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
