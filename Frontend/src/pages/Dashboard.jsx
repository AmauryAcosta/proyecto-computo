/* export default function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-emerald-400 text-3xl font-bold">Dashboard</h1>
    </div>
  );
} */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardSummary } from "../api/dashboards";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";

const actionLabels = {
  CREATE: "creado",
  UPDATE: "actualizado",
  DELETE: "eliminado",
};

const resourceLabels = {
  products: "Producto",
  users: "Usuario",
  clients: "Cliente",
  suppliers: "Proveedor",
  recepciones: "Recepción",
  inventory: "Inventario",
  roles: "Rol",
  permissions: "Permiso",
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "Hace un momento";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

function StatCard({ icon, label, value, sub, bg }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: "13px", color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: "700", color: "#111827" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "12px", color: "#9ca3af" }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
      .catch(() => toast("Error al cargar el dashboard", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "60px" }}
      >
        <Spinner />
      </div>
    );

  if (!data) return null;

  const {
    totals,
    lowStockProducts,
    recentAudit,
    recentInventoryMovements,
    recepcionesRecientes,
  } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Bienvenida */}
      <div
        style={{
          background: "linear-gradient(135deg, #1b4332, #2d6a4f)",
          borderRadius: "12px",
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <p style={{ fontSize: "13px", opacity: 0.7, margin: "0 0 4px" }}>
            Bienvenido de vuelta
          </p>
          <h2
            style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 6px" }}
          >
            {user?.usuario || "Admin"}
          </h2>
          <p style={{ fontSize: "13px", opacity: 0.7, margin: 0 }}>
            Aquí está el resumen de ByteStore para hoy
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: "10px",
              padding: "14px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: "700" }}>
              {totals.recepciones}
            </div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Recepciones</div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: "10px",
              padding: "14px 20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: "700" }}>
              {totals.activeProducts}
            </div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>
              Productos activos
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas métricas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
        }}
      >
        <StatCard
          icon="👤"
          label="Usuarios activos"
          value={totals.activeUsers}
          sub={`${totals.users} registrados`}
          bg="#e0f2fe"
        />
        <StatCard
          icon="📋"
          label="Clientes"
          value={totals.activeClients}
          sub={`${totals.clients} registrados`}
          bg="#dcfce7"
        />
        <StatCard
          icon="🛍️"
          label="Productos"
          value={totals.activeProducts}
          sub={`${data.lowStockCount} bajo stock`}
          bg="#fef9c3"
        />
        <StatCard
          icon="📅"
          label="Recepciones"
          value={totals.recepciones}
          sub={`${recepcionesRecientes?.length || 0} recientes`}
          bg="#fee2e2"
        />
      </div>

      {/* Movimientos + Actividad reciente */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        {/* Movimientos de inventario */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "4px",
            }}
          >
            <div style={{ fontWeight: "600", fontSize: "14px" }}>
              Movimientos de inventario
            </div>
            <button
              onClick={() => navigate("/inventario")}
              style={{
                background: "none",
                border: "none",
                color: "#6b7280",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Ver detalle →
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 16px" }}>
            Últimos movimientos del sistema
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {recentInventoryMovements.slice(0, 4).map((mov) => (
              <div
                key={mov.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500" }}>
                    {mov.productNombre}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                    {mov.motivo}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color:
                        mov.tipo === "ENTRADA"
                          ? "#15803d"
                          : mov.tipo === "SALIDA"
                            ? "#dc2626"
                            : "#d97706",
                    }}
                  >
                    {mov.tipo === "ENTRADA"
                      ? "+"
                      : mov.tipo === "SALIDA"
                        ? "-"
                        : "~"}
                    {mov.cantidad}
                  </span>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                    {timeAgo(mov.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "4px",
            }}
          >
            <div style={{ fontWeight: "600", fontSize: "14px" }}>
              Actividad reciente
            </div>
            <button
              onClick={() => navigate("/auditoria")}
              style={{
                background: "none",
                border: "none",
                color: "#6b7280",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Ver detalle →
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 16px" }}>
            Últimas acciones del sistema
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {recentAudit.slice(0, 4).map((audit) => (
              <div
                key={audit.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500" }}>
                    {resourceLabels[audit.resource] || audit.resource}{" "}
                    {actionLabels[audit.action] || audit.action}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                    por {audit.usuario}
                  </div>
                </div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                  {timeAgo(audit.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bajo stock + Recepciones recientes */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
      >
        {/* Productos bajo stock */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "4px",
            }}
          >
            <div style={{ fontWeight: "600", fontSize: "14px" }}>
              Productos con bajo stock
            </div>
            <button
              onClick={() => navigate("/inventario")}
              style={{
                background: "none",
                border: "none",
                color: "#6b7280",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Ver inventario →
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 16px" }}>
            Requieren atención inmediata
          </p>
          {lowStockProducts.length === 0 ? (
            <p
              style={{
                fontSize: "13px",
                color: "#9ca3af",
                textAlign: "center",
                padding: "20px",
              }}
            >
              ✅ Todo el inventario está en orden
            </p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  {["Producto", "SKU", "Stock", "Estado"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "6px 8px",
                        textAlign: "left",
                        fontSize: "11px",
                        color: "#6b7280",
                        fontWeight: "600",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px" }}>{p.nombre}</td>
                    <td style={{ padding: "8px", color: "#6b7280" }}>
                      {p.sku}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        fontWeight: "600",
                        color: "#dc2626",
                      }}
                    >
                      {p.stock}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "999px",
                          fontSize: "11px",
                          fontWeight: "600",
                          background: p.stock <= 2 ? "#fee2e2" : "#fef9c3",
                          color: p.stock <= 2 ? "#dc2626" : "#d97706",
                        }}
                      >
                        {p.stock <= 2 ? "Crítico" : "Bajo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recepciones recientes */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "4px",
            }}
          >
            <div style={{ fontWeight: "600", fontSize: "14px" }}>
              Recepciones recientes
            </div>
            <button
              onClick={() => navigate("/recepciones")}
              style={{
                background: "none",
                border: "none",
                color: "#6b7280",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Ver detalle →
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "0 0 16px" }}>
            Últimas recepciones registradas
          </p>
          {recepcionesRecientes.length === 0 ? (
            <p
              style={{
                fontSize: "13px",
                color: "#9ca3af",
                textAlign: "center",
                padding: "20px",
              }}
            >
              Sin recepciones recientes
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {recepcionesRecientes.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "500" }}>
                      {r.folio}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                      {r.supplierNombre}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: "600",
                        background:
                          r.status === "CONFIRMED"
                            ? "#dcfce7"
                            : r.status === "DRAFT"
                              ? "#e0f2fe"
                              : "#fef9c3",
                        color:
                          r.status === "CONFIRMED"
                            ? "#15803d"
                            : r.status === "DRAFT"
                              ? "#0369a1"
                              : "#d97706",
                      }}
                    >
                      {r.status === "CONFIRMED"
                        ? "Confirmada"
                        : r.status === "DRAFT"
                          ? "Borrador"
                          : r.status}
                    </span>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        marginTop: "2px",
                      }}
                    >
                      {r.fecha}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
