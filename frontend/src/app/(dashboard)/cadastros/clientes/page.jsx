"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ClientesTable } from "@/components/clientes/clientes-table";
import { ClienteForm } from "@/components/clientes/cliente-form";
import {
  readAll as readClientes,
  deleteRecord as deleteCliente,
} from "@/services/clienteService";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientesPage() {
  const { token } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);

  const fetchClientes = async () => {
    try {
      const data = await readClientes(token);
      setClientes(data);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [token]);

  const handleAdd = () => {
    setEditingCliente(null);
    setIsFormOpen(true);
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setIsFormOpen(true);
  };

  const handleDelete = async (cliente) => {
    if (confirm(`Confirma exclusão do cliente "${cliente.nome}"?`)) {
      try {
        await deleteCliente(cliente.id, token);
        fetchClientes();
      } catch (err) {
        console.error("Erro ao excluir cliente:", err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Clientes</h1>
        <Button onClick={handleAdd}>Adicionar Cliente</Button>
      </div>

      <ClientesTable
        data={clientes}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ClienteForm
        open={isFormOpen}
        setOpen={setIsFormOpen}
        initialData={editingCliente}
        onSuccess={fetchClientes}
      />
    </div>
  );
}
