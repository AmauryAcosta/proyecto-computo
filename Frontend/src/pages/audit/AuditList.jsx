import { useState, useEffect } from "react";
import { getAudit, getAuditById } from "../../api/audit";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";
import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import { useIsMobile } from "../../hooks/useMediaQuery";

const ACTION_COLORS = {
  CREATE: { bg: "#dcfce7", color: "#15803d" },
  UPDATE: { bg: "#dbeafe", color: "#1d4ed8" },
  DELETE: { bg: "#fee2e2", color: "#dc2626" },
  TOGGLE_ACTIVE: { bg: "#fef9c3", color: "#92400e" },
  LOGIN: { bg: "#ede9fe", color: "#7c3aed" },
};

const RESOURCE_COLORS = {
  users: { bg: "#fef9c3", color: "#92400e" },
  clients: { bg: "#dcfce7", color: "#15803d" },
  suppliers: { bg: "#dbeafe", color: "#1d4ed8" },
  products: { bg: "#e0e7ff", color: "#4338ca" },
  inventory: { bg: "#d1fae5", color: "#065f46" },
  recepciones: { bg: "#dcfce7", color: "#15803d" },
  roles: { bg: "#fce7f3", color: "#be185d" },
  permissions: { bg: "#fef3c7", color: "#b45309" },
  auth: { bg: "#ede9fe", color: "#7c3aed" },
};

const RESOURCE_LABELS = {
  users: "usuarios",
  clients: "clientes",
  suppliers: "proveedores",
  products: "productos",
  inventory: "inventario",
  recepciones: "recepciones",
  roles: "roles",
  permissions: "permisos",
  auth: "auth",
};

const ACTION_LABELS = {
  CREATE: "creó",
  UPDATE: "actualizó",
  DELETE: "eliminó",
  TOGGLE_ACTIVE: "cambió estado en",
  LOGIN: "inició sesión en",
};

function getActionText(log) {
  const verb = ACTION_LABELS[log.action] || log.action;
  const resource = RESOURCE_LABELS[log.resource] || log.resource;
  const name = log.details?.nombre || log.details?.usuario || log.resourceId?.slice(0, 8) || "";
  return `${verb} ${name ? `"${name}" en` : ""} ${resource}`.trim();
}

export default function AuditList() {
  const toast = useToast();
  const isMobile = useIsMobile();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterAction, setFilterAction] = useState("");
  const [filterResource, setFilterResource] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const limit = 15;

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const data = await getAudit(page, limit);
      setLogs(data.items);
      setTotal(data.total);
    } catch {
      toast("Error al cargar auditoría", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAudit(); }, [page]);

  const handleDetail = async (log) => {
    setDetailOpen(true);
    setLoadingDetail(true);
    try {
      const item = await getAuditById(log.id);
      setSelectedLog(item);
    } catch {
      setSelectedLog(log);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filtered = logs.filter(l => {
    const matchAction = !filterAction || l.action === filterAction;
    const matchResource = !filterResource || l.resource === filterResource;
    return matchAction && matchResource;
  });

  const totalPages = Math.ceil(total / limit);
  const selectStyle = { border: "1px solid #d1d5db", borderRadius: "8px", padding: "7px 14px", fontSize: "13px", color: "#374151", backgroundColor: "white", cursor: "pointer" };

  return (
    <div>
      <PageHeader
        title="Registro de actividad"
        subtitle="Todas las acciones quedan registradas automáticamente"
        stats={[{ value: total.toLocaleString(), label: "Total registros" }]}
      />

      <FilterBar
        search=""
        onSearch={() => {}}
        placeholder=""
        filters={[
          {
            value: filterResource,
            onChange: setFilterResource,
            options: [
              { label: "Todos los recursos", value: "" },
              ...Object.entries(RESOURCE_LABELS).map(([k, v]) => ({ label: v, value: k })),
            ],
          },
          {
            value: filterAction,
            onChange: setFilterAction,
            options: [
              { label: "Todas las acciones", value: "" },
              { label: "Creación", value: "CREATE" },
              { label: "Actualización", value: "UPDATE" },
              { label: "Eliminación", value: "DELETE" },
              { label: "Cambio de estado", value: "TOGGLE_ACTIVE" },
            ],
          },
        ]}
      />

      {loading ? (
        <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}><Spinner /></div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f0fdf4", borderBottom: "1px solid #e5e7eb" }}>
                  {["Fecha", "Usuario", "Acción", "Recurso", "Detalles"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#40916c" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>Sin registros</td></tr>
                ) : filtered.map((row, i) => {
                  const fecha = row.createdAt ? new Date(row.createdAt) : null;
                  const rc = RESOURCE_COLORS[row.resource] || { bg: "#f3f4f6", color: "#374151" };
                  return (
                    <tr key={row.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                      <td style={{ padding: "12px 16px", color: "#374151", whiteSpace: "nowrap" }}>
                        {fecha ? `${fecha.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })} ${fecha.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}` : "—"}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: "500", color: "#111827" }}>{row.usuario || "—"}</td>
                      <td style={{ padding: "12px 16px", color: "#374151" }}>{getActionText(row)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "500", background: rc.bg, color: rc.color }}>
                          {RESOURCE_LABELS[row.resource] || row.resource}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => handleDetail(row)}
                          style={{ border: "1px solid #d1d5db", background: "white", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", cursor: "pointer", color: "#374151" }}>
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", padding: "0 4px", flexWrap: "wrap", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "#40916c" }}>Mostrando {(page-1)*limit+1} - {Math.min(page*limit, total)} de {total} registros</span>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            <button disabled={page===1} onClick={() => setPage(p=>p-1)} style={{ ...selectStyle, padding: "5px 10px" }}>‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i;
              if (p > totalPages) return null;
              return <button key={p} onClick={() => setPage(p)} style={{ ...selectStyle, padding: "5px 10px", background: page===p ? "#1b4332" : "white", color: page===p ? "white" : "#374151" }}>{p}</button>;
            })}
            <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} style={{ ...selectStyle, padding: "5px 10px" }}>›</button>
          </div>
        </div>
      )}

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Detalle de Auditoría">
        {loadingDetail ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}><Spinner /></div>
        ) : selectedLog ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>Usuario</div>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>{selectedLog.usuario || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>Fecha</div>
                <div style={{ fontSize: "14px" }}>{selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString("es-MX") : "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>Acción</div>
                <div>
                  {(() => { const c = ACTION_COLORS[selectedLog.action] || { bg: "#f3f4f6", color: "#374151" }; return <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", background: c.bg, color: c.color }}>{selectedLog.action}</span>; })()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>Módulo</div>
                <div style={{ fontSize: "14px" }}>{RESOURCE_LABELS[selectedLog.resource] || selectedLog.resource}</div>
              </div>
            </div>
            {selectedLog.resourceId && (
              <div>
                <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>ID del Recurso</div>
                <div style={{ fontSize: "13px", fontFamily: "monospace", background: "#f9fafb", padding: "8px 12px", borderRadius: "8px", color: "#374151" }}>{selectedLog.resourceId}</div>
              </div>
            )}
            {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
              <div>
                <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" }}>Detalles</div>
                <pre style={{ fontSize: "12px", background: "#f9fafb", padding: "12px", borderRadius: "8px", overflow: "auto", margin: 0, color: "#374151" }}>
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}