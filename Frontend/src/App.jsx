import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Spinner from "./components/ui/Spinner";
import Modal from "./components/ui/Modal";
import Table from "./components/ui/Table";
import { useState } from "react";

export default function App() {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState("");

  const cols = [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Email" },
    { key: "actions", label: "Acciones", render: (row) => <Button variant="danger" onClick={() => alert(row.name)}>Eliminar</Button> }
  ];

  const data = [
    { name: "Regina", email: "regina@ug.mx" },
    { name: "Amaury", email: "amaury@ug.mx" },
    { name: "Leonid", email: "leonid@ug.mx" },
  ];

  return (
    <div className="p-8 flex flex-col gap-6">
      <Button onClick={() => setOpen(true)}>Abrir Modal</Button>
      <Input label="Correo" name="email" value={val} onChange={e => setVal(e.target.value)} placeholder="ejemplo@mail.com" />
      <Spinner />
      <Table columns={cols} data={data} />
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Mi Modal">
        <p>Contenido del modal aquí.</p>
      </Modal>
    </div>
  );
}