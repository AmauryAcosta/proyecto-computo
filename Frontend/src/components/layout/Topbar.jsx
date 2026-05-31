// src/components/layout/Topbar.jsx
import { useLocation } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";

const topbarActions = {
  "/usuarios": { 
    label: "+ Nuevo Usuario",    
    event: "openNewUser",      
    permiso: "users:create", 
  },
  "/clientes": { 
    label: "+ Nuevo Cliente",    
    event: "openNewClient",    
    permiso: "clients:create", 
  },
  "/proveedores": {
    label: "+ Nuevo Proveedor", 
    event: "openNewSupplier",  
    permiso: "suppliers:create", 
  },
  "/productos": { 
    label: "+ Nuevo Producto",   
    event: "openNewProduct",   
    permiso: "products:create", 
  },
  "/recepciones": { 
    label: "+ Nueva Recepción",  
    event: "openNewRecepcion", 
    permiso: "recepciones:create", 
  },
};

const pageTitles = {
  "/dashboard": "Dashboard",
  "/usuarios": "Usuarios",
  "/clientes": "Clientes",
  "/proveedores": "Proveedores",
  "/productos": "Productos",
  "/inventario": "Inventario",
  "/recepciones": "Recepciones",
  "/auditoria": "Auditorías del sistema",
  "/roles": "Roles",
  "/permisos": "Permisos",
};

export default function Topbar({ onMenuClick, isMobile }) {
  const { pathname } = useLocation();
  const { hasPermission } = usePermission();
  const action = topbarActions[pathname];
  const title = pageTitles[pathname] || "ByteStore";
  const puedeCrear = action && hasPermission(action.permiso);

  const handleAction = () => {
    if (action) document.dispatchEvent(new CustomEvent(action.event));
  };

  return (
    <header
      style={{
        height: "60px",
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "0 16px" : "0 24px",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {isMobile && (
          <button
            onClick={onMenuClick}
            style={{
              background: "none", 
              border: "none", 
              cursor: "pointer",
              padding: "6px", 
              borderRadius: "6px", 
              color: "#374151",
              display: "flex", 
              flexDirection: "column", 
              gap: "5px",
            }}
            aria-label="Abrir menú"
          >
            <span style={{ width: "20px", height: "2px", background: "#374151", borderRadius: "2px", display: "block" }} />
            <span style={{ width: "20px", height: "2px", background: "#374151", borderRadius: "2px", display: "block" }} />
            <span style={{ width: "20px", height: "2px", background: "#374151", borderRadius: "2px", display: "block" }} />
          </button>
        )}
        <h1 style={{ fontSize: isMobile ? "16px" : "20px", fontWeight: "600", color: "#111827", margin: 0 }}>
          {title}
        </h1>
      </div>

      {puedeCrear && (
        <button
          onClick={handleAction}
          style={{
            padding: isMobile ? "7px 12px" : "8px 16px",
            background: "#1b4332", color: "white", border: "none",
            borderRadius: "8px", cursor: "pointer", fontWeight: "600",
            fontSize: isMobile ? "12px" : "14px",
            whiteSpace: "nowrap",
          }}
        >
          {isMobile ? "+" : action.label}
        </button>
      )}
    </header>
  );
}