import { useState, useEffect } from "react";
import { getClients, createClient, updateClient, toggleClient, deleteClient } from "../../api/clients";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";
import PageHeader from "../../components/ui/PageHeader";
import FilterBar from "../../components/ui/FilterBar";
import { useIsMobile } from "../../hooks/useMediaQuery";

const emptyForm = { nombre: "", rfc: "", email: "", telefono: "", direccion: "", contacto: "", tipo: "B2B", activo: true };

function Avatar({ nombre }) {
  const initials = nombre?.slice(0, 2).toUpperCase() || "??";
  const colors = ["#a8d5ba", "#b5c4e8", "#f4c7c3", "#c8b8e8", "#f9d4a0"];
  const color = colors[nombre?.charCodeAt(0) % colors.length] || "#a8d5ba";
  return (
    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#374151", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export default function ClientList() {
  const toast = useToast();
  const isMobile = useIsMobile(); 
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const limit = 10;

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await getClients(page, limit);
      setClients(data.items);
      setTotal(data.total);
    } catch {
      toast("Error al cargar clientes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, [page]);

  const handleNew = () => {
    setEditingClient(null);
    setForm(emptyForm);
    setFormError({});
    setModalOpen(true);
  };

  useEffect(() => {
    const handler = () => handleNew();
    document.addEventListener("openNewClient", handler);
    return () => document.removeEventListener("openNewClient", handler);
  }, []);

  const activos = clients.filter(c => c.activo).length;
  const inactivos = clients.filter(c => !c.activo).length;

  const filtered = clients.filter(c => {
    const matchSearch = !search ||
      c.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.contacto?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || String(c.activo) === filterStatus;
    const matchTipo = !filterTipo || c.tipo === filterTipo;
    return matchSearch && matchStatus && matchTipo;
  });

  const handleEdit = (client) => {
    setEditingClient(client);
    setForm({
      nombre: client.nombre || "",
      rfc: client.rfc || "",
      email: client.email || "",
      telefono: client.telefono || "",
      direccion: client.direccion || "",
      contacto: client.contacto || "",
      tipo: client.tipo || "B2B",
      activo: client.activo,
    });
    setFormError({});
    setModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.nombre.trim()) errors.nombre = "Requerido";
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormError(errors); return; }
    try {
      const payload = { ...form };
      if (editingClient) {
        await updateClient(editingClient.id, payload);
        toast("Cliente actualizado correctamente", "success");
      } else {
        await createClient(payload);
        toast("Cliente creado correctamente", "success");
      }
      setModalOpen(false);
      fetchClients();
    } catch (err) {
      toast(err.response?.data?.message || "Error al guardar", "error");
    }
  };

  const handleDelete = async (client) => {
    if (!confirm(`¿Eliminar a ${client.nombre}?`)) return;
    try {
      await deleteClient(client.id);
      toast("Cliente eliminado", "success");
      fetchClients();
    } catch {
      toast("Error al eliminar", "error");
    }
  };

  const columns = [
    {
      key: "nombre", label: "Empresa/Persona",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar nombre={row.nombre} />
          <span style={{ fontWeight: "500" }}>{row.nombre}</span>
        </div>
      )
    },
    ...(!isMobile ? [{ key: "contacto", label: "Contacto", render: (row) => row.contacto || "—" }] : []),
    ...(!isMobile ? [{ key: "email", label: "Email", render: (row) => row.email || "—" }] : []),
    {
      key: "tipo", label: "Tipo",
      render: (row) => (
        <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", background: row.tipo === "B2B" ? "#ede9fe" : "#e0e7ff", color: row.tipo === "B2B" ? "#7c3aed" : "#4338ca" }}>
          {row.tipo || "—"}
        </span>
      )
    },
    {
      key: "activo", label: "Estado",
      render: (row) => (
        <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", background: row.activo ? "#dcfce7" : "#fee2e2", color: row.activo ? "#15803d" : "#dc2626" }}>
          {row.activo ? "Activo" : "Inactivo"}
        </span>
      )
    },
    {
      key: "acciones", label: "Acciones",
      render: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" onClick={() => handleEdit(row)}>Editar</Button>
          <Button variant="danger" onClick={() => handleDelete(row)}>Eliminar</Button>
        </div>
      )
    },
  ];

  const totalPages = Math.ceil(total / limit);
  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const selectStyle = { border: "1px solid #d1d5db", borderRadius: "8px", padding: "7px 12px", fontSize: "13px", color: "#374151", backgroundColor: "white", cursor: "pointer" };

  return (
    <div>
      <PageHeader
        title="Clientes ByteStore"
        subtitle={`${total} clientes registrados · empresas y consumidores finales`}
        stats={[
          { value: activos,   label: "Activos"   },
          { value: inactivos, label: "Inactivos" },
        ]}
      />

      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Buscar cliente..."
        filters={[
          {
            key: "tipo",
            value: filterTipo,
            onChange: setFilterTipo,
            options: [
              { label: "Todos los tipos", value: "" },
              { label: "B2B", value: "B2B" },
              { label: "B2C", value: "B2C" },
            ]
          },
          {
            key: "status",
            value: filterStatus,
            onChange: setFilterStatus,
            options: [
              { label: "Todos los estados", value: "" },
              { label: "Activo",   value: "true"  },
              { label: "Inactivo", value: "false" },
            ]
          },
        ]}
      />

      {loading ? (
        <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}><Spinner /></div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <Table columns={columns} data={filtered} />
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", padding: "0 4px", flexWrap: "wrap", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "#40916c" }}>
            Mostrando {(page-1)*limit+1} - {Math.min(page*limit, total)} de {total} Clientes
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button disabled={page===1} onClick={() => setPage(p=>p-1)} style={{ ...selectStyle, padding: "5px 10px" }}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i+1)} style={{ ...selectStyle, padding: "5px 10px", background: page===i+1 ? "#1b4332" : "white", color: page===i+1 ? "white" : "#374151" }}>{i+1}</button>
            ))}
            <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} style={{ ...selectStyle, padding: "5px 10px" }}>›</button>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingClient ? "Editar Cliente - ByteStore" : "Nuevo Cliente - ByteStore"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
            <Input label="Empresa / Persona *" name="nombre" value={form.nombre} onChange={f("nombre")} placeholder="Ej. TechSol S.A." error={formError.nombre} />
            <Input label="Contacto" name="contacto" value={form.contacto} onChange={f("contacto")} placeholder="Nombre del contacto" />
          </div>
          <Input label="Email" name="email" type="email" value={form.email} onChange={f("email")} placeholder="cliente@email.com" />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
            <Input label="Teléfono" name="telefono" value={form.telefono} onChange={f("telefono")} placeholder="Ej. 477 123 4567" />
            <Input label="RFC" name="rfc" value={form.rfc} onChange={f("rfc")} placeholder="RFC" />
          </div>
          <Input label="Dirección" name="direccion" value={form.direccion} onChange={f("direccion")} placeholder="Dirección completa" />
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Tipo</label>
              <select value={form.tipo} onChange={f("tipo")} style={{ ...selectStyle, width: "100%" }}>
                <option value="B2B">B2B</option>
                <option value="B2C">B2C</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Estado</label>
              <select value={String(form.activo)} onChange={e => setForm({ ...form, activo: e.target.value === "true" })} style={{ ...selectStyle, width: "100%" }}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>CANCELAR</Button>
            <Button onClick={handleSave}>{editingClient ? "ACTUALIZAR" : "Crear Cliente"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}