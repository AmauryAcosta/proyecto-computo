import { useState, useEffect } from "react";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  toggleSupplier,
  deleteSupplier,
} from "../../api/suppliers";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";

const emptyForm = { nombre: "", email: "", rfc: "", telefono: "" };

const selectStyle = {
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "7px 12px",
  fontSize: "13px",
  color: "#374151",
  backgroundColor: "white",
  cursor: "pointer",
};

export default function Proveedores() {
  const toast = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const limit = 10;

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await getSuppliers(page, limit);
      setSuppliers(data.items);
      setTotal(data.total);
    } catch {
      toast("Error al cargar proveedores", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [page]);

  useEffect(() => {
    const handler = () => handleOpen();
    document.addEventListener("openNewSupplier", handler);
    return () => document.removeEventListener("openNewSupplier", handler);
  }, []);

  const activos = suppliers.filter((s) => s.activo).length;
  const inactivos = suppliers.filter((s) => !s.activo).length;

  const filtered = suppliers.filter((s) => {
    const matchSearch =
      !search ||
      s.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.rfc?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || String(s.activo) === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleOpen = (item = null) => {
    setEditItem(item);
    setForm(
      item
        ? {
            nombre: item.nombre,
            email: item.email,
            rfc: item.rfc,
            telefono: item.telefono,
            activo: item.activo,
          }
        : emptyForm,
    );
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.email) {
      toast("Completa los campos requeridos", "error");
      return;
    }
    try {
      if (editItem) {
        await updateSupplier(editItem.id, form);
        toast("Proveedor actualizado", "success");
      } else {
        await createSupplier(form);
        toast("Proveedor creado", "success");
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      toast(err.response?.data?.message || "Error al guardar", "error");
    }
  };

  const handleToggle = async (supplier) => {
    try {
      await toggleSupplier(supplier.id);
      toast(
        `Proveedor ${supplier.activo ? "desactivado" : "activado"}`,
        "success",
      );
      fetchSuppliers();
    } catch {
      toast("Error al cambiar estado", "error");
    }
  };

  const handleDelete = async (supplier) => {
    if (!confirm(`¿Eliminar a ${supplier.nombre}?`)) return;
    try {
      await deleteSupplier(supplier.id);
      toast("Proveedor eliminado", "success");
      fetchSuppliers();
    } catch {
      toast("Error al eliminar", "error");
    }
  };

  const columns = [
    { key: "nombre", label: "Empresa" },
    { key: "rfc", label: "RFC" },
    { key: "email", label: "Email" },
    { key: "telefono", label: "Teléfono" },
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
            Proveedores de hardware
          </h3>
          <p style={{ fontSize: "13px", opacity: 0.8, margin: "4px 0 0" }}>
            {total} proveedores registrados · {activos} activos · {inactivos}{" "}
            inactivos
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
            <div style={{ fontSize: "22px", fontWeight: "700" }}>
              {inactivos}
            </div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Inactivos</div>
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
            placeholder="Buscar proveedor..."
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
            de {total} proveedores
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
            ? "Editar Proveedor - ByteStore"
            : "Nuevo Proveedor - ByteStore"
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
              label="Empresa"
              value={form.nombre}
              onChange={f("nombre")}
              placeholder="HP Mexico"
            />
            <Input
              label="RFC"
              value={form.rfc}
              onChange={f("rfc")}
              placeholder="HPM88001012SX"
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={f("email")}
            placeholder="ventas@empresa.com"
          />
          <Input
            label="Teléfono"
            value={form.telefono}
            onChange={f("telefono")}
            placeholder="55-5000-0000"
          />
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
              {editItem ? "ACTUALIZAR" : "Crear Proveedor"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
