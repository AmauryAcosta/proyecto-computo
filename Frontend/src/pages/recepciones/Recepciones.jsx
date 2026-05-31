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

const estadoBadge = (status) => {
  const map = {
    CONFIRMED: { label: "Confirmada", bg: "#e8f5e9", color: "#4caf50" },
    DRAFT: { label: "Borrador", bg: "#e0e7ff", color: "#4338ca" },
    PROCESS: { label: "En proceso", bg: "#fff3e0", color: "#ffb74d" },
    CANCELLED: { label: "Cancelada", bg: "#ffebee", color: "#ef5350" },
  };
  const s = map[status] || { label: status, bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      style={{
        ...s,
        padding: "6px 14px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: "600",
        display: "inline-block",
      }}
    >
      {s.label}
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
  const s = styles[variant] || {
    border: "#d1d5db",
    bg: "white",
    text: "#374151",
  };
  const isSelected =
    currentFilter.toLowerCase() === label.toLowerCase() ||
    (currentFilter === "" && label === "Todos");

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        cursor: "pointer",
        opacity: currentFilter && !isSelected ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: s.bg,
          border: `2px solid ${s.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "11px",
          fontWeight: "700",
          color: s.text,
        }}
      >
        {num}
      </div>
      <span
        style={{
          fontSize: "13px",
          color: "#4b5563",
          fontWeight: isSelected ? "600" : "400",
        }}
      >
        {label}
      </span>
    </div>
  );
};

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
  const limit = 10;

  const [form, setForm] = useState({
    supplierId: "",
    fecha: "",
    comentarios: "",
    folio: "",
    items: [{ productId: "", cantidad: 1, costoUnitario: 0 }],
  });

  const fetchRecepciones = async () => {
    setLoading(true);
    try {
      const res = await getRecepciones(page, limit);
      setData(res.items);
      setTotal(res.total);
    } catch {
      toast("Error al cargar recepciones", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecepciones();
  }, [page]);

  useEffect(() => {
    getSuppliers(1, 100)
      .then((r) => setSuppliers(r.items))
      .catch(() => {});
    getProducts(1, 100)
      .then((r) => setProducts(r.items))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => handleOpen(null);
    document.addEventListener("openNewRecepcion", handler);
    return () => document.removeEventListener("openNewRecepcion", handler);
  }, []);

  const confirmadas = data.filter((r) => r.status === "CONFIRMED").length;
  const pendientes = data.filter(
    (r) => r.status === "DRAFT" || r.status === "PROCESS",
  ).length;

  const filtered = data.filter((r) => {
    const matchEstado = !filterEstado || r.status === filterEstado;
    const matchBusqueda =
      !busqueda ||
      r.folio?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.supplierNombre?.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchBusqueda;
  });

  const totalRecepcion = (items = []) =>
    items.reduce((acc, p) => acc + p.cantidad * p.costoUnitario, 0);

  const totalUnidades = (items = []) =>
    items.reduce((acc, p) => acc + p.cantidad, 0);

  const formatDate = (fecha = "") => {
    if (!fecha) return "";
    const isoMatch = fecha.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      const meses = [
        "ene",
        "feb",
        "mar",
        "abr",
        "may",
        "jun",
        "jul",
        "ago",
        "sep",
        "oct",
        "nov",
        "dic",
      ];
      return `${Number(day)} ${meses[Number(month) - 1]} ${year}`;
    }
    return fecha;
  };

  const handleOpen = (item = null) => {
    setEditItem(item);
    setForm(
      item
        ? {
            supplierId: item.supplierId || "",
            fecha: item.fecha || "",
            comentarios: item.comentarios || "",
            folio: item.folio || "",
            items:
              item.items?.length > 0
                ? item.items.map((p) => ({
                    productId: p.productId || "",
                    cantidad: p.cantidad || 1,
                    costoUnitario: p.costoUnitario || 0,
                  }))
                : [{ productId: "", cantidad: 1, costoUnitario: 0 }],
          }
        : {
            supplierId: "",
            fecha: "",
            comentarios: "",
            folio: "",
            items: [{ productId: "", cantidad: 1, costoUnitario: 0 }],
          },
    );
    setModalOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) => {
        if (idx !== index) return item;
        const updated = {
          ...item,
          [field]:
            field === "cantidad" || field === "costoUnitario"
              ? Number(value)
              : value,
        };
        return updated;
      }),
    }));
  };

  const agregarItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", cantidad: 1, costoUnitario: 0 }],
    }));
  };

  const eliminarItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.supplierId || !form.fecha || !form.folio) {
      toast("Completa los campos requeridos", "error");
      return;
    }
    const itemsValidos = form.items.filter((p) => p.productId);
    if (itemsValidos.length === 0) {
      toast("Agrega al menos un producto", "error");
      return;
    }
    try {
      const payload = { ...form, items: itemsValidos };
      if (editItem) {
        await updateRecepcion(editItem.id, payload);
        toast("Recepción actualizada", "success");
      } else {
        await createRecepcion(payload);
        toast("Recepción creada", "success");
      }
      setModalOpen(false);
      fetchRecepciones();
    } catch (err) {
      toast(err.response?.data?.message || "Error al guardar", "error");
    }
  };

  const handleEliminar = async (item) => {
    if (!confirm(`¿Eliminar recepción ${item.folio}?`)) return;
    try {
      await deleteRecepcion(item.id);
      toast("Recepción eliminada", "success");
      fetchRecepciones();
    } catch {
      toast("Error al eliminar", "error");
    }
  };

  const abrirConfirmar = (item) => {
    setConfirmarItem(item);
    setConfirmNotes("");
    setDetalleOpen(false);
    setConfirmarOpen(true);
  };

  const handleConfirmar = async () => {
    try {
      await confirmRecepcion(confirmarItem.id);
      toast("Recepción confirmada — stock actualizado", "success");
      setConfirmarOpen(false);
      fetchRecepciones();
    } catch (err) {
      toast(err.response?.data?.message || "Error al confirmar", "error");
    }
  };

  const renderAcciones = (row) => {
    if (row.status === "CONFIRMED" || row.status === "CANCELLED") {
      return (
        <button
          onClick={() => {
            setDetalleItem(row);
            setDetalleOpen(true);
          }}
          style={{ ...selectStyle, padding: "4px 12px" }}
        >
          Ver detalles
        </button>
      );
    }
    if (row.status === "PROCESS") {
      return (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => {
              setDetalleItem(row);
              setDetalleOpen(true);
            }}
            style={{ ...selectStyle, padding: "4px 12px" }}
          >
            Ver
          </button>
          <button
            onClick={() => abrirConfirmar(row)}
            style={{
              padding: "4px 12px",
              borderRadius: "8px",
              border: "none",
              background: "#2d6a4f",
              color: "white",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Confirmar
          </button>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => handleOpen(row)}
          style={{ ...selectStyle, padding: "4px 12px" }}
        >
          Editar
        </button>
        <button
          onClick={() => abrirConfirmar(row)}
          style={{
            padding: "4px 12px",
            borderRadius: "8px",
            border: "none",
            background: "#2d6a4f",
            color: "white",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          Confirmar
        </button>
        <button
          onClick={() => handleEliminar(row)}
          style={{
            padding: "4px 12px",
            borderRadius: "8px",
            border: "1px solid #fca5a5",
            background: "white",
            color: "#dc2626",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Eliminar
        </button>
      </div>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Stats */}
      <div
        style={{
          background: "linear-gradient(135deg, #1b4332, #2d6a4f)",
          borderRadius: "12px",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          color: "white",
        }}
      >
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
            Recepciones de mercancía
          </h3>
          <p style={{ fontSize: "13px", opacity: 0.8, margin: "4px 0 0" }}>
            {total} recepciones totales · {pendientes} pendiente de confirmar
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: "8px",
              padding: "10px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: "700" }}>
              {confirmadas}
            </div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Confirmadas</div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.10)",
              borderRadius: "8px",
              padding: "10px 20px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: "700" }}>
              {pendientes}
            </div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Pendiente</div>
          </div>
        </div>
      </div>

      {/* Filtros de estado */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          flexWrap: "wrap",
          background: "white",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        {estadoCircle("Todos", "•", "default", filterEstado, () =>
          setFilterEstado(""),
        )}
        {estadoCircle("Borrador", 1, "borrador", filterEstado, () =>
          setFilterEstado("DRAFT"),
        )}
        {estadoCircle("En proceso", 2, "proceso", filterEstado, () =>
          setFilterEstado("PROCESS"),
        )}
        {estadoCircle("Confirmada", 3, "confirmada", filterEstado, () =>
          setFilterEstado("CONFIRMED"),
        )}
        {estadoCircle("Cancelada", "✕", "cancelada", filterEstado, () =>
          setFilterEstado("CANCELLED"),
        )}
      </div>

      {/* Búsqueda */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "10px 14px",
          marginBottom: "20px",
          gap: "8px",
        }}
      >
        <span style={{ color: "#9ca3af" }}>🔍</span>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por proveedor o folio..."
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            fontSize: "14px",
            color: "#4b5563",
          }}
        />
      </div>

      {/* Tabla */}
      {loading ? (
        <div
          style={{ padding: "40px", display: "flex", justifyContent: "center" }}
        >
          <Spinner />
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "12px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
              minWidth: "600px",
              background: "white",
              border: "1px solid #e5e7eb",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  background: "#f9fafb",
                }}
              >
                {[
                  "Folio",
                  "Proveedor",
                  "Fecha",
                  "Estado",
                  "Artículos",
                  "Acciones",
                ].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#40916c",
                      textTransform: "uppercase",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "32px",
                      textAlign: "center",
                      color: "#9ca3af",
                    }}
                  >
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td
                      style={{
                        padding: "14px 16px",
                        color: "#374151",
                        fontWeight: 500,
                      }}
                    >
                      {row.folio}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#111827" }}>
                      {row.supplierNombre}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                      {formatDate(row.fecha)}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {estadoBadge(row.status)}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#6b7280" }}>
                      {row.items?.length || 0} artículos
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {renderAcciones(row)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "12px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#40916c" }}>
            Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)}{" "}
            de {total} recepciones
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              style={{ ...selectStyle, padding: "5px 10px" }}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  ...selectStyle,
                  padding: "5px 10px",
                  background: page === i + 1 ? "#1b4332" : "white",
                  color: page === i + 1 ? "white" : "#374151",
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{ ...selectStyle, padding: "5px 10px" }}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      <Modal
        isOpen={detalleOpen}
        onClose={() => setDetalleOpen(false)}
        title=""
      >
        {detalleItem && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "12px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#111827",
                    display: "block",
                  }}
                >
                  Recepción {detalleItem.folio}
                </span>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  {detalleItem.supplierNombre} · {formatDate(detalleItem.fecha)}
                </span>
              </div>
              {estadoBadge(detalleItem.status)}
            </div>
            <div
              style={{
                maxHeight: "58vh",
                overflowY: "auto",
                paddingRight: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#e6f4ea",
                      borderBottom: "1px solid #c8e6c9",
                    }}
                  >
                    {["Producto", "SKU", "Cant.", "Costo U.", "Subtotal"].map(
                      (th) => (
                        <th
                          key={th}
                          style={{
                            padding: "10px 12px",
                            textAlign: "left",
                            fontSize: "11px",
                            fontWeight: "600",
                            color: "#2d6a4f",
                          }}
                        >
                          {th}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {detalleItem.items?.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #edf2f7" }}>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontWeight: "500",
                          color: "#1a202c",
                        }}
                      >
                        {p.productNombre}
                      </td>
                      <td style={{ padding: "10px 12px", color: "#718096" }}>
                        {p.sku}
                      </td>
                      <td style={{ padding: "10px 12px", color: "#2d3748" }}>
                        {p.cantidad}
                      </td>
                      <td style={{ padding: "10px 12px", color: "#2d3748" }}>
                        ${p.costoUnitario}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontWeight: "600",
                          color: "#1a202c",
                          textAlign: "right",
                        }}
                      >
                        ${p.subtotal || p.cantidad * p.costoUnitario}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div
                style={{
                  textAlign: "right",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#1a202c",
                }}
              >
                Total:{" "}
                <span style={{ fontSize: "15px", color: "#2d6a4f" }}>
                  $
                  {detalleItem.total?.toLocaleString() ||
                    totalRecepcion(detalleItem.items)}
                </span>
              </div>
              {detalleItem.comentarios && (
                <div
                  style={{
                    background: "#f7fafc",
                    padding: "12px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#4a5568",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  {detalleItem.comentarios}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "14px",
              }}
            >
              <button
                onClick={() => setDetalleOpen(false)}
                style={{
                  border: "1px solid #cbd5e0",
                  borderRadius: "6px",
                  padding: "6px 18px",
                  background: "white",
                  color: "#4a5568",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Cerrar
              </button>
              {detalleItem.status === "PROCESS" && (
                <button
                  onClick={() => abrirConfirmar(detalleItem)}
                  style={{
                    border: "none",
                    padding: "6px 18px",
                    borderRadius: "6px",
                    background: "#e8f5e9",
                    color: "#2e7d32",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  Ir a confirmar →
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal crear/editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editItem ? "Editar recepción" : "Nueva recepción"}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "22px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Proveedor *
                </label>
                <select
                  value={form.supplierId}
                  onChange={(e) =>
                    setForm({ ...form, supplierId: e.target.value })
                  }
                  style={selectStyle}
                >
                  <option value="">Seleccione un proveedor</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Folio *
                </label>
                <input
                  value={form.folio}
                  onChange={(e) => setForm({ ...form, folio: e.target.value })}
                  placeholder="ej. BS-R-0001"
                  style={{ ...selectStyle, width: "100%" }}
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Fecha *
                </label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  style={{ ...selectStyle, width: "100%" }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  gridColumn: "1 / -1",
                }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Comentarios
                </label>
                <textarea
                  value={form.comentarios}
                  onChange={(e) =>
                    setForm({ ...form, comentarios: e.target.value })
                  }
                  placeholder="Notas opcionales..."
                  style={{
                    width: "100%",
                    minHeight: "70px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    padding: "10px",
                    fontSize: "13px",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#f3faf7",
              border: "1px solid #c7f3d9",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#166534",
                  textTransform: "uppercase",
                }}
              >
                Productos a recibir
              </span>
              <button
                onClick={agregarItem}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #bbf7d0",
                  background: "#ecfdf5",
                  color: "#166534",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                + Agregar
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr auto",
                gap: "8px",
                marginBottom: "8px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#125e3c",
              }}
            >
              <div>Producto</div>
              <div>Cantidad</div>
              <div>Costo U.</div>
              <div />
            </div>
            {form.items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr auto",
                  gap: "8px",
                  marginBottom: "8px",
                  alignItems: "center",
                }}
              >
                <select
                  value={item.productId}
                  onChange={(e) =>
                    handleItemChange(index, "productId", e.target.value)
                  }
                  style={{ ...selectStyle, width: "100%" }}
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} — {p.sku}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={item.cantidad}
                  min="1"
                  onChange={(e) =>
                    handleItemChange(index, "cantidad", e.target.value)
                  }
                  style={{ ...selectStyle, width: "100%", textAlign: "center" }}
                />
                <input
                  type="number"
                  value={item.costoUnitario}
                  min="0"
                  onChange={(e) =>
                    handleItemChange(index, "costoUnitario", e.target.value)
                  }
                  style={{ ...selectStyle, width: "100%", textAlign: "center" }}
                />
                <button
                  onClick={() => eliminarItem(index)}
                  style={{
                    width: "36px",
                    height: "34px",
                    borderRadius: "8px",
                    border: "1px solid #f8c0c0",
                    background: "#fff1f2",
                    color: "#b91c1c",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              paddingTop: "8px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <Button onClick={() => setModalOpen(false)} variant="secondary">
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editItem ? "Guardar cambios" : "Crear recepción"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal confirmar */}
      <Modal
        isOpen={confirmarOpen}
        onClose={() => setConfirmarOpen(false)}
        title=""
      >
        {confirmarItem && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                paddingBottom: "10px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                Confirmar recepción {confirmarItem.folio}
              </h4>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                {confirmarItem.supplierNombre}
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "14px",
              }}
            >
              {[
                {
                  label: "Productos",
                  value: confirmarItem.items?.length || 0,
                  bg: "#e0f2fe",
                  color: "#0369a1",
                },
                {
                  label: "Unidades",
                  value: totalUnidades(confirmarItem.items),
                  bg: "#e0f2fe",
                  color: "#0369a1",
                },
                {
                  label: "Total",
                  value: `$${(confirmarItem.total || totalRecepcion(confirmarItem.items)).toLocaleString()}`,
                  bg: "#dcfce7",
                  color: "#15803d",
                },
              ].map((k) => (
                <div
                  key={k.label}
                  style={{
                    background: k.bg,
                    padding: "14px",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "20px",
                      fontWeight: "700",
                      color: k.color,
                    }}
                  >
                    {k.value}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: k.color,
                      fontWeight: "500",
                    }}
                  >
                    {k.label}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "14px",
                fontSize: "12px",
                color: "#166534",
              }}
            >
              ✓ El stock de cada producto aumentará automáticamente
              <br />
              ✓ Se registrará en Auditoría
              <br />✓ La recepción no podrá editarse después
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "12px",
              }}
            >
              <button
                onClick={() => setConfirmarOpen(false)}
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  padding: "6px 16px",
                  background: "white",
                  color: "#334155",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                style={{
                  border: "1px solid #bbf7d0",
                  borderRadius: "6px",
                  padding: "6px 16px",
                  background: "#dcfce7",
                  color: "#15803d",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Confirmar ingreso →
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
