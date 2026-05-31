import { useState, useEffect } from "react";
import { getInventory, adjustInventory, getInventoryMovements } from "../../api/inventory";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import Table from "../../components/ui/Table";
import { useToast } from "../../components/ui/Toast";
import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import { useIsMobile } from "../../hooks/useMediaQuery";

const emptyForm = { tipo: "ENTRADA", cantidad: 1, motivo: "" };

function StockBar({ cantidad, minimo }) {
  const pct = minimo > 0 ? Math.min((cantidad / (minimo * 2)) * 100, 100) : 100;
  const color = cantidad <= 0 ? "#ef4444" : cantidad <= minimo ? "#f59e0b" : "#22c55e";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ background: "#e5e7eb", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "999px", transition: "width 0.3s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#6b7280" }}>
        <span style={{ color, fontWeight: "600" }}>{cantidad} uds</span>
        <span>min {minimo}</span>
      </div>
    </div>
  );
}

export default function InventoryList() {
  const toast = useToast();
  const isMobile = useIsMobile();
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMov, setLoadingMov] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const limit = 10;

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await getInventory(page, limit);
      setInventory(data.items);
      setTotal(data.total);
    } catch {
      toast("Error al cargar inventario", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchMovements = async () => {
    setLoadingMov(true);
    try {
      const data = await getInventoryMovements(1, 10);
      setMovements(data.items);
    } catch {
      toast("Error al cargar movimientos", "error");
    } finally {
      setLoadingMov(false);
    }
  };

  useEffect(() => { fetchInventory(); }, [page]);
  useEffect(() => { fetchMovements(); }, []);

  useEffect(() => {
    const handler = () => {
      setSelectedProduct(null);
      setForm(emptyForm);
      setModalOpen(true);
    };
    document.addEventListener("openNewInventario", handler);
    return () => document.removeEventListener("openNewInventario", handler);
  }, []);

  const alertas = inventory.filter(i => i.stock <= (i.stockMinimo || 0)).length;
  const totalUnidades = inventory.reduce((acc, i) => acc + (i.stock || 0), 0);

  const filtered = inventory.filter(i =>
    !search ||
    i.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    i.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAjustar = (item) => {
    setSelectedProduct(item);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedProduct) { toast("Selecciona un producto", "warning"); return; }
    if (!form.cantidad || form.cantidad < 1) { toast("La cantidad debe ser mayor a 0", "warning"); return; }
    if (!form.motivo.trim()) { toast("El motivo es requerido", "warning"); return; }
    try {
      await adjustInventory(selectedProduct.id, {
        tipo: form.tipo,
        cantidad: Number(form.cantidad),
        motivo: form.motivo.trim(),
      });
      toast("Ajuste realizado correctamente", "success");
      setModalOpen(false);
      fetchInventory();
      fetchMovements();
    } catch (err) {
      toast(err.response?.data?.message || "Error al ajustar", "error");
    }
  };

  const selectStyle = { border: "1px solid #d1d5db", borderRadius: "8px", padding: "7px 12px", fontSize: "13px", color: "#374151", backgroundColor: "white", cursor: "pointer" };

  const movColumns = [
    {
      key: "createdAt", label: "Fecha",
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString("es-MX", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" }) : "—"
    },
    { key: "productNombre", label: "Producto", render: (row) => <strong>{row.productNombre || row.productoNombre || row.productId}</strong> },
    {
      key: "tipo", label: "Tipo",
      render: (row) => {
        const colors = { ENTRADA: { bg: "#dcfce7", color: "#15803d" }, SALIDA: { bg: "#fee2e2", color: "#dc2626" }, AJUSTE: { bg: "#fef9c3", color: "#92400e" } };
        const c = colors[row.tipo] || { bg: "#f3f4f6", color: "#374151" };
        return <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", background: c.bg, color: c.color }}>{row.tipo}</span>;
      }
    },
    {
      key: "cantidad", label: "Cantidad",
      render: (row) => <span style={{ fontWeight: "600", color: row.tipo === "ENTRADA" ? "#15803d" : row.tipo === "SALIDA" ? "#dc2626" : "#92400e" }}>
        {row.tipo === "ENTRADA" ? "+" : row.tipo === "SALIDA" ? "-" : "~"}{Math.abs(row.cantidad)}
      </span>
    },
    { key: "motivo", label: "Motivo", render: (row) => row.motivo || "—" },
    { key: "usuario", label: "Usuario", render: (row) => row.usuario || row.usuarioNombre || "—" },
  ];

  return (
    <div>
      <PageHeader
        title="Stock actual - ByteStore"
        subtitle={`${total} productos · ${alertas} con stock crítico o bajo`}
        stats={[
          { value: alertas,       label: "Alertas",         danger: alertas > 0 },
          { value: totalUnidades, label: "Unidades Totales" },
        ]}
      />

      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #d1d5db", borderRadius: "8px", padding: "7px 12px", background: "white", maxWidth: "320px" }}>
          <span style={{ color: "#9ca3af" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." style={{ border: "none", outline: "none", fontSize: "13px", color: "#374151", width: "100%", background: "transparent" }} />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}><Spinner /></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {filtered.map((item) => (
            <div key={item.id} onClick={() => handleAjustar(item)}
              style={{ background: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", cursor: "pointer", transition: "box-shadow 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)"}
            >
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}>{item.nombre}</div>
                <div style={{ fontSize: "12px", color: "#9ca3af" }}>{item.sku}</div>
              </div>
              <StockBar cantidad={item.stock || 0} minimo={item.stockMinimo || 10} />
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "#9ca3af" }}>Sin productos en inventario</div>
          )}
        </div>
      )}

      {Math.ceil(total / limit) > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "32px", flexWrap: "wrap" }}>
          <button disabled={page===1} onClick={() => setPage(p=>p-1)} style={{ ...selectStyle, padding: "5px 10px" }}>‹</button>
          {Array.from({ length: Math.ceil(total/limit) }, (_, i) => (
            <button key={i} onClick={() => setPage(i+1)} style={{ ...selectStyle, padding: "5px 10px", background: page===i+1 ? "#1b4332" : "white", color: page===i+1 ? "white" : "#374151" }}>{i+1}</button>
          ))}
          <button disabled={page===Math.ceil(total/limit)} onClick={() => setPage(p=>p+1)} style={{ ...selectStyle, padding: "5px 10px" }}>›</button>
        </div>
      )}

      <div>
        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Últimos movimientos</h3>
        <p style={{ fontSize: "13px", color: "#9ca3af", margin: "0 0 12px" }}>Entradas, salidas y ajustes</p>
        {loadingMov ? <Spinner /> : (
          <div style={{ overflowX: "auto" }}>
            <Table columns={movColumns} data={movements} />
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ajustar Stock - ByteStore">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {!selectedProduct && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Producto</label>
              <select onChange={e => setSelectedProduct(inventory.find(i => i.id === e.target.value))} style={{ ...selectStyle, width: "100%" }}>
                <option value="">Seleccionar producto</option>
                {inventory.map(i => <option key={i.id} value={i.id}>{i.nombre} — {i.sku}</option>)}
              </select>
            </div>
          )}
          {selectedProduct && (
            <div style={{ background: "#f0fdf4", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#15803d", fontWeight: "600" }}>
              📦 {selectedProduct.nombre} ({selectedProduct.sku}) — Stock actual: {selectedProduct.stock} uds
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Tipo de movimiento</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {["ENTRADA", "AJUSTE"].map(t => (
                <button key={t} onClick={() => setForm({ ...form, tipo: t })}
                  style={{ flex: 1, padding: "8px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "2px solid", borderColor: form.tipo === t ? "#1b4332" : "#d1d5db", background: form.tipo === t ? "#1b4332" : "white", color: form.tipo === t ? "white" : "#374151", transition: "all 0.15s" }}>
                  {t === "ENTRADA" ? "📥 Entrada" : "🔧 Ajuste"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Cantidad</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button onClick={() => setForm({ ...form, cantidad: Math.max(1, Number(form.cantidad) - 1) })}
                style={{ ...selectStyle, padding: "8px 14px", fontWeight: "700", fontSize: "16px" }}>−</button>
              <input type="number" min="1" value={form.cantidad}
                onChange={e => setForm({ ...form, cantidad: Math.max(1, Number(e.target.value)) })}
                style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 12px", fontSize: "14px", outline: "none", width: "80px", textAlign: "center" }} />
              <button onClick={() => setForm({ ...form, cantidad: Number(form.cantidad) + 1 })}
                style={{ ...selectStyle, padding: "8px 14px", fontWeight: "700", fontSize: "16px" }}>+</button>
            </div>
          </div>

          <Input label="Motivo *" name="motivo" value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} placeholder="Ej. Recepción de mercancía, Corrección de conteo..." />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>CANCELAR</Button>
            <Button onClick={handleSave}>Aplicar Ajuste</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}