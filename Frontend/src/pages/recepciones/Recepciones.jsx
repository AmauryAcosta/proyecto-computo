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
// ESTILOS DE INTERFAZ (UI)
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
    confirmada: { background: "#dcfce7", color: "#15803d" },
    borrador: { background: "#e0e7ff", color: "#4338ca" },
    "en proceso": { background: "#fef9c3", color: "#a16207" },
    pendiente: { background: "#fef9c3", color: "#a16207" },
    cancelada: { background: "#fee2e2", color: "#dc2626" },
  };
  const key = estado?.toLowerCase();
  return (
    <span style={{
      ...(styles[key] || { background: "#f3f4f6", color: "#374151" }),
      padding: "2px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600",
    }}>
      {estado}
    </span>
  );
};

const estadoCircle = (label, num, variant, currentFilter, onClick) => {
  const styles = {
    borrador: { border: "#4338ca", bg: "#e0e7ff", text: "#4338ca" },
    proceso: { border: "#a16207", bg: "#fef9c3", text: "#a16207" },
    confirmada: { border: "#15803d", bg: "#dcfce7", text: "#15803d" },
    cancelada: { border: "#dc2626", bg: "#fee2e2", text: "#dc2626" },
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
// SECCIÓN DE DATOS DE PRUEBA (10 EJEMPLOS)
// ==========================================
const datosEjemplo = [
  {
    id: 1,
    folio: "BS-R-0042",
    proveedor: { id: "p1", nombre: "HP Mexico" },
    fecha: "2026-04-20",
    estado: "Confirmada",
    notas: "No hay notas",
    productos: [
      { id: "pr1", producto: { id: "p_hp1", nombre: "Toner HP 58A", sku: "BS-0001" }, cantidad: 20, precioUnitario: 850 },
      { id: "pr2", producto: { id: "p_hp2", nombre: "Toner HP 58A", sku: "BS-0012" }, cantidad: 25, precioUnitario: 920 },
      { id: "pr3", producto: { id: "p_hp3", nombre: "Toner HP 58A", sku: "BS-0020" }, cantidad: 15, precioUnitario: 180 }
    ]
  },
  {
    id: 2,
    folio: "BS-R-0043",
    proveedor: { id: "p2", nombre: "Intel Latam" },
    fecha: "2026-04-21",
    estado: "En proceso",
    notas: "Pendiente de revisar cajas físicas en almacén secundario.",
    productos: [
      { id: "pr4", producto: { id: "p_int1", nombre: "Procesador i7 13700K", sku: "BS-2291" }, cantidad: 5, precioUnitario: 6400 }
    ]
  },
  {
    id: 3,
    folio: "BS-R-0044",
    proveedor: { id: "p3", nombre: "Corsair Mexico" },
    fecha: "2026-04-22",
    estado: "Borrador",
    notas: "Falta confirmar los precios de lista con el agente de ventas.",
    productos: [
      { id: "pr5", producto: { id: "p_cor1", nombre: "Memoria RAM 16GB DDR5", sku: "BS-8831" }, cantidad: 30, precioUnitario: 1150 },
      { id: "pr6", producto: { id: "p_cor2", nombre: "Gabinete ATX 4000D", sku: "BS-4402" }, cantidad: 10, precioUnitario: 1550 }
    ]
  },
  {
    id: 4,
    folio: "BS-R-0045",
    proveedor: { id: "p1", nombre: "HP Mexico" },
    fecha: "2026-04-23",
    estado: "Cancelada",
    notas: "Pedido duplicado por el sistema de compras automáticas.",
    productos: [
      { id: "pr1", producto: { id: "p_hp1", nombre: "Toner HP 58A", sku: "BS-0001" }, cantidad: 10, precioUnitario: 850 }
    ]
  },
  {
    id: 5,
    folio: "BS-R-0046",
    proveedor: { id: "p4", nombre: "Asus TeK" },
    fecha: "2026-04-24",
    estado: "Confirmada",
    notes: "Paquetes recibidos en tarimas selladas sin daños.",
    productos: [
      { id: "pr7", producto: { id: "p_asu1", nombre: "Tarjeta Madre B650-Plus", sku: "BS-0992" }, cantidad: 12, precioUnitario: 3200 },
      { id: "pr8", producto: { id: "p_asu2", nombre: "Monitor Gamer 24\" 165Hz", sku: "BS-5541" }, cantidad: 8, precioUnitario: 2900 }
    ]
  },
  {
    id: 6,
    folio: "BS-R-0047",
    proveedor: { id: "p5", nombre: "Kingston Technology" },
    fecha: "2026-04-25",
    estado: "Borrador",
    notas: "Falta firma de recepción logística.",
    productos: [
      { id: "pr9", producto: { id: "p_kin1", nombre: "SSD NVMe 1TB NV2", sku: "BS-7711" }, cantidad: 50, precioUnitario: 980 }
    ]
  },
  {
    id: 7,
    folio: "BS-R-0048",
    proveedor: { id: "p2", nombre: "Intel Latam" },
    fecha: "2026-04-25",
    estado: "En proceso",
    notas: "Validando números de serie con aduana.",
    productos: [
      { id: "pr10", producto: { id: "p_int2", nombre: "Procesador i5 12400F", sku: "BS-2210" }, cantidad: 25, precioUnitario: 2450 }
    ]
  },
  {
    id: 8,
    folio: "BS-R-0049",
    proveedor: { id: "p6", nombre: "Logitech Mexico" },
    fecha: "2026-04-26",
    estado: "Confirmada",
    notas: "Entrega express en sucursal norte.",
    productos: [
      { id: "pr11", producto: { id: "p_log1", nombre: "Mouse G203 LightSync", sku: "BS-1102" }, cantidad: 40, precioUnitario: 350 },
      { id: "pr12", producto: { id: "p_log2", nombre: "Teclado Mecánico G413", sku: "BS-1145" }, cantidad: 15, precioUnitario: 1200 }
    ]
  },
  {
    id: 9,
    folio: "BS-R-0050",
    proveedor: { id: "p3", nombre: "Corsair Mexico" },
    fecha: "2026-04-27",
    estado: "Cancelada",
    notas: "Proveedor se quedó sin existencias del producto principal.",
    productos: [
      { id: "pr13", producto: { id: "p_cor1", nombre: "Memoria RAM 16GB DDR5", sku: "BS-8831" }, cantidad: 20, precioUnitario: 1150 }
    ]
  },
  {
    id: 10,
    folio: "BS-R-0051",
    proveedor: { id: "p4", nombre: "Asus TeK" },
    fecha: "2026-04-28",
    estado: "Borrador",
    notas: "Revisar si aplica descuento por volumen.",
    productos: [
      { id: "pr14", producto: { id: "p_asu1", nombre: "Tarjeta Madre B650-Plus", sku: "BS-0992" }, cantidad: 6, precioUnitario: 3200 }
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
      { id: "p3", nombre: "Corsair Mexico" }, { id: "p4", nombre: "Asus TeK" },
      { id: "p5", nombre: "Kingston Technology" }, { id: "p6", nombre: "Logitech Mexico" }
    ]);
  };

  const fetchProducts = async () => {
    setProducts([
      { id: "p_hp1", nombre: "Toner HP 58A", sku: "BS-0001" },
      { id: "p_hp2", nombre: "Toner HP 58A", sku: "BS-0012" },
      { id: "p_hp3", nombre: "Toner HP 58A", sku: "BS-0020" },
      { id: "p_int1", nombre: "Procesador i7 13700K", sku: "BS-2291" },
      { id: "p_int2", nombre: "Procesador i5 12400F", sku: "BS-2210" },
      { id: "p_cor1", nombre: "Memoria RAM 16GB DDR5", sku: "BS-8831" },
      { id: "p_cor2", font: "Toner HP 58A", nombre: "Gabinete ATX 4000D", sku: "BS-4402" },
      { id: "p_asu1", font: "Toner HP 58A", nombre: "Tarjeta Madre B650-Plus", sku: "BS-0992" }
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
      fecha: item.fecha ? item.fecha.split("T")[0] : "",
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

  const addProducto = () => {
    setForm({ ...form, productos: [...form.productos, { productoId: "", cantidad: 0, precioUnitario: 0 }] });
  };

  const removeProducto = (i) => {
    setForm({ ...form, productos: form.productos.filter((_, idx) => idx !== i) });
  };

  const updateProducto = (i, field, value) => {
    const updated = form.productos.map((p, idx) => idx === i ? { ...p, [field]: value } : p);
    setForm({ ...form, productos: updated });
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
        }))
      };
      setData([nuevo, ...data]);
      toast("Recepción creada exitosamente", "success");
    }
    setModalOpen(false);
  };

  const handleConfirmar = async () => {
    setData(data.map(d => d.id === confirmarItem.id ? { ...d, estado: "Confirmada" } : d));
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
          <button onClick={() => handleOpen(row)} style={{ ...selectStyle, padding: "4px 12px" }}>Editar</button>
          <button onClick={() => { setConfirmarItem(row); setConfirmarOpen(true); }}
            style={{ padding: "4px 12px", borderRadius: "8px", border: "none", background: "#1b4332", color: "white", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
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
    <div style={{ padding: "20px", fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: "#f9fafb", minHeight: "100vh" }}>
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

      {/* Filtros por Burbujas de Pasos */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap", background: "white", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        {estadoCircle("Todos", "•", "default", filterEstado, () => setFilterEstado(""))}
        {estadoCircle("Borrador", 1, "borrador", filterEstado, () => setFilterEstado("Borrador"))}
        {estadoCircle("En proceso", 2, "proceso", filterEstado, () => setFilterEstado("En proceso"))}
        {estadoCircle("Confirmada", 3, "confirmada", filterEstado, () => setFilterEstado("Confirmada"))}
        {estadoCircle("Cancelada", "✕", "cancelada", filterEstado, () => setFilterEstado("Cancelada"))}
      </div>

      {/* Barra de Controles Inferior */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #d1d5db", borderRadius: "8px", padding: "7px 12px", background: "white", flex: 1, minWidth: "160px" }}>
          <span style={{ color: "#9ca3af" }}>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por proveedor o folio..." style={{ border: "none", outline: "none", fontSize: "13px", color: "#374151", width: "100%", background: "transparent" }} />
        </div>
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} style={selectStyle}>
          <option value="">Todos los estados</option>
          <option value="Borrador">Borrador</option>
          <option value="En proceso">En proceso</option>
          <option value="Confirmada">Confirmada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
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
                  <th key={col} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#40916c", textTransform: "uppercase", letterSpacing: "0.05em" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>No se encontraron registros.</td></tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #f3f4f6" }} onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"} onMouseLeave={e => e.currentTarget.style.background = "white"}>
                    <td style={{ padding: "14px 16px", color: "#374151", fontWeight: 500 }}>{row.folio}</td>
                    <td style={{ padding: "14px 16px", color: "#111827" }}>{row.proveedor?.nombre}</td>
                    <td style={{ padding: "14px 16px", color: "#6b7280" }}>{row.fecha}</td>
                    <td style={{ padding: "14px 16px" }}>{estadoBadge(row.estado)}</td>
                    <td style={{ padding: "14px 16px", color: "#6b7280" }}>{row.productos?.length || 0} artículo(s)</td>
                    <td style={{ padding: "14px 16px" }}>{renderAcciones(row)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Footer de Paginación */}
          <div style={{ padding: "12px 16px", background: "#f0fdf4", borderTop: "1px solid #d1fae5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#059669", fontSize: 13 }}>
              Mostrando {filtered.length} de {total} registros evaluados
            </span>
            <div style={{ display: "flex", gap: "4px" }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ ...selectStyle, padding: "4px 10px" }}>‹</button>
              {Array.from({ length: totalPages || 1 }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} style={{ ...selectStyle, padding: "4px 10px", background: page === i + 1 ? "#1b4332" : "white", color: page === i + 1 ? "white" : "#374151" }}>{i + 1}</button>
              ))}
              <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} style={{ ...selectStyle, padding: "4px 10px" }}>›</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REACTIVO DE FORMULARIO DE EDICIÓN Y CREACIÓN */}
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

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#4b5563" }}>Notas</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notas: e.target.value })} style={{ ...selectStyle, minHeight: "60px", resize: "vertical" }} placeholder="Observaciones de la recepción..." />
          </div>

          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>Artículos añadidos</span>
              <Button onClick={addProducto} variant="secondary" size="sm">+ Agregar artículo</Button>
            </div>
            {form.productos.map((itemProd, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                <select value={itemProd.productoId} onChange={(e) => updateProducto(idx, "productoId", e.target.value)} style={selectStyle}>
                  <option value="">Seleccione Producto</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.sku})</option>)}
                </select>
                <input type="number" placeholder="Cant." value={itemProd.cantidad || ""} onChange={(e) => updateProducto(idx, "cantidad", parseInt(e.target.value) || 0)} style={{ ...selectStyle, width: "60px" }} />
                <input type="number" placeholder="Precio U." value={itemProd.precioUnitario || ""} onChange={(e) => updateProducto(idx, "precioUnitario", parseFloat(e.target.value) || 0)} style={{ ...selectStyle, width: "80px" }} />
                <button onClick={() => removeProducto(idx)} style={{ background: "transparent", border: "none", color: "#dc2626", fontSize: "16px", cursor: "pointer" }}>✕</button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px", borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
            <Button onClick={() => setModalOpen(false)} variant="ghost">Cancelar</Button>
            <Button onClick={handleSave} variant="primary">{editItem ? "Guardar cambios" : "Crear borrador"}</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL DETALLES VISTA DE LECTURA (CORREGIDO CON SCROLL INTERNO PARA EVITAR CORTES VERTICALES) */}
      <Modal isOpen={detalleOpen} onClose={() => setDetalleOpen(false)} title={`Recepcion: ${detalleItem?.folio || ""}`}>
        {detalleItem && (
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            
            {/* Encabezado del Estado (Fijo arriba) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", background: "#f9fafb", padding: "10px", borderRadius: "8px" }}>
              <div>
                <span style={{ fontSize: "15px", fontWeight: "700" }}>Recepcion {detalleItem.folio}</span>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>{detalleItem.proveedor?.nombre} - {detalleItem.estado} el 20 de abril 2026</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {estadoBadge(detalleItem.estado)}
              </div>
            </div>

            {/* CONTENEDOR CON SCROLL FLUIDO: Evita que el modal se desborde infinitamente hacia abajo */}
            <div style={{ 
              maxHeight: "60vh", 
              overflowY: "auto", 
              paddingRight: "8px",
              paddingBottom: "10px" 
            }}>
              <h5 style={{ color: "#4b5563", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", margin: "10px 0" }}>Informacion General</h5>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "15px", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}>
                <div><strong>FOLIO:</strong> <br/> <span style={{color:"#111827"}}>{detalleItem.folio}</span></div>
                <div><strong>PROVEEDOR:</strong> <br/> <span style={{color:"#111827"}}>{detalleItem.proveedor?.nombre}</span></div>
                <div><strong>FECHA DE CREACION:</strong> <br/> <span style={{color:"#111827"}}>18 ABR 2026</span></div>
                <div><strong>FECHA DE CONFIRMACION:</strong> <br/> <span style={{color:"#111827"}}>20 ABR 2026</span></div>
                <div><strong>CONFIRMADO POR:</strong> <br/> <span style={{color:"#111827"}}>admin</span></div>
                <div><strong>TOTAL DE ARTICULOS:</strong> <br/> <span style={{color:"#111827"}}>{detalleItem.productos?.length} productos - {detalleItem.productos?.reduce((a,b)=>a+b.cantidad, 0)} unidades</span></div>
              </div>

              {/* Desglose de Productos */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#e8f5e9", color: "#2e7d32", textAlign: "left" }}>
                    <th style={{ padding: "6px" }}>Producto</th>
                    <th style={{ padding: "6px" }}>SKU</th>
                    <th style={{ padding: "6px" }}>Cant.</th>
                    <th style={{ padding: "6px" }}>Precio</th>
                    <th style={{ padding: "6px" }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleItem.productos?.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "6px", fontWeight: "600" }}>{p.producto?.nombre || "Toner HP 58A"}</td>
                      <td style={{ padding: "6px", color: "#6b7280" }}>{p.producto?.sku || "BS-0001"}</td>
                      <td style={{ padding: "6px" }}>{p.cantidad}</td>
                      <td style={{ padding: "6px" }}>${p.precioUnitario}</td>
                      <td style={{ padding: "6px", fontWeight: "600" }}>${p.cantidad * p.precioUnitario}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ textAlign: "right", fontWeight: "700", fontSize: "14px", margin: "5px 0" }}>Total: ${totalRecepcion(detalleItem.productos)}</p>

              {/* Historial de Estado */}
              <h5 style={{ color: "#4b5563", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", margin: "15px 0 5px" }}>Historial de Estado</h5>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#fff", padding: "8px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "11px" }}>
                  <span style={{ color: "#4338ca" }}>✓</span> 
                  <div><strong>Recepcion creada como borrador</strong> <br/> <span style={{color: "#9ca3af"}}>20 de abril 2026 - 9:10 - juanp</span></div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "11px" }}>
                  <span style={{ color: "#a16207" }}>✓</span> 
                  <div><strong>Cambiada a "En proceso"</strong> <br/> <span style={{color: "#9ca3af"}}>21 de abril 2026 - 9:10 - juanp</span></div>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "11px" }}>
                  <span style={{ color: "#15803d" }}>✓</span> 
                  <div><strong>Confirmada - stock actualizado automaticamente</strong> <br/> <span style={{color: "#9ca3af"}}>22 de abril 2026 - 19:10 - admin</span></div>
                </div>
              </div>

              <h5 style={{ color: "#4b5563", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", margin: "15px 0 5px" }}>Notas</h5>
              <div style={{ background: "#f9fafb", padding: "10px", borderRadius: "8px", fontSize: "12px", color: "#4b5563", border: "1px solid #e5e7eb" }}>
                {detalleItem.notas || "No hay notas"}
              </div>
            </div>

            {/* Botón inferior de Cierre (Fijo abajo, siempre accesible) */}
            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e5e7eb", paddingTop: "12px", marginTop: "10px" }}>
              <button 
                onClick={() => setDetalleOpen(false)} 
                style={{ 
                  border: "1px solid #d1d5db", 
                  borderRadius: "6px", 
                  padding: "6px 16px", 
                  background: "white", 
                  cursor: "pointer", 
                  fontWeight: "600",
                  fontSize: "13px",
                  color: "#374151"
                }}
              >
                Cerrar
              </button>
            </div>

          </div>
        )}
      </Modal>

      {/* MODAL CONFIRMACIÓN SIMPLE */}
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