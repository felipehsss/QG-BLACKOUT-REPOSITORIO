"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ClientesTable } from "@/components/clientes/clientes-table";
import { ClienteForm } from "@/components/clientes/cliente-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ShoppingBag } from "lucide-react";

import {
  readAll as readClientes,
  deleteRecord as deleteCliente,
} from "@/services/clienteService";
import { readByCliente as readVendasCliente } from "@/services/vendaService"; // Importe o serviço de vendas
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ClientesPage() {
  const { token } = useAuth();
  
  // Estados de Clientes
  const [clientes, setClientes] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);

  // Estados do Histórico
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [clientHistory, setClientHistory] = useState([]);
  const [selectedClientName, setSelectedClientName] = useState("");

  const fetchClientes = async () => {
    if (!token) return;
    try {
      const data = await readClientes(token);
      setClientes(data || []);
    } catch (err) {
      const errorMessage = err.message || "Erro ao carregar clientes.";
      console.error("Erro ao carregar clientes:", err);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [token]);

  // --- CRUD Operations ---
  const handleAdd = () => {
    setEditingCliente(null);
    setIsFormOpen(true);
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setIsFormOpen(true);
  };

  const handleDelete = async (cliente) => {
    if (!confirm(`Confirma exclusão do cliente "${cliente.nome}"?`)) {
      return;
    }
    try {
      const id = cliente.id ?? cliente.id_cliente;
      await deleteCliente(id, token);
      toast.success("Cliente excluído com sucesso!");
      fetchClientes();
    } catch (err) {
      const errorMessage = err.message || "Erro ao excluir cliente.";
      console.error("Erro ao excluir cliente:", err);
      toast.error(errorMessage);
    }
  };

  // --- Lógica do Histórico ---
  const handleViewHistory = async (cliente) => {
    const id = cliente.id ?? cliente.id_cliente;
    setSelectedClientName(cliente.nome);
    setIsHistoryOpen(true);
    setHistoryLoading(true);
    setClientHistory([]);

    try {
      const vendas = await readVendasCliente(id, token);
      setClientHistory(vendas || []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar histórico de compras.");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Formatadores
  const formatCurrency = (val) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Clientes</h1>
        <Button onClick={handleAdd}>Adicionar Cliente</Button>
      </div>

      {/* Tabela Principal */}
      {/* IMPORTANTE: Você precisa passar a prop onViewHistory para o componente ClientesTable funcionar se ele já tiver o botão, 
          ou adicionar o botão no ClientesTable chamando esta função */}
      <ClientesTable
        data={clientes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewHistory={handleViewHistory} // Passe a função aqui
      />

      {/* Modal de Cadastro/Edição */}
      <ClienteForm
        open={isFormOpen}
        setOpen={setIsFormOpen}
        initialData={editingCliente}
        onSuccess={fetchClientes}
      />

      {/* Modal de Histórico de Compras */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Histórico de Compras
            </DialogTitle>
            <DialogDescription>
              Compras realizadas por <strong>{selectedClientName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : clientHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma compra encontrada para este cliente.
              </div>
            ) : (
              <ScrollArea className="h-[300px] border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID Venda</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientHistory.map((venda) => (
                      <TableRow key={venda.venda_id}>
                        <TableCell className="font-medium">#{venda.venda_id}</TableCell>
                        <TableCell>{formatDate(venda.data_venda)}</TableCell>
                        <TableCell>
                          <Badge variant={venda.status_venda === 'Concluída' ? 'default' : 'secondary'}>
                            {venda.status_venda}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(venda.valor_total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}