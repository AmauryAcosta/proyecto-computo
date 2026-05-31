import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardSummary } from "../api/dashboards";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/ui/Spinner";
import { useToast } from "../components/ui/Toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useIsMobile, useIsTablet } from "../hooks/useMediaQuery";

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

function StatCard({ letra, label, value, sub, bg, borderColor, iconColor }) {
  return (
    <div 
    style={{ 
      background: "white", 
      borderRadius: "12px", 
      border: "1px solid #e5e7eb", 
      overflow: "hidden", 
      display: "flex", 
      flexDirection: "column",
      }}
      >
      <div 
      style={{ 
        background: bg, 
        padding: "16px 20px", 
        display: "flex", 
        alignItems: "center", 
        }}
        >
        <span style={{ fontSize: "24px" }}>{letra}</span>
      </div>
      <div 
      style={{ 
        padding: "12px 20px 16px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "6px" 
        }}
        >
        <div style={{ fontSize: "13px", color: "#6b7280" }}>{label}</div>
        <div style={{ fontSize: "24px", fontWeight: "700", color: "#111827" }}>
          {value}
          </div>
        {sub && <div style={{ fontSize: "12px", color: "#9ca3af" }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
      .catch(() => toast("Error al cargar el dashboard", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) 
    return 
    <div 
    style={{ display: "flex", justifyContent: "center", padding: "60px" }}
    >
      <Spinner />
      </div>
  if (!data) return null;

  const { 
    totals, 
    lowStockProducts, 
    recentAudit, 
    recentInventoryMovements, 
    recepcionesRecientes 
  } = data;

  const movimientosChart = recentInventoryMovements
  .slice(0, 6)
  .map((mov, i) => ({
    name: `Mov ${i + 1}`,
    Entradas: mov.tipo === "ENTRADA" ? mov.cantidad : 0,
    Salidas: mov.tipo === "SALIDA" ? mov.cantidad : 0,
    Ajustes: mov.tipo === "AJUSTE" ? mov.cantidad : 0,
  }));

  const statsColumns = isMobile ? "1fr 1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)";
  const twoColGrid = isMobile ? "1fr" : "1fr 1fr";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      <div 
      style={{
        background: "linear-gradient(135deg, #1b4332, #2d6a4f)",
        borderRadius: "12px", 
        padding: isMobile ? "18px 16px" : "24px 28px",
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
          style={{ fontSize: isMobile ? "18px" : "24px", fontWeight: "700", margin: "0 0 6px" }}
          >
            {user?.usuario || "Admin"}
          </h2>
          <p style={{ fontSize: "13px", opacity: 0.7, margin: 0 }}>
            Aquí está el resumen de ByteStore para hoy
            </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {[
            { value: totals.recepciones, label: "Recepciones" },
            { value: totals.activeProducts, label: "Productos activos" },
          ].map((item) => (
            <div key={item.label} style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "14px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "22px", fontWeight: "700" }}>{item.value}</div>
              <div style={{ fontSize: "11px", opacity: 0.8 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div 
      style={{ 
        display: "grid", 
        gridTemplateColumns: statsColumns, 
        gap: "12px",
        }}
        >
        <StatCard 
        letra="👤" 
        label="Usuarios activos"  
        value={totals.activeUsers}    
        sub={`${totals.users} registrados`}           
        bg="#e0f2fe"
        borderColor="#38bdf8"
        iconColor="#0369a1" 
        />
        <StatCard 
        letra="📋" 
        label="Clientes"          
        value={totals.activeClients}  
        sub={`${totals.clients} registrados`}          
        bg="#dcfce7" 
        borderColor="#38bdf8"
        iconColor="#0369a1" 
        />
        <StatCard 
        letra="🛍️" 
        label="Productos"        
        value={totals.activeProducts} 
        sub={`${data.lowStockCount} bajo stock`}        
        bg="#fef9c3" 
        borderColor="#facc15"
        iconColor="#d97706"
        />
        <StatCard 
        letra="📅" 
        label="Recepciones"       
        value={totals.recepciones}    
        sub={`${recepcionesRecientes?.length || 0} recientes`} 
        bg="#fee2e2" 
        borderColor="#f87171"
        iconColor="#dc2626"
        />
      </div>

      <div 
      style={{ 
        display: "grid", 
        gridTemplateColumns: twoColGrid, 
        gap: "16px", 
        }}
        >

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
            Entradas y salidas · últimos movimientos
            </p>

          {(() => {
            const maxVal = Math.max(
              ...movimientosChart.map((m) => 
                Math.max(m.Entradas, m.Ajustes, m.Salidas),
            ), 
            1,
          );
            return (
              <div 
              style={{ 
                position: "relative", 
                height: "160px", 
                padding: "0 8px",
                }}
                >
                {[100, 75, 50, 25].map((pct) => (
                  <div 
                  key={pct} 
                  style={{ 
                    position: "absolute", 
                    left: 0, 
                    right: 0, 
                    top: `${100 - pct}%`, 
                    borderTop: "1px dashed #e5e7eb", 
                    }}
                    >
                    <span 
                    style={{ 
                      fontSize: "9px", 
                      color: "#9ca3af", 
                      background: "white", 
                      paddingRight: "4px", 
                      }}
                      >
                        {Math.round((pct * maxVal) / 100)}
                        </span>
                  </div>
                ))}
                <div 
                style={{ 
                  display: "flex", 
                  alignItems: "flex-end", 
                  gap: "6px", 
                  height: "100%", 
                  position: "relative", 
                  zIndex: 1, 
                  }}
                  >
                  {movimientosChart.map((mov, i) => (
                    <div 
                    key={i} 
                    style={{ 
                      flex: 1, 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center", 
                      gap: "3px", 
                      height: "100%",
                      }}
                      >
                      <div 
                      style={{ 
                        flex: 1, 
                        width: "60%", 
                        display: "flex", 
                        flexDirection: "column", 
                        justifyContent: "flex-end", 
                        gap: "2px", 
                        }}
                        >
                        {mov.Entradas > 0 && 
                        <div 
                        style={{ 
                          width: "100%", 
                          height: `${(mov.Entradas / maxVal) * 100}%`, 
                          minHeight: "4px", 
                          background: "#4ade80", 
                          borderRadius: "3px 3px 0 0",
                          }} 
                          />
                          }
                        {mov.Ajustes > 0 && 
                        <div 
                        style={{ 
                          width: "100%", 
                          height: `${(mov.Ajustes / maxVal) * 100}%`, 
                          minHeight: "4px", 
                          background: "#facc15", 
                          borderRadius: "3px 3px 0 0", 
                          }} 
                          />
                          }
                        {mov.Salidas > 0 && 
                        <div 
                        style={{ 
                          width: "100%", 
                          height: `${(mov.Salidas / maxVal) * 100}%`, 
                          minHeight: "4px", 
                          background: "#f87171", 
                          borderRadius: "3px 3px 0 0", 
                          }} 
                          />
                          }
                      </div>
                      <span style={{ fontSize: "10px", color: "#9ca3af" }}>
                        {mov.name}
                        </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
            {[
              { color: "#4ade80", label: "Entradas" }, 
              { color: "#f87171", label: "Salidas" }, 
              { color: "#facc15", label: "Ajustes" }
            ].map((item) => (
              <div 
              key={item.label} 
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <div 
                style={{ 
                  width: "10px", 
                  height: "10px", 
                  borderRadius: "2px", 
                  background: item.color, 
                  }} 
                  />
                <span style={{ fontSize: "11px", color: "#6b7280" }}>
                  {item.label}
                  </span>
              </div>
            ))}
          </div>
        </div>

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
                flexWrap: "wrap", 
                gap: "4px" 
                }} 
                >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500" }}>
                    {resourceLabels[audit.resource] || audit.resource} 
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

      <div 
      style={{ display: "grid", gridTemplateColumns: twoColGrid, gap: "16px" }}
      >

        <div 
        style={{ 
          background: "white", 
          borderRadius: "12px", 
          border: "1px solid #e5e7eb", 
          padding: "20px" 
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
              padding: "20px" 
            }}
            >
              ✅ Todo el inventario está en orden
              </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table 
              style={{ 
                width: "100%", 
                borderCollapse: "collapse", 
                fontSize: "13px", 
                minWidth: "280px", 
                }}
                >
                <thead>
                  <tr style={{ background: "#fef9c3" }}>
                    {["Producto", "SKU", "Stock", "Estado"].map((h) => (
                      <th 
                      key={h} 
                      style={{ 
                        padding: "8px", 
                        textAlign: "left", 
                        fontSize: "12px", 
                        color: "#92400e", 
                        fontWeight: "600" 
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
                        color: "#dc2626" 
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
            </div>
          )}
        </div>

        <div 
        style={{ 
          background: "white", 
          borderRadius: "12px", 
          border: "1px solid #e5e7eb", 
          padding: "20px" 
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
              cursor: "pointer" 
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
              padding: "20px" 
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
                  flexWrap: "wrap", 
                  gap: "8px",
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