import { useState, useEffect } from "react";
import { useToast } from "../../components/ui/Toast";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

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


const datosEjemplo = [
  {
    id: 1,
    folio: "BS-R-0042",
    proveedor: { id: "p1", nombre: "HP Mexico" },
    fecha: "20 abr 2026",
    estado: "Confirmada",
    notes: "No hay notas",
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
      { id: "pr4", producto: { id: "p_hp1", nombre: "Toner HP 58A", sku: "BS-0001" }, cantidad: 5, precioUnitario: 850 },
      { id: "pr5", producto: { id: "p_hp1", nombre: "Toner HP 58A", sku: "BS-0001" }, cantidad: 20, precioUnitario: 850 },
      { id: "pr6", producto: { id: "p_hp1", nombre: "Toner HP 58A", sku: "BS-0001" }, cantidad: 10, precioUnitario: 850 },
      { id: "pr7", producto: { id: "p_hp1", nombre: "Toner HP 58A", sku: "BS-0001" }, cantidad: 15, precioUnitario: 850 }
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
      { id: "pr8", producto: { id: "p_hp1", nombre: "Toner HP 58A", sku: "BS-0001" }, cantidad: 30, precioUnitario: 850 }
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
      { id: "pr9", producto: { id: "p_hp1", nombre: "Toner HP 58A", sku: "BS-0001" }, cantidad: 10, precioUnitario: 850 }
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
  const [confirmNotes, setConfirmNotes] = useState("");

  const [filterEstado, setFilterEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

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
      { id: "p1", nombre: "HP Mexico" },
      { id: "p2", nombre: "Intel Latam" },
      { id: "p3", nombre: "Corsair Mexico" }
    ]);
  };

  const fetchProducts = async () => {
    setProducts([
      { id: "p_hp1", nombre: "Monitor 24 FHD", sku: "BS-0001", precioUnitario: 3200 },
      { id: "p_hp2", nombre: "Laptop Dell XPS 13", sku: "BS-0012", precioUnitario: 22000 },
      { id: "p_hp3", nombre: "Teclado mecánico", sku: "BS-0020", precioUnitario: 1200 },
      { id: "p_hp4", nombre: "Mouse inalámbrico", sku: "BS-0025", precioUnitario: 450 },
      { id: "p_hp5", nombre: "Base refrigerante", sku: "BS-0030", precioUnitario: 780 },
    ]);
  };

  useEffect(() => { fetchRecepciones(); }, [page]);
  useEffect(() => { fetchSuppliers(); fetchProducts(); }, []);

  useEffect(() => {
    const handler = () => handleOpen(null);
    document.addEventListener("openNewRecepcion", handler);
    return () => document.removeEventListener("openNewRecepcion", handler);
  }, []);

  const confirmadas = data.filter((r) => r.estado?.toLowerCase() === "confirmada").length;
  const pendientes = data.filter((r) => r.estado?.toLowerCase() === "en proceso" || r.estado?.toLowerCase() === "pendiente").length;

  const filtered = data.filter((r) => {
    const matchEstado = !filterEstado || r.estado?.toLowerCase() === filterEstado.toLowerCase();
    const matchBusqueda = !busqueda ||
      r.folio?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.proveedor?.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchBusqueda;
  });

  const totalRecepcion = (productos = []) =>
    productos.reduce((acc, p) => acc + (p.cantidad * p.precioUnitario), 0);

  const totalUnidades = (productos = []) =>
    productos.reduce((acc, p) => acc + p.cantidad, 0);

  const formatDate = (fecha = "") => {
    if (!fecha) return "";
    const isoMatch = fecha.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      return `${Number(day)} ${meses[Number(month) - 1]} ${year}`;
    }
    return fecha;
  };

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

  const handleProductoChange = (index, field, value) => {
    setForm((prev) => {
      const productos = prev.productos.map((producto, idx) => {
        if (idx !== index) return producto;
        const updated = { ...producto, [field]: value };
        if (field === "productoId") {
          const selected = products.find((p) => p.id === value);
          updated.precioUnitario = selected?.precioUnitario ?? updated.precioUnitario;
        }
        if (field === "cantidad") {
          updated.cantidad = Number(value);
        }
        if (field === "precioUnitario") {
          updated.precioUnitario = Number(value);
        }
        return updated;
      });
      return { ...prev, productos };
    });
  };

  const agregarProducto = () => {
    setForm((prev) => ({
      ...prev,
      productos: [...prev.productos, { productoId: "", cantidad: 1, precioUnitario: 0 }],
    }));
  };

  const eliminarProducto = (index) => {
    setForm((prev) => ({
      ...prev,
      productos: prev.productos.filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.proveedorId || !form.fecha) {
      toast("Completa los campos requeridos", "error");
      return;
    }

    const productosSeleccionados = form.productos.filter((p) => p.productoId);
    if (productosSeleccionados.length === 0) {
      toast("Agrega al menos un producto", "error");
      return;
    }
    if (productosSeleccionados.some((p) => p.cantidad <= 0)) {
      toast("Asegura cantidades mayores a cero", "error");
      return;
    }
    if (productosSeleccionados.some((p) => p.precioUnitario <= 0)) {
      toast("Asegura un precio válido para cada producto", "error");
      return;
    }

    const productosConDetalles = productosSeleccionados.map((fp) => ({
      ...fp,
      producto: products.find((p) => p.id === fp.productoId) || null,
    }));

    const proveedorSeleccionado = suppliers.find((s) => s.id === form.proveedorId) || { nombre: "Proveedor Temporal" };

    if (editItem) {
      setData(data.map((d) =>
        d.id === editItem.id
          ? {
              ...d,
              ...form,
              proveedor: proveedorSeleccionado,
              productos: productosConDetalles,
            }
          : d
      ));
      toast("Recepción actualizada con éxito", "success");
    } else {
      const nuevo = {
        id: data.length + 1,
        folio: `BS-R-${String(data.length + 1).padStart(4, "0")}`,
        proveedor: proveedorSeleccionado,
        fecha: form.fecha,
        estado: form.estado,
        notas: form.notas,
        productos: productosConDetalles,
        historial: [
          { texto: "Recepción creada como borrador", fecha: "Hoy", user: "admin", color: "#4338ca", esUltimo: true },
        ],
      };
      setData([nuevo, ...data]);
      toast("Recepción creada exitosamente", "success");
    }
    setModalOpen(false);
  };

  const handleEliminar = async (item) => {
    if (!confirm(`¿Eliminar recepción de ${item.proveedor?.nombre}?`)) return;
    setData(data.filter(d => d.id !== item.id));
    toast("Recepción eliminada", "warning");
  };

  const abrirConfirmar = (item) => {
    setConfirmarItem(item);
    setConfirmNotes("");
    setDetalleOpen(false);
    setConfirmarOpen(true);
  };

  const handleConfirmar = async () => {
    setData(data.map(d => {
      if (d.id === confirmarItem.id) {
        const historialPrevio = d.historial || [];
        return {
          ...d,
          estado: "Confirmada",
          notas: confirmNotes || d.notas,
          historial: [
            ...historialPrevio.map(h => ({ ...h, esUltimo: false })),
            { texto: "Confirmada - stock actualizado automáticamente", fecha: "Ahora mismo", user: "admin", color: "#4caf50", esUltimo: true },
          ],
        };
      }
      return d;
    }));
    toast("Recepción confirmada — stock actualizado", "success");
    setConfirmNotes("");
    setConfirmarOpen(false);
  };

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
          <button
            onClick={() => abrirConfirmar(row)}
            style={{ padding: "4px 12px", borderRadius: "8px", border: "none", background: "#2d6a4f", color: "white", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            Confirmar
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => handleOpen(row)} style={{ ...selectStyle, padding: "4px 12px" }}>Editar</button>
        <button
          onClick={() => handleEliminar(row)}
          style={{ padding: "4px 12px", borderRadius: "8px", border: "1px solid #fca5a5", background: "white", color: "#dc2626", cursor: "pointer", fontSize: "13px" }}>
          Eliminar
        </button>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>

      <div style={{ background: "linear-gradient(135deg, #1b4332, #2d6a4f)", borderRadius: "12px", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", color: "white" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Recepciones de mercancía</h3>
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

      
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap", background: "white", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        {estadoCircle("Todos", "•", "default", filterEstado, () => setFilterEstado(""))}
        {estadoCircle("Borrador", 1, "borrador", filterEstado, () => setFilterEstado("Borrador"))}
        {estadoCircle("En proceso", 2, "proceso", filterEstado, () => setFilterEstado("En proceso"))}
        {estadoCircle("Confirmada", 3, "confirmada", filterEstado, () => setFilterEstado("Confirmada"))}
        {estadoCircle("Cancelada", "✕", "cancelada", filterEstado, () => setFilterEstado("Cancelada"))}
      </div>

      
      <div style={{ display: "flex", alignItems: "center", background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px", marginBottom: "20px", gap: "8px" }}>
        <span style={{ color: "#9ca3af" }}>🔍</span>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por proveedor o folio..."
          style={{ border: "none", outline: "none", width: "100%", fontSize: "14px", color: "#4b5563" }}
        />
      </div>

      
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
                    <td style={{ padding: "14px 16px", color: "#6b7280" }}>{formatDate(row.fecha)}</td>
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

      
      <Modal isOpen={detalleOpen} onClose={() => setDetalleOpen(false)} title="">
        {detalleItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" }}>
              <div>
                <span style={{ fontSize: "16px", fontWeight: "700", color: "#111827", display: "block" }}>Recepción {detalleItem.folio}</span>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>{detalleItem.proveedor?.nombre} - {detalleItem.estado} el 20 de abril 2026</span>
              </div>
              <div>{estadoBadge(detalleItem.estado)}</div>
            </div>

            <div style={{ maxHeight: "58vh", overflowY: "auto", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Información general */}
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
                      {detalleItem.estado?.toLowerCase() === "confirmada"
                        ? "20 ABR 2026"
                        : <span style={{ background: "#fff3e0", color: "#f57c00", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>En proceso</span>}
                    </span>
                  </div>
                  <div><span style={{ color: "#a0aec0", fontSize: "11px", display: "block", fontWeight: "600" }}>CONFIRMADO POR</span><span style={{ color: "#2d3748", fontWeight: "500" }}>{detalleItem.estado?.toLowerCase() === "confirmada" ? "admin" : "—"}</span></div>
                  <div><span style={{ color: "#a0aec0", fontSize: "11px", display: "block", fontWeight: "600" }}>TOTAL DE ARTÍCULOS</span><span style={{ color: "#2d3748", fontWeight: "500" }}>{detalleItem.productos?.length} productos</span></div>
                </div>
              </div>

              
              <div>
                <h5 style={{ color: "#718096", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", margin: "10px 0 8px 0", letterSpacing: "0.05em" }}>PRODUCTOS</h5>
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

              
              <div>
                <h5 style={{ color: "#718096", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", margin: "10px 0 12px 0", letterSpacing: "0.05em" }}>HISTORIAL DE ESTADO</h5>
                <hr style={{ border: "0", borderTop: "1px solid #e5e7eb", margin: "0 0 16px 0" }} />
                <div style={{ display: "flex", flexDirection: "column", paddingLeft: "8px" }}>
                  {(detalleItem.historial || []).map((h, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "16px", position: "relative", paddingBottom: "20px" }}>
                      {!h.esUltimo && (
                        <div style={{ position: "absolute", left: "11px", top: "24px", bottom: "0", width: "2px", backgroundColor: "#e2e8f0" }}></div>
                      )}
                      <div style={{
                        width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "white",
                        border: `2px solid ${h.color || "#cbd5e1"}`, display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", color: h.color || "#cbd5e1", fontWeight: "bold", zIndex: 2
                      }}>✓</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#2d3748" }}>{h.texto}</span>
                        <span style={{ fontSize: "11px", color: "#a0aec0" }}>{h.fecha} · {h.user}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              
              <div>
                <h5 style={{ color: "#718096", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", margin: "10px 0 6px 0", letterSpacing: "0.05em" }}>NOTAS</h5>
                <hr style={{ border: "0", borderTop: "1px solid #e5e7eb", margin: "0 0 10px 0" }} />
                <div style={{ background: "#f7fafc", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#4a5568", border: "1px solid #e2e8f0" }}>
                  {detalleItem.notes || detalleItem.notas || "No hay notas"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #e5e7eb", paddingTop: "14px" }}>
              <button onClick={() => setDetalleOpen(false)} style={{ border: "1px solid #cbd5e0", borderRadius: "6px", padding: "6px 18px", background: "white", color: "#4a5568", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>Cerrar</button>
              {detalleItem.estado?.toLowerCase() === "en proceso" && (
                <button
                  onClick={() => abrirConfirmar(detalleItem)}
                  style={{ border: "none", padding: "6px 18px", borderRadius: "6px", background: "#e8f5e9", color: "#2e7d32", cursor: "pointer", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                  Ir a confirmar →
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Editar recepción" : "Nueva recepcion"}
        subtitle="Se creará como borrador — podrás editarla antes de confirmar."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "22px", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div>
                <span style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#4b5563" }}>Información general</span>
              </div>
            </div>
            <hr style={{ border: 0, borderTop: "1px solid #e5e7eb", margin: "0 0 18px 0" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Proveedor *</label>
                <select value={form.proveedorId} onChange={(e) => setForm({ ...form, proveedorId: e.target.value })} style={selectStyle}>
                  <option value="">Seleccione un proveedor</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Fecha estimada de llegada *</label>
                <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} style={{ ...selectStyle, width: "100%" }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "18px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Notas del pedido (opcional)</label>
              <textarea
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                placeholder="Ej. entregar en bodega principal"
                style={{ width: "100%", minHeight: "86px", borderRadius: "12px", border: "1px solid #d1d5db", padding: "12px", fontSize: "14px", color: "#334155", resize: "vertical", background: "white" }}
              />
            </div>
          </div>

          <div style={{ background: "#f3faf7", border: "1px solid #c7f3d9", borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
              <div>
                <span style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "#166534", letterSpacing: "0.08em", textTransform: "uppercase" }}>Productos a recibir</span>
              </div>
              <button
                type="button"
                onClick={agregarProducto}
                style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #bbf7d0", background: "#ecfdf5", color: "#166534", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}
              >
                + Agregar producto
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "12px", padding: "12px 0", borderBottom: "1px solid #d1fae5", marginBottom: "12px", color: "#125e3c", fontSize: "12px", fontWeight: 700 }}>
              <div>Producto</div>
              <div>Cantidad *</div>
              <div>Precio U.</div>
              <div />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {form.productos.map((producto, index) => (
                <div key={index} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "12px", alignItems: "end" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <select
                      value={producto.productoId}
                      onChange={(e) => handleProductoChange(index, "productoId", e.target.value)}
                      style={{ ...selectStyle, width: "100%" }}
                    >
                      <option value="">Seleccionar un producto...</option>
                      {products.map((p) => (
                          <option key={p.id} value={p.id}>{`${p.nombre} — ${p.sku}`}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <input
                      type="number"
                      value={producto.cantidad}
                      onChange={(e) => handleProductoChange(index, "cantidad", e.target.value)}
                      min="1"
                      style={{ ...selectStyle, width: "100%", textAlign: "center" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <input
                      type="number"
                      value={producto.precioUnitario}
                      onChange={(e) => handleProductoChange(index, "precioUnitario", e.target.value)}
                      min="0"
                      style={{ ...selectStyle, width: "100%", textAlign: "center" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => eliminarProducto(index)}
                    style={{ width: "44px", height: "34px", borderRadius: "10px", border: "1px solid #f8c0c0", background: "#fff1f2", color: "#b91c1c", cursor: "pointer", fontSize: "18px", lineHeight: 1, padding: 0 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "16px", padding: "14px 16px", background: "#ecfdf5", borderRadius: "12px", border: "1px solid #d1fae5", color: "#166534", fontSize: "13px" }}>
              ¿Qué pasa después? La recepción se guarda como borrador.
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "8px", borderTop: "1px solid #e5e7eb" }}>
            <Button onClick={() => setModalOpen(false)} variant="secondary">Cancelar</Button>
            <Button type="button" onClick={handleSave} variant="success">
              {editItem ? "Guardar cambios" : "Crear recepción"}
            </Button>
          </div>
        </div>
      </Modal>

      
      <Modal isOpen={confirmarOpen} onClose={() => setConfirmarOpen(false)} title="">
        {confirmarItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "system-ui, sans-serif" }}>
            {/* Header */}
            <div style={{ paddingBottom: "10px", borderBottom: "1px solid #e5e7eb" }}>
              <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#111827" }}>Recepcion {confirmarItem.folio}</h4>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>{confirmarItem.folio} - {confirmarItem.proveedor?.nombre}</span>
            </div>

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <div style={{ background: "#e0f2fe", padding: "14px", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ display: "block", fontSize: "20px", fontWeight: "700", color: "#0369a1" }}>{confirmarItem.productos?.length || 0}</span>
                <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "500" }}>Productos</span>
              </div>
              <div style={{ background: "#e0f2fe", padding: "14px", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ display: "block", fontSize: "20px", fontWeight: "700", color: "#0369a1" }}>{totalUnidades(confirmarItem.productos)}</span>
                <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "500" }}>Unidades Totales</span>
              </div>
              <div style={{ background: "#e0f2fe", padding: "14px", borderRadius: "8px", textAlign: "center" }}>
                <span style={{ display: "block", fontSize: "20px", fontWeight: "700", color: "#15803d" }}>${totalRecepcion(confirmarItem.productos).toLocaleString()}</span>
                <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "500" }}>Valor Total</span>
              </div>
            </div>

            {/* Info box */}
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "14px", display: "flex", gap: "10px", alignItems: "start" }}>
              <div style={{ background: "#dcfce7", color: "#16a34a", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "12px", flexShrink: 0 }}>✓</div>
              <div style={{ fontSize: "12px", color: "#166534", lineHeight: "1.5" }}>
                <strong style={{ display: "block", marginBottom: "4px", color: "#14532d" }}>Al confirmar sucede esto automáticamente:</strong>
                <div>✓ El stock de cada producto aumenta con las cantidades de esta recepción</div>
                <div>✓ Se registra en el módulo de Auditoría</div>
                <div>✓ La recepción cambia a estado <strong>Confirmada</strong> y no se puede editar</div>
                <div>✓ Se registra quién confirmó y a qué hora</div>
              </div>
            </div>

            
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Verificar cantidades recibidas</span>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", maxHeight: "160px", overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ background: "#e6f4ea", borderBottom: "1px solid #d1fae5", position: "sticky", top: 0 }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", color: "#065f46" }}>Producto</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", color: "#065f46" }}>Precio</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", color: "#065f46" }}>Recibido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmarItem.productos?.map((p, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "8px 12px", fontWeight: "600", color: "#1f2937" }}>{p.producto?.nombre || "Sin nombre"}</td>
                        <td style={{ padding: "8px 12px", color: "#4b5563" }}>${p.precioUnitario}</td>
                        <td style={{ padding: "8px 12px", color: "#1f2937", fontWeight: "600" }}>{p.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#4b5563", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Notas de confirmación (Opcional)</span>
              <textarea
                value={confirmNotes}
                onChange={(e) => setConfirmNotes(e.target.value)}
                placeholder="No hay notas"
                style={{ width: "95%", height: "45px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#f0fdf4", padding: "10px", fontSize: "12px", color: "#374151", resize: "none" }}
              />
            </div>

            {/* Acciones */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
              <button onClick={() => setConfirmarOpen(false)} style={{ border: "1px solid #cbd5e1", borderRadius: "6px", padding: "6px 16px", background: "white", color: "#334155", cursor: "pointer", fontSize: "13px" }}>Cancelar</button>
              <button
                onClick={handleConfirmar}
                style={{ border: "1px solid #bbf7d0", borderRadius: "6px", padding: "6px 16px", background: "#dcfce7", color: "#15803d", cursor: "pointer", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                Confirmar ingreso →
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}