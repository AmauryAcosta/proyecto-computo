import { useState } from "react";
import { useToast } from "../../components/ui/Toast";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";

const initialData = [
  {
    id: 1,
    proveedor: "HP Mexico",
    fecha: "2026-05-01",
    estado: "Confirmada",
    productos: [
      { nombre: "Toner HP 85A", cantidad: 10, precioUnitario: 800 },
      { nombre: "Cable HDMI 2m", cantidad: 5, precioUnitario: 180 },
    ],
  },
  {
    id: 2,
    proveedor: "Logitech México",
    fecha: "2026-05-03",
    estado: "Pendiente",
    productos: [
      { nombre: "Mouse Logitech M185", cantidad: 20, precioUnitario: 250 },
    ],
  },
];

const emptyForm = { proveedor: "", fecha: "" };

const selectStyle = {
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "7px 12px",
  fontSize: "13px",
  color: "#374151",
  backgroundColor: "white",
  cursor: "pointer",
};

const estadoBadge = (estado) => {
  const styles = {
    Confirmada: { background: "#dcfce7", color: "#15803d" },
    Pendiente: { background: "#fef9c3", color: "#a16207" },
    "En proceso": { background: "#dbeafe", color: "#1d4ed8" },
  };
  return (
    <span style={{
      ...styles[estado],
      padding: "2px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600",
    }}>
      {estado}
    </span>
  );
};

export default function Recepciones() {
  const toast = useToast();
  const [data, setData] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detalleItem, setDetalleItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  const confirmadas = data.filter((r) => r.estado === "Confirmada").length;
  const pendientes = data.filter((r) => r.estado === "Pendiente").length;

  const filtered = data.filter((r) => {
    const matchSearch = !search || r.proveedor.toLowerCase().includes(search.toLowerCase());
    const matchEstado = !filterEstado || r.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const totalRecepcion = (productos) =>
    productos.reduce((acc, p) => acc + p.cantidad * p.precioUnitario, 0);

  const handleOpen = (item = null) => {
    setEditItem(item);
    setForm(item ? { proveedor: item.proveedor, fecha: item.fecha } : emptyForm);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.proveedor || !form.fecha) {
      toast("Completa todos los campos", "error");
      return;
    }
    if (editItem) {
      setData(data.map((r) => r.id === editItem.id ? { ...r, ...form } : r));
      toast("Recepción actualizada", "success");
    } else {
      setData([...data, { id: Date.now(), ...form, estado: "Pendiente", productos: [] }]);
      toast("Recepción creada", "success");
    }
    setModalOpen(false);
  };

  const handleConfirmar = (id) => {
    setData(data.map((r) => r.id === id ? { ...r, estado: "Confirmada" } : r));
    toast("Recepción confirmada", "success");
  };

  const handleEliminar = (item) => {
    if (!confirm(`¿Eliminar recepción de ${item.proveedor}?`)) return;
    setData(data.filter((r) => r.id !== item.id));
    toast("Recepción eliminada", "warning");
  };

  const columns = [
    { key: "proveedor", label: "Proveedor" },
    { key: "fecha", label: "Fecha" },
    {
      key: "productos",
      label: "Productos",
      render: (row) => `${row.productos.length} producto(s)`,
    },
    {
      key: "total",
      label: "Total",
      render: (row) => `$${totalRecepcion(row.productos).toLocaleString()}`,
    },
    {
      key: "estado",
      label: "Estado",
      render: (row) => estadoBadge(row.estado),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" onClick={() => { setDetalleItem(row); setDetalleOpen(true); }}>Ver</Button>
          <Button variant="secondary" onClick={() => handleOpen(row)}>Editar</Button>
          {row.estado !== "Confirmada" && (
            <Button onClick={() => handleConfirmar(row.id)}>Confirmar</Button>
          )}
          <Button variant="danger" onClick={() => handleEliminar(row)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div>
      {/* Stats */}
      <div style={{
        background: "linear-gradient(135deg, #1b4332, #2d6a4f)",
        borderRadius: "12px",
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        color: "white",
      }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Recepciones ByteStore</h3>
          <p style={{ fontSize: "13px", opacity: 0.8, margin: "4px 0 0" }}>
            {data.length} recepciones · {confirmadas} confirmadas · {pendientes} pendientes
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "8px", padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "700" }}>{confirmadas}</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Confirmadas</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "8px", padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "700" }}>{pendientes}</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Pendientes</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #d1d5db", borderRadius: "8px", padding: "7px 12px", background: "white", flex: 1, minWidth: "160px" }}>
          <span style={{ color: "#9ca3af" }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por proveedor..."
            style={{ border: "none", outline: "none", fontSize: "13px", color: "#374151", width: "100%", background: "transparent" }}
          />
        </div>
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} style={selectStyle}>
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En proceso">En proceso</option>
          <option value="Confirmada">Confirmada</option>
        </select>
      </div>

      {/* Tabla */}
      <Table columns={columns} data={filtered} />

      <div style={{ marginTop: "12px" }}>
        <span style={{ fontSize: "13px", color: "#40916c" }}>
          Mostrando {filtered.length} de {data.length} recepciones
        </span>
      </div>

      {/* Modal Crear/Editar */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Editar Recepción - ByteStore" : "Nueva Recepción - ByteStore"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Input label="Proveedor" value={form.proveedor} onChange={f("proveedor")} placeholder="Nombre del proveedor" />
          <Input label="Fecha" type="date" value={form.fecha} onChange={f("fecha")} placeholder="" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>CANCELAR</Button>
            <Button onClick={handleSave}>{editItem ? "ACTUALIZAR" : "Crear Recepción"}</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Detalle */}
      <Modal isOpen={detalleOpen} onClose={() => setDetalleOpen(false)} title="Detalle de Recepción">
        {detalleItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ margin: 0, color: "#374151" }}><strong>Proveedor:</strong> {detalleItem.proveedor}</p>
            <p style={{ margin: 0, color: "#374151" }}><strong>Fecha:</strong> {detalleItem.fecha}</p>
            <p style={{ margin: 0, color: "#374151" }}><strong>Estado:</strong> {detalleItem.estado}</p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: "8px" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280" }}>Producto</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280" }}>Cantidad</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280" }}>Precio Unit.</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#6b7280" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalleItem.productos.map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px 12px", color: "#111827" }}>{p.nombre}</td>
                    <td style={{ padding: "8px 12px", color: "#6b7280" }}>{p.cantidad}</td>
                    <td style={{ padding: "8px 12px", color: "#6b7280" }}>${p.precioUnitario}</td>
                    <td style={{ padding: "8px 12px", color: "#111827", fontWeight: 500 }}>${p.cantidad * p.precioUnitario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ margin: 0, color: "#111827", fontWeight: "bold", textAlign: "right" }}>
              Total: ${totalRecepcion(detalleItem.productos).toLocaleString()}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <Button variant="secondary" onClick={() => setDetalleOpen(false)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}