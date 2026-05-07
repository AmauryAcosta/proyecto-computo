import { useState, useEffect } from "react";
import { getUsers, createUser, updateUser, toggleUser, deleteUser } from "../../api/users";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../components/ui/Toast";

const emptyForm = { usuario: "", password: "", nombre: "", apellido: "", email: "", roleId: "" };

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

export default function UserList({ onAction }) {
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
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
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

  useEffect(() => { fetchUsers(); }, [page]);

useEffect(() => {
  const handler = () => handleNew();
  document.addEventListener("openNewUser", handler);
  return () => document.removeEventListener("openNewUser", handler);
}, []);

  const activos = users.filter(u => u.activo).length;
  const inactivos = users.filter(u => !u.activo).length;

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.usuario?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.nombre?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    const matchStatus = !filterStatus || String(u.activo) === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

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

  const columns = [{
    key: "usuario", label: "Usuario",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar nombre={row.nombre} />
          <span style={{ fontWeight: "500" }}>{row.usuario}</span>
        </div>
      )
    },{ 
      key: "email", label: "Email" }, {
      key: "role", label: "Rol",
      render: (row) => row.role ? (
        <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600", background: "#dcfce7", color: "#15803d" }}>
          {row.role}
        </span>
      ) : "—"
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
      <div style={{ background: "linear-gradient(135deg, #1b4332, #2d6a4f)", borderRadius: "12px", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", color: "white" }}>
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Gestión de Usuario</h3>
          <p style={{ fontSize: "13px", opacity: 0.8, margin: "4px 0 0" }}>{total} usuarios registrados · {activos} activos · {inactivos} inactivos</p>
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

      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #d1d5db", borderRadius: "8px", padding: "7px 12px", background: "white", flex: 1, minWidth: "160px" }}>
          <span style={{ color: "#9ca3af" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar Usuario" style={{ border: "none", outline: "none", fontSize: "13px", color: "#374151", width: "50%", background: "transparent" }} />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={selectStyle}>
          <option value="">Todos los roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
          <option value="">Todos los estados</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
        
      </div>
      {loading ? (
        <div style={{ padding: "40px", display: "flex", justifyContent: "center" }}><Spinner /></div>
      ) : (
        <Table columns={columns} data={filtered} />
      )}

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", padding: "0 4px" }}>
          <span style={{ fontSize: "13px", color: "#40916c" }}>Mostrando {(page-1)*limit+1} - {Math.min(page*limit, total)} de {total} Usuarios</span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button disabled={page===1} onClick={() => setPage(p=>p-1)} style={{ ...selectStyle, padding: "5px 10px" }}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i+1)} style={{ ...selectStyle, padding: "5px 10px", background: page===i+1 ? "#1b4332" : "white", color: page===i+1 ? "white" : "#374151" }}>{i+1}</button>
            ))}
            <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} style={{ ...selectStyle, padding: "5px 10px" }}>›</button>
          </div>
        </div>
      )}
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
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Rol</label>
              <select value={form.roleId} onChange={f("roleId")} style={{ ...selectStyle, width: "100%" }}>
                <option value="">Seleccionar rol</option>
                <option value="role_admin">ADMIN</option>
                <option value="role_user">USER</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>Estado</label>
              <select value={form.activo ?? true} onChange={e => setForm({ ...form, activo: e.target.value === "true" })} style={{ ...selectStyle, width: "100%" }}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>CANCELAR</Button>
            <Button onClick={handleSave}>{editingUser ? "ACTUALIZAR" : "Crear Usuario"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}