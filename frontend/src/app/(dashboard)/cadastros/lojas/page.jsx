"use client";

import { useEffect, useState } from "react";
import { Plus, RotateCcw, LayoutGrid, LayoutList } from "lucide-react"; // Novos ícones importados
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Opcional, mas usaremos botões simples para o toggle

// Componentes
import { LojasTable } from "@/components/lojas/lojas-table";
import { LojaForm } from "@/components/lojas/loja-form";

// Serviços
import { readAll, deleteRecord } from "@/services/lojaService";
import { useAuth } from "@/contexts/AuthContext";

export default function LojasPage() {
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoja, setEditingLoja] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'

  const { token } = useAuth();

  const loadLojas = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await readAll(token);
      setLojas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar lojas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLojas();
  }, [token]);

  const handleCreate = () => {
    setEditingLoja(null);
    setIsModalOpen(true);
  };

  const handleEdit = (loja) => {
    setEditingLoja(loja);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir esta loja?")) {
      try {
        await deleteRecord(id, token);
        toast.success("Loja excluída com sucesso!");
        loadLojas();
      } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir loja.");
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    loadLojas();
    toast.success(editingLoja ? "Loja atualizada!" : "Loja cadastrada!");
  };

  return (
    <div className="space-y-6 p-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Lojas</h1>
          <p className="text-muted-foreground">
            Administre as filiais e unidades da sua rede.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Toggle de Visualização */}
          <div className="flex items-center border rounded-md bg-background mr-2">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode('table')}
              title="Modo Tabela"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode('grid')}
              title="Modo Card"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="icon" onClick={loadLojas} title="Recarregar">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nova Loja
          </Button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Unidades Cadastradas</CardTitle>
          <CardDescription>
            {lojas.length} lojas encontradas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LojasTable 
            data={lojas} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            viewMode={viewMode} // Passando o modo de visualização
          />
        </CardContent>
      </Card>

      {/* MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLoja ? "Editar Loja" : "Nova Loja"}</DialogTitle>
            <DialogDescription>Preencha os dados da unidade.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <LojaForm 
              initialData={editingLoja} 
              onSuccess={handleFormSuccess} 
              onCancel={() => setIsModalOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}