import { useState, useEffect } from "react";
import { getUsers, createUser, updateUser, toggleUser, deleteUser } from "../../api/users";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";

const emptyForm = { usuario: "", password: "", nombre: "", apellido: "", email: "", roleId: "role_admin" };

export default function UserList() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const limit = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(page, limit);
      setUsers(data.items);
      setTotal(data.total);
    } catch {
      toast("Error al cargar usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const activos = users.filter(u => u.activo).length;
  const inactivos = users.filter(u => !u.activo).length;

  const filtered = users.filter(u =>
    u.usuario?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  const handleNew = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError({});
    setModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ usuario: user.usuario, password: "", nombre: user.nombre, apellido: user.apellido || "", email: user.email, roleId: user.roleId });
    setFormError({});
    setModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.usuario.trim()) errors.usuario = "Requerido";
    if (!editingUser && !form.password.trim()) errors.password = "Requerido";
    if (!form.nombre.trim()) errors.nombre = "Requerido";
    if (!form.email.trim()) errors.email = "Requerido";
    return errors;
  };

  const handleSave = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFormError(errors); return; }
    try {
      const payload = { ...form };
      if (editingUser && !payload.password) delete payload.password;
      if (editingUser) {
        await updateUser(editingUser.id, payload);
        toast("Usuario actualizado correctamente", "success");
      } else {
        await createUser(payload);
        toast("Usuario creado correctamente", "success");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast(err.response?.data?.message || "Error al guardar", "error");
    }
  };

  const handleToggle = async (user) => {
    try {
      await toggleUser(user.id);
      toast(`Usuario ${user.activo ? "desactivado" : "activado"}`, "success");
      fetchUsers();
    } catch {
      toast("Error al cambiar estado", "error");
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`¿Eliminar a ${user.nombre}?`)) return;
    try {
      await deleteUser(user.id);
      toast("Usuario eliminado", "success");
      fetchUsers();
    } catch {
      toast("Error al eliminar", "error");
    }
  };

  const columns = [
    { key: "usuario", label: "Usuario" },
    { key: "nombre", label: "Nombre", render: (row) => `${row.nombre} ${row.apellido || ""}` },
    { key: "email", label: "Email" },
    { key: "role", label: "Rol" },
    {
      key: "activo", label: "Estado",
      render: (row) => (
        <span style={{
          padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600",
          background: row.activo ? "#dcfce7" : "#fee2e2",
          color: row.activo ? "#15803d" : "#dc2626",
        }}>
          {row.activo ? "Activo" : "Inactivo"}
        </span>
      )
    },
    {
      key: "acciones", label: "Acciones",
      render: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button variant="secondary" onClick={() => handleEdit(row)}>Editar</Button>
          <Button variant="secondary" onClick={() => handleToggle(row)}>
            {row.activo ? "Desactivar" : "Activar"}
          </Button>
          <Button variant="danger" onClick={() => handleDelete(row)}>Eliminar</Button>
        </div>
      )
    },
  ];

  const totalPages = Math.ceil(total / limit);
  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    // TODO: envolver en AppLayout cuando Amaury lo suba
    <div style={{ padding: "24px", background: "#f0fdf4", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#1b4332" }}>Usuarios</h1>
        <Button onClick={handleNew}>+ Nuevo Usuario</Button>
      </div>

      {/* Card stats */}
      <div style={{
        background: "linear-gradient(135deg, #1b4332, #2d6a4f)",
        borderRadius: "12px", padding: "20px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "20px", color: "white",
      }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Gestión de Usuario</h2>
          <p style={{ fontSize: "13px", opacity: 0.8, margin: "4px 0 0" }}>
            {total} usuarios registrados · {activos} activos · {inactivos} inactivos
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "8px", padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "700" }}>{activos}</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Activos</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "8px", padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "700" }}>3</div>
            <div style={{ fontSize: "11px", opacity: 0.8 }}>Roles</div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: "16px" }}>
        <Input
          name="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Buscar usuario..."
        />
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}>
          <Spinner />
        </div>
      ) : (
        <Table columns={columns} data={filtered} />
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
          <Button variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</Button>
          <span style={{ color: "#374151", alignSelf: "center", fontSize: "13px" }}>
            Página {page} de {totalPages}
          </span>
          <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Siguiente →</Button>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? "Editar Usuario - ByteStore" : "Nuevo Usuario - ByteStore"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input label="Nombre Completo" name="nombre" value={form.nombre} onChange={f("nombre")} placeholder="Ej. Juan Perez" error={formError.nombre} />
            <Input label="Usuario" name="usuario" value={form.usuario} onChange={f("usuario")} placeholder="Juan P" error={formError.usuario} />
          </div>
          <Input label="Email" name="email" type="email" value={form.email} onChange={f("email")} placeholder="juanp@outlook.com" error={formError.email} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input label={editingUser ? "Nueva contraseña (opcional)" : "Contraseña"} name="password" type="password" value={form.password} onChange={f("password")} placeholder="••••••••" error={formError.password} />
            <Input label="Confirmar" name="confirmar" type="password" value={form.confirmar || ""} onChange={f("confirmar")} placeholder="••••••••" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#6ee7b7" }}>Rol</label>
              <select value={form.roleId} onChange={f("roleId")}
                style={{ background: "#0f3d3d", border: "1px solid #065f46", borderRadius: "6px", padding: "8px 12px", color: "white", fontSize: "14px" }}>
                <option value="">Seleccionar rol</option>
                <option value="role_admin">ADMIN</option>
                <option value="role_user">USER</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#6ee7b7" }}>Estado</label>
              <select value={form.activo ?? true} onChange={e => setForm({ ...form, activo: e.target.value === "true" })}
                style={{ background: "#0f3d3d", border: "1px solid #065f46", borderRadius: "6px", padding: "8px 12px", color: "white", fontSize: "14px" }}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingUser ? "Actualizar" : "Crear Usuario"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}