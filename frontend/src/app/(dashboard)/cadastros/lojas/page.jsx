"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LojasTable } from "@/components/lojas/lojas-table";
import { LojaForm } from "@/components/lojas/loja-form";
import { useAuth } from "@/contexts/AuthContext";
import { readAll, deleteRecord } from "@/services/lojaService";
import { toast } from "sonner";

export default function LojasPage() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await readAll(token);
      setData(result || []);
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
      toast.error("Erro ao carregar lista de lojas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir esta loja?")) {
      try {
        await deleteRecord(id, token);
        toast.success("Loja excluída com sucesso!");
        loadData();
      } catch (error) {
        toast.error("Erro ao excluir loja.");
      }
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" /> Lojas & Filiais
          </h1>
          <p className="text-muted-foreground">
            Gerencie as unidades da sua rede.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nova Loja
          </Button>
        </div>
      </div>

      <LojasTable 
        data={data} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Loja" : "Cadastrar Nova Loja"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações da unidade abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <LojaForm
            loja={editingItem}
            onSuccess={handleSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}