import { useLocation } from "react-router-dom";

const pageActions = {
  "/usuarios": { label: "+ Nuevo Usuario", event: "openNewUser" },
  "/clientes": { label: "+ Nuevo Cliente", event: "openNewCliente" },
  "/proveedores": { label: "+ Nuevo Proveedor", event: "openNewSupplier" },
  "/productos": { label: "+ Nuevo Producto", event: "openNewProducto" },
  "/recepciones": { label: "+ Nueva Recepción", event: "openNewRecepcion" },
};

export default function Topbar({ title }) {
  const { pathname } = useLocation();
  const action = pageActions[pathname];

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
        padding: "0 24px",
        flexShrink: 0,
      }}
    >
      <h1
        style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#111827",
          margin: 0,
        }}
      >
        {title}
      </h1>
      {action && (
        <button
          onClick={() => document.dispatchEvent(new CustomEvent(action.event))}
          style={{
            background: "#1b4332",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {action.label}
        </button>
      )}
    </header>
  );
}
