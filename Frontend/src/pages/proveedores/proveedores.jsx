import { useState } from "react";
import { useToast } from "../../components/ui/Toast";
import FilterBar from "../../components/ui/FilterBar";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const Badge = ({ type, children }) => {
  const styles = {
    green: { background: "#dcfce7", color: "#15803d", border: "1px solid #86efac" },
    red: { background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5" },
  };
  return (
    <span style={{ ...styles[type], padding: "2px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: "600" }}>
      {children}
    </span>
  );
};

const initialData = [
  { id: 1, empresa: "HP Mexico", email: "ventas@hp.mx", rfc: "HPM88001012SX", telefono: "55-5000-1021", estado: "Activo" },
  { id: 2, empresa: "Canon México", email: "ventas@canon.mx", rfc: "CMX920301AB1", telefono: "55-5000-2032", estado: "Activo" },
  { id: 3, empresa: "Logitech México", email: "ventas@logitech.mx", rfc: "LMX850612CD3", telefono: "55-5000-3043", estado: "Activo" },
];

const emptyForm = { empresa: "", email: "", rfc: "", telefono: "" };

export default function Proveedores() {
  const toast = useToast();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = data.filter((p) => {
    const matchSearch =
      p.empresa.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.rfc.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === "todos" || p.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const handleOpen = (item = null) => {
    setEditItem(item);
    setForm(item ? { empresa: item.empresa, email: item.email, rfc: item.rfc, telefono: item.telefono } : emptyForm);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.empresa || !form.email) {
      toast("Completa todos los campos", "error");
      return;
    }
    if (editItem) {
      setData(data.map((p) => p.id === editItem.id ? { ...p, ...form } : p));
      toast("Proveedor actualizado", "success");
    } else {
      setData([...data, { id: Date.now(), ...form, estado: "Activo" }]);
      toast("Proveedor creado", "success");
    }
    setModalOpen(false);
  };

  const handleToggle = (id) => {
    setData(data.map((p) => p.id === id ? { ...p, estado: p.estado === "Activo" ? "Inactivo" : "Activo" } : p));
    toast("Estado actualizado", "info");
  };

  const handleDelete = (id) => {
    setData(data.filter((p) => p.id !== id));
    toast("Proveedor eliminado", "warning");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "32px", fontFamily: "sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", margin: 0 }}>Proveedores</h1>
          <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>{data.length} proveedores registrados</p>
        </div>
        <button onClick={() => handleOpen()}
          style={{ padding: "8px 18px", background: "#0f766e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: 14 }}>
          + Nuevo Proveedor
        </button>
      </div>

      {/* Stats */}
      <div style={{ background: "#134e4a", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ color: "#99f6e4", fontSize: 13, margin: 0 }}>Proveedores ByteStore</p>
          <p style={{ color: "#ccfbf1", fontSize: 12, margin: "4px 0 0" }}>{data.length} proveedores registrados</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ background: "#0f766e", borderRadius: "8px", padding: "8px 16px", textAlign: "center" }}>
            <p style={{ color: "white", fontWeight: "bold", fontSize: 20, margin: 0 }}>{data.filter(p => p.estado === "Activo").length}</p>
            <p style={{ color: "#99f6e4", fontSize: 11, margin: 0 }}>Activos</p>
          </div>
          <div style={{ background: "#115e59", borderRadius: "8px", padding: "8px 16px", textAlign: "center" }}>
            <p style={{ color: "white", fontWeight: "bold", fontSize: 20, margin: 0 }}>{data.filter(p => p.estado === "Inactivo").length}</p>
            <p style={{ color: "#99f6e4", fontSize: 11, margin: 0 }}>Inactivos</p>
          </div>
        </div>
      </div>

      {/* FilterBar */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Buscar proveedor..."
        filters={[
          {
            key: "estado",
            value: filterEstado,
            onChange: setFilterEstado,
            options: [
              { value: "todos", label: "Todos los estados" },
              { value: "Activo", label: "Activo" },
              { value: "Inactivo", label: "Inactivo" },
            ],
          },
        ]}
      />

      {/* Tabla */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
              {["Empresa", "RFC", "Email", "Teléfono", "Estado", "Acciones"].map(col => (
                <th key={col} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid #f3f4f6" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}>
                <td style={{ padding: "14px 16px", color: "#111827", fontWeight: 500 }}>{row.empresa}</td>
                <td style={{ padding: "14px 16px", color: "#6b7280" }}>{row.rfc}</td>
                <td style={{ padding: "14px 16px", color: "#6b7280" }}>{row.email}</td>
                <td style={{ padding: "14px 16px", color: "#6b7280" }}>{row.telefono}</td>
                <td style={{ padding: "14px 16px" }}>
                  <Badge type={row.estado === "Activo" ? "green" : "red"}>{row.estado}</Badge>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleOpen(row)}
                      style={{ padding: "4px 12px", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", color: "#374151", cursor: "pointer", fontSize: 13 }}>
                      Editar
                    </button>
                    <button onClick={() => handleToggle(row.id)}
                      style={{ padding: "4px 12px", borderRadius: "6px", border: "1px solid #d1d5db", background: "white", color: row.estado === "Activo" ? "#dc2626" : "#15803d", cursor: "pointer", fontSize: 13 }}>
                      {row.estado === "Activo" ? "Desactivar" : "Activar"}
                    </button>
                    <button onClick={() => handleDelete(row.id)}
                      style={{ padding: "4px 12px", borderRadius: "6px", border: "1px solid #fca5a5", background: "white", color: "#dc2626", cursor: "pointer", fontSize: 13 }}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "12px 16px", background: "#f0fdf4", borderTop: "1px solid #d1fae5" }}>
          <span style={{ color: "#059669", fontSize: 13 }}>Mostrando {filtered.length} de {data.length} proveedores</span>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Editar Proveedor" : "Nuevo Proveedor"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input label="Empresa" name="empresa" value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} placeholder="Nombre de la empresa" />
          <Input label="Email" name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@empresa.com" />
          <Input label="RFC" name="rfc" value={form.rfc} onChange={e => setForm({ ...form, rfc: e.target.value })} placeholder="RFC de la empresa" />
          <Input label="Teléfono" name="telefono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="55-5000-0000" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}