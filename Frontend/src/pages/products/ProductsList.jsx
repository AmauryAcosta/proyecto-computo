import { useState, useEffect } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  toggleProduct,
  deleteProduct,
} from "../../api/products";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";

const emptyForm = {
  nombre: "",
  sku: "",
  categoria: "",
  marca: "",
  modelo: "",
  unidad: "",
  descripcion: "",
  precioCompra: "",
  precioVenta: "",
  stock: "",
  stockMinimo: "",
};

const categorias = ["Consumibles", "Cables", "Periféricos", "Componentes"];

const selectStyle = {
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "7px 12px",
  fontSize: "13px",
  color: "#374151",
  backgroundColor: "white",
  cursor: "pointer",
};

export default function ProductList() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const limit = 10;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts(page, limit);
      setProducts(data.items);
      setTotal(data.total);
    } catch {
      toast("Error al cargar productos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const handleOpen = (item = null) => {
    setEditItem(item);
    setForm(
      item
        ? {
            nombre: item.nombre,
            sku: item.sku,
            categoria: item.categoria,
            marca: item.marca || "",
            modelo: item.modelo || "",
            unidad: item.unidad || "",
            descripcion: item.descripcion || "",
            precioCompra: item.precioCompra,
            precioVenta: item.precioVenta,
            stock: item.stock,
            stockMinimo: item.stockMinimo,
            activo: item.activo,
          }
        : emptyForm,
    );
    setModalOpen(true);
  };

  useEffect(() => {
    const handler = () => handleOpen();
    document.addEventListener("openNewProduct", handler);
    return () => document.removeEventListener("openNewProduct", handler);
  }, []);

  const activos = products.filter((p) => p.activo).length;
  const bajosStock = products.filter(
    (p) => p.stock <= (p.stockMinimo || 10),
  ).length;

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategoria || p.categoria === filterCategoria;
    const matchStatus = !filterStatus || String(p.activo) === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const validate = () => {
    const errors = {};
    if (!form.nombre?.trim()) errors.nombre = "Requerido";
    if (!form.sku?.trim()) errors.sku = "Requerido";
    if (!form.precioVenta) errors.precioVenta = "Requerido";
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }
    try {
      const payload = {
        ...form,
        precioCompra: Number(form.precioCompra),
        precioVenta: Number(form.precioVenta),
        stock: Number(form.stock),
        stockMinimo: Number(form.stockMinimo),
      };
      if (editItem) {
        await updateProduct(editItem.id, payload);
        toast("Producto actualizado", "success");
      } else {
        await createProduct(payload);
        toast("Producto creado", "success");
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast(err.response?.data?.message || "Error al guardar", "error");
    }
  };

  const handleToggle = async (product) => {
    try {
      await toggleProduct(product.id);
      toast(
        `Producto ${product.activo ? "desactivado" : "activado"}`,
        "success",
      );
      fetchProducts();
    } catch {
      toast("Error al cambiar estado", "error");
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`¿Eliminar ${product.nombre}?`)) return;
    try {
      await deleteProduct(product.id);
      toast("Producto eliminado", "success");
      fetchProducts();
    } catch {
      toast("Error al eliminar", "error");
    }
  };

  const columns = [
    {
      key: "sku",
      label: "SKU",
      render: (row) => (
        <span style={{ color: "#6b7280", fontSize: "13px" }}>{row.sku}</span>
      ),
    },
    {
      key: "nombre",
      label: "Producto",
      render: (row) => <span style={{ fontWeight: "500" }}>{row.nombre}</span>,
    },
    {
      key: "categoria",
      label: "Categoría",
      render: (row) => (
        <span
          style={{
            padding: "2px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: "600",
            background: "#e0f2fe",
            color: "#0369a1",
          }}
        >
          {row.categoria}
        </span>
      ),
    },
    {
      key: "precioVenta",
      label: "Precio",
      render: (row) => `$${Number(row.precioVenta).toLocaleString()}`,
    },
    {
      key: "stock",
      label: "Stock",
      render: (row) => (
        <span
          style={{
            fontWeight: "600",
            color: row.stock <= (row.stockMinimo || 10) ? "#dc2626" : "#15803d",
          }}
        >
          {row.stock}
        </span>
      ),
    },
    {
      key: "activo",
      label: "Estado",
      render: (row) => (
        <span
          style={{
            padding: "2px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: "600",
            background: row.activo ? "#dcfce7" : "#fee2e2",
            color: row.activo ? "#15803d" : "#dc2626",
          }}
        >
          {row.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" onClick={() => handleOpen(row)}>
            Editar
          </Button>
          <Button
            variant={row.activo ? "danger" : "success"}
            onClick={() => handleToggle(row)}
          >
            {row.activo ? "Desactivar" : "Activar"}
          </Button>
          <Button variant="danger" onClick={() => handleDelete(row)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(total / limit);
  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div>
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
            Catálogo ByteStore
          </h3>
          <p style={{ fontSize: "13px", opacity: 0.8, margin: "4px 0 0" }}>
            {total} productos · periféricos, componentes, cables y consumibles
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
            <div style={{ fontSize: "22px", fontWeight: "700" }}>{activos}</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Activos</div>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: "8px",
              padding: "10px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: bajosStock > 0 ? "#fca5a5" : "white",
              }}
            >
              {bajosStock}
            </div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Bajo stock</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            padding: "7px 12px",
            background: "white",
            flex: 1,
            minWidth: "160px",
          }}
        >
          <span style={{ color: "#9ca3af" }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto o SKU..."
            style={{
              border: "none",
              outline: "none",
              fontSize: "13px",
              color: "#374151",
              width: "100%",
              background: "transparent",
            }}
          />
        </div>
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          style={selectStyle}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={selectStyle}
        >
          <option value="">Todos los estados</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <div
          style={{ padding: "40px", display: "flex", justifyContent: "center" }}
        >
          <Spinner />
        </div>
      ) : (
        <Table columns={columns} data={filtered} />
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
            de {total} Productos
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

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editItem
            ? "Editar Producto - ByteStore"
            : "Nuevo Producto - ByteStore"
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Input
              label="Producto"
              value={form.nombre}
              onChange={f("nombre")}
              placeholder="ej. Cable HDMI"
              error={formError.nombre}
            />
            <Input
              label="SKU"
              value={form.sku}
              onChange={f("sku")}
              placeholder="ej. BS-0001"
              error={formError.sku}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Input
              label="Marca"
              value={form.marca}
              onChange={f("marca")}
              placeholder="ej. HP"
            />
            <Input
              label="Modelo"
              value={form.modelo}
              onChange={f("modelo")}
              placeholder="ej. 85A"
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Categoría
              </label>
              <select
                value={form.categoria}
                onChange={f("categoria")}
                style={{ ...selectStyle, width: "100%" }}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Input
              label="Precio compra"
              type="number"
              value={form.precioCompra}
              onChange={f("precioCompra")}
              placeholder="ej. 700"
            />
            <Input
              label="Precio venta"
              type="number"
              value={form.precioVenta}
              onChange={f("precioVenta")}
              placeholder="ej. 850"
              error={formError.precioVenta}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Input
              label="Unidad"
              value={form.unidad}
              onChange={f("unidad")}
              placeholder="ej. pieza"
            />
            <Input
              label="Descripción"
              value={form.descripcion}
              onChange={f("descripcion")}
              placeholder="ej. Toner original"
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <Input
              label="Stock inicial"
              type="number"
              value={form.stock}
              onChange={f("stock")}
              placeholder="ej. 10"
            />
            <Input
              label="Stock mínimo"
              type="number"
              value={form.stockMinimo}
              onChange={f("stockMinimo")}
              placeholder="ej. 5"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label
              style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}
            >
              Estado
            </label>
            <select
              value={form.activo === undefined ? "" : String(form.activo)}
              onChange={(e) =>
                setForm({ ...form, activo: e.target.value === "true" })
              }
              style={{ ...selectStyle, width: "100%" }}
            >
              <option value="">Seleccionar estado</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              CANCELAR
            </Button>
            <Button onClick={handleSave}>
              {editItem ? "ACTUALIZAR" : "CREAR"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
