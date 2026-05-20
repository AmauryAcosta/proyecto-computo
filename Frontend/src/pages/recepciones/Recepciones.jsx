import { useState, useEffect } from "react";
import { useToast } from "../../components/ui/Toast";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import {
  getRecepciones,
  createRecepcion,
  updateRecepcion,
  confirmRecepcion,
  deleteRecepcion,
} from "../../api/recepciones";
import { getSuppliers } from "../../api/suppliers";
import { getProducts } from "../../api/products";

// ==========================================
// ESTILOS DE INTERFAZ GENERAL (UI)
// ==========================================
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
    confirmada: { background: "#e8f5e9", color: "#4caf50" },
    borrador: { background: "#e0e7ff", color: "#4338ca" },
    "en proceso": { background: "#fff3e0", color: "#ffb74d" },
    pendiente: { background: "#fff3e0", color: "#ffb74d" },
    cancelada: { background: "#ffebee", color: "#ef5350" },
  };
  const key = estado?.toLowerCase();
  return (
    <span style={{
      ...(styles[key] || { background: "#f3f4f6", color: "#374151" }),
      padding: "6px 14px",
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: "600",
      display: "inline-block",
      textAlign: "center"
    }}>
      {estado}
    </span>
  );
};

const estadoCircle = (label, num, variant, currentFilter, onClick) => {
  const styles = {
    borrador: { border: "#4338ca", bg: "#e0e7ff", text: "#4338ca" },
    proceso: { border: "#ffb74d", bg: "#fff3e0", text: "#f57c00" },
    confirmada: { border: "#4caf50", bg: "#e8f5e9", text: "#388e3c" },
    cancelada: { border: "#ef5350", bg: "#ffebee", text: "#d32f2f" },
  };

  const currentStyle = styles[variant] || { border: "#d1d5db", bg: "white", text: "#374151" };
  const isSelected = currentFilter.toLowerCase() === label.toLowerCase() || (currentFilter === "" && label === "Todos");

  return (
    <div 
      onClick={onClick}
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "6px", 
        cursor: "pointer",
        opacity: currentFilter && !isSelected ? 0.5 : 1,
        transition: "opacity 0.2s"
      }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: "50%",
        background: currentStyle.bg,
        border: `2px solid ${currentStyle.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "11px", fontWeight: "700",
        color: currentStyle.text,
      }}>
        {num}
      </div>
      <span style={{ fontSize: "13px", color: "#4b5563", fontWeight: isSelected ? "600" : "400" }}>{label}</span>
    </div>
  );
};

// ==========================================
// MAQUETA DE DATOS ORIGINAL (ByteStore)
// ==========================================
const datosEjemplo = [
  {
    id: 1,
    folio: "BS-R-0042",
    proveedor: { id: "p1", nombre: "HP Mexico" },
    fecha: "20 abr 2026",
    estado: "Confirmada",
    notas: "No hay notas",
    productos: [
      { id: "pr1", producto: { id: "p_hp1", nombre: "Toner HP 58A", sku: "BS-0001" }, cantidad: 20, precioUnitario: 850 },
      { id: "pr2", producto: { id: "p_hp2", nombre: "Toner HP 58A", sku: "BS-0012" }, cantidad: 25, precioUnitario: 920 },
      { id: "pr3", producto: { id: "p_hp3", nombre: "Toner HP 58A", sku: "BS-0020" }, cantidad: 15, precioUnitario: 180 }
    ],
    historial: [
      { texto: "Recepción creada como borrador", fecha: "20 de abril 2026 - 9:10", user: "juanp", color: "#4338ca" },
      { texto: "Cambiada a \"En proceso\"", fecha: "21 de abril 2026 - 9:10", user: "juanp", color: "#ffb74d" },
      { texto: "Confirmada - stock actualizado automáticamente", fecha: "22 de abril 2026 - 19:10", user: "admin", color: "#4caf50", esUltimo: true }
    ]
  },
  {
    id: 2,
    folio: "BS-R-0043",
    proveedor: { id: "p1", nombre: "HP Mexico" },
    fecha: "20 abr 2026",
    estado: "En proceso",
    notas: "Pendiente de revisar cajas físicas en almacén secundario.",
    productos: [
      { id: "pr4", producto: { id: "p_hp1", nombre: "Toner HP 58A", sku: "BS-0001" }, cantidad: 5, precioUnitario: 850 }
    ],
    historial: [
      { texto: "Recepción creada como borrador", fecha: "20 de abril 2026 - 9:10", user: "juanp", color: "#4338ca" },
      { texto: "Cambiada a \"En proceso\"", fecha: "21 de abril 2026 - 9:10", user: "juanp", color: "#ffb74d", esUltimo: true }
    ]
  },
  {
    id: 3,
    folio: "BS-R-0044",
    proveedor: { id: "p1", nombre: "HP Mexico" },
    fecha: "20 abr 2026",
    estado: "Borrador",
    notas: "Falta confirmar los precios de lista con el agente de ventas.",
    productos: [
      { id: "pr5", producto: { id: "p_hp1", nombre: "Toner HP 58A", sku: "BS-0001" }, cantidad: 30, precioUnitario: 850 }
    ],
    historial: [
      { texto: "Recepción creada como borrador", fecha: "20 de abril 2026 - 9:10", user: "juanp", color: "#4338ca", esUltimo: true }
    ]
  },
  {
    id: 4,
    folio: "BS-R-0045",
    proveedor: { id: "p1", nombre: "HP Mexico" },
    fecha: "20 abr 2026",
    estado: "Cancelada",
    notas: "Pedido duplicado por el sistema de compras automáticas.",
    productos: [
      { id: "pr1", producto: { id: "p_hp1", nombre: "Toner HP 58A", sku: "BS-0001" }, cantidad: 10, precioUnitario: 850 }
    ],
    historial: [
      { texto: "Recepción creada como borrador", fecha: "20 de abril 2026 - 9:10", user: "juanp", color: "#4338ca" },
      { texto: "Cancelada", fecha: "21 de abril 2026 - 11:15", user: "admin", color: "#ef5350", esUltimo: true }
    ]
  }
];

export default function Recepciones() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [confirmarOpen, setConfirmarOpen] = useState(false);
  
  const [editItem, setEditItem] = useState(null);
  const [detalleItem, setDetalleItem] = useState(null);
  const [confirmarItem, setConfirmarItem] = useState(null);
  
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [form, setForm] = useState({
    proveedorId: "",
    fecha: "",
    notas: "",
    estado: "Borrador",
    productos: [{ productoId: "", cantidad: 0, precioUnitario: 0 }],
  });

  const fetchRecepciones = async () => {
    setLoading(true);
    try {
      setData(datosEjemplo);
      setTotal(datosEjemplo.length);
    } catch {
      toast("Error al cargar recepciones", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    setSuppliers([
      { id: "p1", nombre: "HP Mexico" }, { id: "p2", nombre: "Intel Latam" },
      { id: "p3", nombre: "Corsair Mexico" }
    ]);
  };

  const fetchProducts = async () => {
    setProducts([
      { id: "p_hp1", nombre: "Toner HP 58A", sku: "BS-0001" },
      { id: "p_hp2", nombre: "Toner HP 58A", sku: "BS-0012" },
      { id: "p_hp3", nombre: "Toner HP 58A", sku: "BS-0020" }
    ]);
  };

  useEffect(() => { fetchRecepciones(); }, [page]);
  useEffect(() => { fetchSuppliers(); fetchProducts(); }, []);

  const confirmadas = data.filter((r) => r.estado?.toLowerCase() === "confirmada").length;
  const pendientes = data.filter((r) => r.estado?.toLowerCase() === "en proceso" || r.estado?.toLowerCase() === "pendiente").length;

  const filtered = data.filter((r) => {
    const matchSearch = !search || r.proveedor?.nombre?.toLowerCase().includes(search.toLowerCase()) || r.folio?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = !filterEstado || r.estado?.toLowerCase() === filterEstado.toLowerCase();
    return matchSearch && matchEstado;
  });

  const totalRecepcion = (productos = []) =>
    productos.reduce((acc, p) => acc + (p.cantidad * p.precioUnitario), 0);

  const handleOpen = (item = null) => {
    setEditItem(item);
    setForm(item ? {
      proveedorId: item.proveedor?.id || item.proveedorId || "",
      fecha: item.fecha || "",
      notas: item.notas || "",
      estado: item.estado || "Borrador", 
      productos: item.productos && item.productos.length > 0 
        ? item.productos.map(p => ({
            productoId: p.producto?.id || p.productoId || "",
            cantidad: p.cantidad || 0,
            precioUnitario: p.precioUnitario || 0,
          }))
        : [{ productoId: "", cantidad: 0, precioUnitario: 0 }],
    } : {
      proveedorId: "",
      fecha: "",
      notas: "",
      estado: "Borrador",
      productos: [{ productoId: "", cantidad: 0, precioUnitario: 0 }],
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.proveedorId || !form.fecha) {
      toast("Completa los campos requeridos", "error");
      return;
    }
    if (editItem) {
      setData(data.map(d => d.id === editItem.id ? { ...d, ...form, proveedor: suppliers.find(s => s.id === form.proveedorId) } : d));
      toast("Recepción actualizada con éxito", "success");
    } else {
      const nuevo = {
        id: data.length + 1,
        folio: `BS-R-${String(data.length + 1).padStart(4, "0")}`,
        proveedor: suppliers.find(s => s.id === form.proveedorId) || { nombre: "Proveedor Temporal" },
        fecha: form.fecha,
        estado: form.estado,
        notas: form.notas,
        productos: form.productos.map(fp => ({
          ...fp,
          producto: products.find(p => p.id === fp.productoId)
        })),
        historial: [
          { texto: "Recepción creada como borrador", fecha: "Hoy", user: "admin", color: "#4338ca", esUltimo: true }
        ]
      };
      setData([nuevo, ...data]);
      toast("Recepción creada exitosamente", "success");
    }
    setModalOpen(false);
  };

  const handleConfirmar = async () => {
    setData(data.map(d => {
      if (d.id === confirmarItem.id) {
        const historialPrevio = d.historial || [];
        return { 
          ...d, 
          estado: "Confirmada",
          historial: [
            ...historialPrevio.map(h => ({ ...h, esUltimo: false })),
            { texto: "Confirmada - stock actualizado automáticamente", fecha: "Ahora mismo", user: "admin", color: "#4caf50", esUltimo: true }
          ]
        };
      }
      return d;
    }));
    toast("Recepción confirmada — stock actualizado", "success");
    setConfirmarOpen(false);
  };

  const handleEliminar = async (item) => {
    if (!confirm(`¿Eliminar recepción de ${item.proveedor?.nombre}?`)) return;
    setData(data.filter(d => d.id !== item.id));
    toast("Recepción eliminada", "warning");
  };

  const totalPages = Math.ceil(total / limit);

  const renderAcciones = (row) => {
    const estado = row.estado?.toLowerCase();
    if (estado === "confirmada" || estado === "cancelada") {
      return (
        <button onClick={() => { setDetalleItem(row); setDetalleOpen(true); }} style={{ ...selectStyle, padding: "4px 12px" }}>
          Ver detalles
        </button>
      );
    }
    if (estado === "en proceso") {
      return (
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => { setDetalleItem(row); setDetalleOpen(true); }} style={{ ...selectStyle, padding: "4px 12px" }}>Ver</button>
          <button onClick={() => { setConfirmarItem(row); setConfirmarOpen(true); }}
            style={{ padding: "4px 12px", borderRadius: "8px", border: "none", background: "#2d6a4f", color: "white", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            Confirmar
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => handleOpen(row)} style={{ ...selectStyle, padding: "4px 12px" }}>Editar</button>
        <button onClick={() => handleEliminar(row)}
          style={{ padding: "4px 12px", borderRadius: "8px", border: "1px solid #fca5a5", background: "white", color: "#dc2626", cursor: "pointer", fontSize: "13px" }}>
          Eliminar
        </button>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Recepciones</h2>
        <button onClick={() => handleOpen(null)}
          style={{ padding: "10px 16px", borderRadius: "8px", border: "none", background: "#1b4332", color: "white", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}
        >
          + Nueva recepcion
        </button>
      </div>

      {/* KPI Panel */}
      <div style={{ background: "linear-gradient(135deg, #1b4332, #2d6a4f)", borderRadius: "12px", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", color: "white" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Recepciones de mercancia</h3>
          <p style={{ fontSize: "13px", opacity: 0.8, margin: "4px 0 0" }}>
            {total} recepciones totales · {pendientes} pendiente de confirmar
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "8px", padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "700" }}>{confirmadas}</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Confirmadas</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.10)", borderRadius: "8px", padding: "10px 20px", textAlign: "center", border: "1px solid rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: "22px", fontWeight: "700" }}>{pendientes}</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Pendiente</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap", background: "white", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        {estadoCircle("Todos", "•", "default", filterEstado, () => setFilterEstado(""))}
        {estadoCircle("Borrador", 1, "borrador", filterEstado, () => setFilterEstado("Borrador"))}
        {estadoCircle("En proceso", 2, "proceso", filterEstado, () => setFilterEstado("En proceso"))}
        {estadoCircle("Confirmada", 3, "confirmada", filterEstado, () => setFilterEstado("Confirmada"))}
        {estadoCircle("Cancelada", "✕", "cancelada", filterEstado, () => setFilterEstado("Cancelada"))}
      </div>

      {/* Barra Buscar */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #d1d5db", borderRadius: "8px", padding: "7px 12px", background: "white", flex: 1, minWidth: "160px" }}>
          <span style={{ color: "#9ca3af" }}>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por proveedor o folio..." style={{ border: "none", outline: "none", fontSize: "13px", color: "#374151", width: "100%", background: "transparent" }} />
        </div>
      </div>

      {/* Tabla Principal */}
      {loading ? (
        <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}><Spinner /></div>
      ) : (
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                {["Folio", "Proveedor", "Fecha", "Estado", "Artículos", "Acciones"].map(col => (
                  <th key={col} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#40916c", textTransform: "uppercase" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>No se encontraron registros.</td></tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "14px 16px", color: "#374151", fontWeight: 500 }}>{row.folio}</td>
                    <td style={{ padding: "14px 16px", color: "#111827" }}>{row.proveedor?.nombre}</td>
                    <td style={{ padding: "14px 16px", color: "#6b7280" }}>{row.fecha}</td>
                    <td style={{ padding: "14px 16px" }}>{estadoBadge(row.estado)}</td>
                    <td style={{ padding: "14px 16px", color: "#6b7280" }}>{row.productos?.length || 0} artículos</td>
                    <td style={{ padding: "14px 16px" }}>{renderAcciones(row)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DETALLES VISTA DE LECTURA */}
      <Modal isOpen={detalleOpen} onClose={() => setDetalleOpen(false)} title="">
        {detalleItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            
            {/* Encabezado Superior */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" }}>
              <div>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#111827", display: "block" }}>Recepción {detalleItem.folio}</span>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>{detalleItem.proveedor?.nombre} - {detalleItem.estado} el 20 de abril 2026</span>
              </div>
              <div>
                {estadoBadge(detalleItem.estado)}
              </div>
            </div>

            {/* Contenedor con Scroll de Lectura */}
            <div style={{ maxHeight: "58vh", overflowY: "auto", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Información General */}
              <div>
                <h5 style={{ color: "#718096", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", margin: "0 0 8px 0", letterSpacing: "0.05em" }}>INFORMACIÓN GENERAL</h5>
                <hr style={{ border: "0", borderTop: "1px solid #e5e7eb", margin: "0 0 12px 0" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: "13px" }}>
                  <div><span style={{ color: "#a0aec0", fontSize: "11px", display: "block", fontWeight: "600" }}>FOLIO</span><span style={{ color: "#2d3748", fontWeight: "500" }}>{detalleItem.folio}</span></div>
                  <div><span style={{ color: "#a0aec0", fontSize: "11px", display: "block", fontWeight: "600" }}>PROVEEDOR</span><span style={{ color: "#2d3748", fontWeight: "500" }}>{detalleItem.proveedor?.nombre}</span></div>
                  <div><span style={{ color: "#a0aec0", fontSize: "11px", display: "block", fontWeight: "600" }}>FECHA DE CREACIÓN</span><span style={{ color: "#2d3748", fontWeight: "500" }}>18 ABR 2026</span></div>
                  <div>
                    <span style={{ color: "#a0aec0", fontSize: "11px", display: "block", fontWeight: "600" }}>FECHA DE CONFIRMACIÓN</span>
                    <span style={{ color: "#2d3748", fontWeight: "500" }}>
                      {detalleItem.estado?.toLowerCase() === "confirmada" ? "20 ABR 2026" : <span style={{ background: "#fff3e0", color: "#f57c00", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>En proceso</span>}
                    </span>
                  </div>
                  <div><span style={{ color: "#a0aec0", fontSize: "11px", display: "block", fontWeight: "600" }}>CONFIRMADO POR</span><span style={{ color: "#2d3748", fontWeight: "500" }}>{detalleItem.estado?.toLowerCase() === "confirmada" ? "admin" : "—"}</span></div>
                  <div><span style={{ color: "#a0aec0", fontSize: "11px", display: "block", fontWeight: "600" }}>TOTAL DE ARTÍCULOS</span><span style={{ color: "#2d3748", fontWeight: "500" }}>3 productos - 60 unidades</span></div>
                </div>
              </div>

              {/* Información de la Tabla de Productos */}
              <div>
                <h5 style={{ color: "#718096", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", margin: "10px 0 8px 0", letterSpacing: "0.05em" }}>INFORMACIÓN GENERAL</h5>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                  <thead>
                    <tr style={{ background: "#e6f4ea", borderBottom: "1px solid #c8e6c9" }}>
                      {["Producto", "SKU", "Cant.", "Precio", "Subtotal"].map(th => (
                        <th key={th} style={{ padding: "10px 12px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#2d6a4f" }}>{th}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detalleItem.productos?.map((p, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #edf2f7" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "500", color: "#1a202c" }}>{p.producto?.nombre}</td>
                        <td style={{ padding: "10px 12px", color: "#718096" }}>{p.producto?.sku}</td>
                        <td style={{ padding: "10px 12px", color: "#2d3748" }}>{p.cantidad}</td>
                        <td style={{ padding: "10px 12px", color: "#2d3748" }}>${p.precioUnitario}</td>
                        <td style={{ padding: "10px 12px", fontWeight: "600", color: "#1a202c", textAlign: "right" }}>${p.cantidad * p.precioUnitario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ textAlign: "right", marginTop: "10px", fontSize: "14px", fontWeight: "700", color: "#1a202c" }}>
                  Total: <span style={{ fontSize: "15px", color: "#2d6a4f" }}>${totalRecepcion(detalleItem.productos).toLocaleString()}</span>
                </div>
              </div>

              {/* Historial de Estado (Línea de tiempo corregida y protegida con operador opcional) */}
              <div>
                <h5 style={{ color: "#718096", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", margin: "10px 0 12px 0", letterSpacing: "0.05em" }}>HISTORIAL DE ESTADO</h5>
                <hr style={{ border: "0", borderTop: "1px solid #e5e7eb", margin: "0 0 16px 0" }} />
                <div style={{ display: "flex", flexDirection: "column", paddingLeft: "8px" }}>
                  {(detalleItem.historial || []).map((h, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "16px", position: "relative", paddingBottom: "20px" }}>
                      {/* Conector de línea vertical */}
                      {!h.esUltimo && (
                        <div style={{ position: "absolute", left: "11px", top: "24px", bottom: "0", width: "2px", backgroundColor: "#e2e8f0" }}></div>
                      )}
                      {/* Nodo circular */}
                      <div style={{
                        width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "white",
                        border: `2px solid ${h.color || "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", color: h.color || "#cbd5e1", fontWeight: "bold", zIndex: 2
                      }}>
                        ✓
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#2d3748" }}>{h.texto}</span>
                        <span style={{ fontSize: "11px", color: "#a0aec0" }}>{h.fecha} · {h.user}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerta Informativa (Si está En Proceso) */}
              {detalleItem.estado?.toLowerCase() === "en proceso" && (
                <div style={{ display: "flex", gap: "12px", background: "#fffide7", border: "1px solid #fff59d", padding: "12px", borderRadius: "8px", color: "#f57c00", fontSize: "13px", alignItems: "center" }}>
                  <span style={{ fontSize: "16px" }}>ⓘ</span>
                  <div>Esta recepción está en proceso. Una vez que llegue la mercancía, usa el botón "Confirmar" para actualizar el stock automáticamente.</div>
                </div>
              )}

              {/* Notas */}
              <div>
                <h5 style={{ color: "#718096", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", margin: "10px 0 6px 0", letterSpacing: "0.05em" }}>NOTAS</h5>
                <hr style={{ border: "0", borderTop: "1px solid #e5e7eb", margin: "0 0 10px 0" }} />
                <div style={{ background: "#f7fafc", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#4a5568", border: "1px solid #e2e8f0" }}>
                  {detalleItem.notes || detalleItem.notas || "No hay notas"}
                </div>
              </div>

            </div>

            {/* Panel de Botones */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #e5e7eb", paddingTop: "14px" }}>
              <button 
                onClick={() => setDetalleOpen(false)} 
                style={{ border: "1px solid #cbd5e0", borderRadius: "6px", padding: "6px 18px", background: "white", color: "#4a5568", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
              >
                Cerrar
              </button>
              {detalleItem.estado?.toLowerCase() === "en proceso" && (
                <button 
                  onClick={() => { setDetalleOpen(false); setConfirmarItem(detalleItem); setConfirmarOpen(true); }}
                  style={{ padding: "6px 18px", borderRadius: "6px", border: "none", background: "#cbd5e0", color: "#2563eb", cursor: "pointer", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  Ir a confirmar →
                </button>
              )}
            </div>

          </div>
        )}
      </Modal>

      {/* MODAL CREAR / EDITAR */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Editar Recepción" : "Nueva Recepción"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#4b5563" }}>Proveedor *</label>
              <select value={form.proveedorId} onChange={(e) => setForm({ ...form, proveedorId: e.target.value })} style={selectStyle}>
                <option value="">Seleccione un proveedor</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#4b5563" }}>Fecha *</label>
              <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} style={{ ...selectStyle, width: "90%" }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px", borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
            <Button onClick={() => setModalOpen(false)} variant="ghost">Cancelar</Button>
            <Button onClick={handleSave} variant="primary">{editItem ? "Guardar cambios" : "Crear borrador"}</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL CONFIRMACIÓN */}
      <Modal isOpen={confirmarOpen} onClose={() => setConfirmarOpen(false)} title="Confirmar Ingreso de Mercancía">
        <div style={{ padding: "10px" }}>
          <p>¿Estás seguro de que deseas consolidar la recepción <strong>{confirmarItem?.folio}</strong>?</p>
          <p style={{ color: "#b91c1c", fontSize: "12px" }}>Esta acción aumentará el stock de inventario automáticamente y no se podrá revertir.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
            <Button onClick={() => setConfirmarOpen(false)} variant="ghost">Atrás</Button>
            <Button onClick={handleConfirmar} variant="primary">Efectuar Confirmación</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}