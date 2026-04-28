import Modal from "./components/ui/Modal";
import Input from "./components/ui/Input";
import Button from "./components/ui/Button";
import { useState } from "react";

const Badge = ({ type, children }) => {
  const styles = {
    green: { background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" },
    red: { background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5" },
    blue: { background: "#dbeafe", color: "#1d4ed8", border: "1px solid #93c5fd" },
    teal: { background: "#ccfbf1", color: "#0f766e", border: "1px solid #5eead4" },
    orange: { background: "#ffedd5", color: "#c2410c", border: "1px solid #fdba74" },
  };
  return (
    <span style={{ ...styles[type], padding: "2px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "600" }}>
      {children}
    </span>
  );
};

const rolColor = (rol) => {
  if (rol === "ADMIN") return "teal";
  if (rol === "VENDEDOR") return "blue";
  if (rol === "ALMACEN") return "orange";
  return "blue";
};

export default function App() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const cols = [
    {
      key: "usuario",
      label: "Usuario",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0f766e", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: "bold" }}>
            {row.usuario[0].toUpperCase()}
          </div>
          <span style={{ color: "#111827", fontWeight: 500 }}>{row.usuario}</span>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "rol",
      label: "Rol",
      render: (row) => <Badge type={rolColor(row.rol)}>{row.rol}</Badge>,
    },
    {
      key: "estado",
      label: "Estado",
      render: (row) => <Badge type={row.estado === "Activo" ? "green" : "red"}>{row.estado}</Badge>,
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => alert("Editar " + row.usuario)}
            style={{ padding: "4px 14px", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", color: "#374151", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            Editar
          </button>
          <button onClick={() => alert("Eliminar " + row.usuario)}
            style={{ padding: "4px 14px", borderRadius: "6px", border: "1px solid #fca5a5", background: "white", color: "#dc2626", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  const data = [
    { usuario: "admin", email: "admin@bytestore.com", rol: "ADMIN", estado: "Activo" },
    { usuario: "JuanP", email: "juanp@bytestore.com", rol: "VENDEDOR", estado: "Activo" },
    { usuario: "MarisolS", email: "marisol@bytestore.com", rol: "ALMACEN", estado: "Inactivo" },
    { usuario: "Leonid", email: "leonid@bytestore.com", rol: "VENDEDOR", estado: "Activo" },
  ];

  const filtered = data.filter(u =>
    u.usuario.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "32px", fontFamily: "sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", margin: 0 }}>Usuarios</h1>
          <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>{data.length} usuarios registrados</p>
        </div>
        <button onClick={() => setOpen(true)}
          style={{ padding: "8px 18px", background: "#0f766e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: 14 }}>
          + Nuevo Usuario
        </button>
      </div>

      {/* Stats cards */}
      <div style={{ background: "#134e4a", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ color: "#99f6e4", fontSize: 13, margin: 0 }}>Gestión de Usuario</p>
          <p style={{ color: "#ccfbf1", fontSize: 12, margin: "4px 0 0" }}>{data.length} usuarios registrados</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ background: "#0f766e", borderRadius: "8px", padding: "8px 16px", textAlign: "center" }}>
            <p style={{ color: "white", fontWeight: "bold", fontSize: 20, margin: 0 }}>{data.filter(u => u.estado === "Activo").length}</p>
            <p style={{ color: "#99f6e4", fontSize: 11, margin: 0 }}>Activos</p>
          </div>
          <div style={{ background: "#115e59", borderRadius: "8px", padding: "8px 16px", textAlign: "center" }}>
            <p style={{ color: "white", fontWeight: "bold", fontSize: 20, margin: 0 }}>{data.filter(u => u.estado === "Inactivo").length}</p>
            <p style={{ color: "#99f6e4", fontSize: 11, margin: 0 }}>Inactivos</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <input
          placeholder="🔍  Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #d1d5db", background: "white", fontSize: 14, color: "#374151", outline: "none", width: "260px" }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
              {cols.map(col => (
                <th key={col.key} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}>
                {cols.map(col => (
                  <td key={col.key} style={{ padding: "14px 16px", color: "#6b7280" }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ padding: "12px 16px", background: "#f0fdf4", borderTop: "1px solid #d1fae5" }}>
          <span style={{ color: "#059669", fontSize: 13 }}>Mostrando 1 - {filtered.length} de {data.length} Usuarios</span>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Nuevo Usuario">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input label="Nombre" name="nombre" value="" onChange={() => {}} placeholder="Nombre completo" />
          <Input label="Email" name="email" value="" onChange={() => {}} placeholder="correo@ejemplo.com" />
          <Input label="Contraseña" name="password" type="password" value="" onChange={() => {}} placeholder="••••••••" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => setOpen(false)}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}