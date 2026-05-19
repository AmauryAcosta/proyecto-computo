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
    pendiente: { background: "#fef9c3", color: "#a16207" },
    borrador: { background: "#e0e7ff", color: "#4338ca" },
    "en proceso": { background: "#dbeafe", color: "#1d4ed8" },
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

const estadoCircle = (label, num, color) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <div style={{
      width: 24, height: 24, borderRadius: "50%",
      background: color === "x" ? "#fee2e2" : "white",
      border: `2px solid ${color === "x" ? "#dc2626" : "#d1d5db"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "11px", fontWeight: "700",
      color: color === "x" ? "#dc2626" : "#374151",
    }}>
      {color === "x" ? "✕" : num}
    </div>
    <span style={{ fontSize: "13px", color: "#374151" }}>{label}</span>
  </div>
);

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
    productos: [{ productoId: "", cantidad: 0, precioUnitario: 0 }],
  });

  const fetchRecepciones = async () => {
    setLoading(true);
    try {
      const res = await getRecepciones(page, limit);
      setData(res.items || []);
      setTotal(res.total || 0);
    } catch {
      toast("Error al cargar recepciones", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await getSuppliers(1, 100);
      setSuppliers(res.items || []);
    } catch {}
  };

  const fetchProducts = async () => {
    try {
      const res = await getProducts(1, 100);
      setProducts(res.items || []);
    } catch {}
  };

  useEffect(() => { fetchRecepciones(); }, [page]);
  useEffect(() => { fetchSuppliers(); fetchProducts(); }, []);

  const confirmadas = data.filter((r) => r.estado?.toLowerCase() === "confirmada").length;
  const pendientes = data.filter((r) => r.estado?.toLowerCase() === "pendiente").length;

  const filtered = data.filter((r) => {
    const matchSearch = !search || r.proveedor?.nombre?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = !filterEstado || r.estado?.toLowerCase() === filterEstado.toLowerCase();
    return matchSearch && matchEstado;
  });

  const totalRecepcion = (productos = []) =>
    productos.reduce((acc, p) => acc + (p.cantidad * p.precioUnitario), 0);

  const handleOpen = (item = null) => {
    setEditItem(item);
    setForm(item ? {
      proveedorId: item.proveedorId || item.proveedor?.id || "",
      fecha: item.fecha?.split("T")[0] || "",
      notas: item.notas || "",
      productos: item.productos?.length > 0 ? item.productos.map(p => ({
        productoId: p.productoId || p.producto?.id || "",
        cantidad: p.cantidad,
        precioUnitario: p.precioUnitario,
      })) : [{ productoId: "", cantidad: 0, precioUnitario: 0 }],
    } : {
      proveedorId: "",
      fecha: "",
      notas: "",
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
    if (form.productos.some(p => !p.productoId || p.cantidad <= 0)) {
      toast("Agrega al menos 1 producto válido", "error");
      return;
    }
    try {
      if (editItem) {
        await updateRecepcion(editItem.id, form);
        toast("Recepción actualizada", "success");
      } else {
        await createRecepcion(form);
        toast("Recepción creada como borrador", "success");
      }
      setModalOpen(false);
      fetchRecepciones();
    } catch (err) {
      toast(err.response?.data?.message || "Error al guardar", "error");
    }
  };

  const handleConfirmar = async () => {
    try {
      await confirmRecepcion(confirmarItem.id);
      toast("Recepción confirmada — stock actualizado", "success");
      setConfirmarOpen(false);
      fetchRecepciones();
    } catch {
      toast("Error al confirmar", "error");
    }
  };

  const handleEliminar = async (item) => {
    if (!confirm(`¿Eliminar recepción de ${item.proveedor?.nombre || "este proveedor"}?`)) return;
    try {
      await deleteRecepcion(item.id);
      toast("Recepción eliminada", "warning");
      fetchRecepciones();
    } catch {
      toast("Error al eliminar", "error");
    }
  };

  const totalPages = Math.ceil(total / limit);

  const renderAcciones = (row) => {
    const estado = row.estado?.toLowerCase();
    if (estado === "confirmada" || estado === "cancelada") {
      return (
        <button onClick={() => { setDetalleItem(row); setDetalleOpen(true); }}
          style={{ ...selectStyle, padding: "4px 12px" }}>
          Ver detalles
        </button>
      );
    }
    if (estado === "en proceso") {
      return (
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => { setDetalleItem(row); setDetalleOpen(true); }}
            style={{ ...selectStyle, padding: "4px 12px" }}>Ver</button>
          <button onClick={() => { setConfirmarItem(row); setConfirmarOpen(true); }}
            style={{ padding: "4px 12px", borderRadius: "8px", border: "none", background: "#1b4332", color: "white", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
            Confirmar
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => handleOpen(row)}
          style={{ ...selectStyle, padding: "4px 12px" }}>Editar</button>
        <button onClick={() => handleEliminar(row)}
          style={{ padding: "4px 12px", borderRadius: "8px", border: "1px solid #fca5a5", background: "white", color: "#dc2626", cursor: "pointer", fontSize: "13px" }}>
          Eliminar
        </button>
      </div>
    );
  };

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

      {/* Estado circles */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
        {estadoCircle("Borrador", 1, "gray")}
        {estadoCircle("En proceso", 2, "gray")}
        {estadoCircle("Confirmada", 3, "gray")}
        {estadoCircle("Cancelada", "x", "x")}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #d1d5db", borderRadius: "8px", padding: "7px 12px", background: "white", flex: 1, minWidth: "160px" }}>
          <span style={{ color: "#9ca3af" }}>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por proveedor..."
            style={{ border: "none", outline: "none", fontSize: "13px", color: "#374151", width: "100%", background: "transparent" }} />
        </div>
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} style={selectStyle}>
          <option value="">Todos los estados</option>
          <option value="Borrador">Borrador</option>
          <option value="En proceso">En proceso</option>
          <option value="Confirmada">Confirmada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}><Spinner /></div>
      ) : (
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                {["Folio", "Proveedor", "Fecha", "Estado", "Artículos", "Acciones"].map(col => (
                  <th key={col} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#40916c", textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
                  <td style={{ padding: "14px 16px", color: "#374151", fontWeight: 500 }}>{row.folio || `BS-R-${String(row.id).padStart(4, "0")}`}</td>
                  <td style={{ padding: "14px 16px", color: "#111827" }}>{row.proveedor?.nombre || row.proveedorId}</td>
                  <td style={{ padding: "14px 16px", color: "#6b7280" }}>{row.fecha ? new Date(row.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                  <td style={{ padding: "14px 16px" }}>{estadoBadge(row.estado)}</td>
                  <td style={{ padding: "14px 16px", color: "#6b7280" }}>{row.productos?.length || 0} artículo(s)</td>
                  <td style={{ padding: "14px 16px" }}>{renderAcciones(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "12px 16px", background: "#f0fdf4", borderTop: "1px solid #d1fae5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#059669", fontSize: 13 }}>
              Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total} recepciones
            </span>
            <div style={{ display: "flex", gap: "4px" }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ ...selectStyle, padding: "4px 10px" }}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  style={{ ...selectStyle, padding: "4px 10px", background: page === i + 1 ? "#1b4332" : "white", color: page === i + 1 ? "white" : "#374151" }}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ ...selectStyle, padding: "4px 10px" }}>›</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? "Editar recepcion" : "Nueva recepcion"}>
        <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 12px" }}>
          {editItem ? `${editItem.folio} · Editando` : "Se creará como borrador · podrás editarla antes de confirmar"}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Proveedor *</label>
            <select value={form.proveedorId} onChange={e => setForm({ ...form, proveedorId: e.target.value })}
              style={{ ...selectStyle, width: "100%", marginTop: 4 }}>
              <option value="">Seleccionar proveedor</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Fecha estimada de llegada</label>
            <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })}
              style={{ ...selectStyle, width: "100%", marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Notas del pedido (opcional)</label>
            <textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })}
              placeholder="Ej. entregar en bodega principal"
              style={{ ...selectStyle, width: "100%", marginTop: 4, minHeight: 60, resize: "vertical" }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>PRODUCTOS A RECIBIR</label>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, marginTop: 8, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 30px", gap: 8, padding: "8px 12px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: 12, color: "#40916c", fontWeight: 600 }}>Producto</span>
                <span style={{ fontSize: 12, color: "#40916c", fontWeight: 600 }}>Cantidad *</span>
                <span style={{ fontSize: 12, color: "#40916c", fontWeight: 600 }}>Precio u.</span>
                <span></span>
              </div>
              {form.productos.map((p, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 30px", gap: 8, padding: "8px 12px", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
                  <select value={p.productoId} onChange={e => updateProducto(i, "productoId", e.target.value)}
                    style={{ ...selectStyle, fontSize: 12 }}>
                    <option value="">Seleccionar producto...</option>
                    {products.map(pr => <option key={pr.id} value={pr.id}>{pr.nombre}</option>)}
                  </select>
                  <input type="number" value={p.cantidad} onChange={e => updateProducto(i, "cantidad", Number(e.target.value))}
                    style={{ ...selectStyle, fontSize: 12 }} />
                  <input type="number" value={p.precioUnitario} onChange={e => updateProducto(i, "precioUnitario", Number(e.target.value))}
                    style={{ ...selectStyle, fontSize: 12 }} />
                  <button onClick={() => removeProducto(i)}
                    style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
              ))}
              <div style={{ padding: "8px 12px" }}>
                <button onClick={addProducto}
                  style={{ fontSize: 13, color: "#1b4332", background: "none", border: "1px dashed #d1d5db", borderRadius: 6, padding: "4px 12px", cursor: "pointer" }}>
                  + Agregar producto
                </button>
              </div>
            </div>
          </div>
          <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#15803d" }}>
            ¿Qué pasa despues? La recepcion se guarda como borrador
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editItem ? "Guardar Cambios" : "Crear recepcion"}</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Detalle */}
      <Modal isOpen={detalleOpen} onClose={() => setDetalleOpen(false)} title={`Recepcion ${detalleItem?.folio || ""}`}>
        {detalleItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{detalleItem.proveedor?.nombre} · {detalleItem.fecha?.split("T")[0]}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>FOLIO</p><p style={{ margin: 0 }}>{detalleItem.folio}</p></div>
              <div><p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>PROVEEDOR</p><p style={{ margin: 0 }}>{detalleItem.proveedor?.nombre}</p></div>
              <div><p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>FECHA DE CREACION</p><p style={{ margin: 0 }}>{detalleItem.createdAt?.split("T")[0]}</p></div>
              <div><p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>ESTADO</p><p style={{ margin: 0 }}>{estadoBadge(detalleItem.estado)}</p></div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f0fdf4", borderBottom: "1px solid #d1fae5" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#40916c" }}>Producto</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#40916c" }}>SKU</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#40916c" }}>Cant.</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#40916c" }}>Precio</th>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#40916c" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(detalleItem.productos || []).map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px 12px" }}>{p.producto?.nombre || p.productoId}</td>
                    <td style={{ padding: "8px 12px", color: "#6b7280" }}>{p.producto?.sku || "-"}</td>
                    <td style={{ padding: "8px 12px" }}>{p.cantidad}</td>
                    <td style={{ padding: "8px 12px" }}>${p.precioUnitario}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 500 }}>${p.cantidad * p.precioUnitario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ textAlign: "right", fontWeight: "bold", color: "#111827" }}>
              Total: ${totalRecepcion(detalleItem.productos).toLocaleString()}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button variant="secondary" onClick={() => setDetalleOpen(false)}>Cerrar</Button>
              {detalleItem.estado?.toLowerCase() === "en proceso" && (
                <button onClick={() => { setConfirmarItem(detalleItem); setDetalleOpen(false); setConfirmarOpen(true); }}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#1b4332", color: "white", cursor: "pointer", fontWeight: 600 }}>
                  Ir a confirmar →
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Confirmar */}
      <Modal isOpen={confirmarOpen} onClose={() => setConfirmarOpen(false)} title={`Recepcion ${confirmarItem?.folio || ""}`}>
        {confirmarItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>{confirmarItem.folio} · {confirmarItem.proveedor?.nombre}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, background: "#f0fdf4", borderRadius: 8, padding: 12 }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#15803d", margin: 0 }}>{confirmarItem.productos?.length || 0}</p>
                <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>Productos</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#15803d", margin: 0 }}>{confirmarItem.productos?.reduce((a, p) => a + p.cantidad, 0) || 0}</p>
                <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>Unidades Totales</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#15803d", margin: 0 }}>${totalRecepcion(confirmarItem.productos).toLocaleString()}</p>
                <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>Total</p>
              </div>
            </div>
            <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 12, border: "1px solid #d1fae5" }}>
              <p style={{ fontSize: 13, color: "#15803d", fontWeight: 600, margin: "0 0 8px" }}>Al confirmar sucede esto automáticamente:</p>
              <p style={{ fontSize: 12, color: "#374151", margin: "4px 0" }}>✓ El stock de cada producto aumenta con las cantidades de esta recepción</p>
              <p style={{ fontSize: 12, color: "#374151", margin: "4px 0" }}>✓ Se registra en el módulo de Auditoría</p>
              <p style={{ fontSize: 12, color: "#374151", margin: "4px 0" }}>✓ La recepción cambia a estado Confirmada y no se puede editar</p>
              <p style={{ fontSize: 12, color: "#374151", margin: "4px 0" }}>✓ Se registra quién confirmó y a qué hora</p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button variant="secondary" onClick={() => setConfirmarOpen(false)}>Cancelar</Button>
              <button onClick={handleConfirmar}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#1b4332", color: "white", cursor: "pointer", fontWeight: 600 }}>
                Ir a confirmar →
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}