"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FuncionariosTable } from "@/components/funcionarios/funcionarios-table";
import { FuncionarioForm } from "@/components/funcionarios/funcionario-form";
import { readAll, deleteRecord } from "@/services/funcionarioService";
// 1. Importar o Contexto de Autenticação
import { useAuth } from "@/contexts/AuthContext";

export default function FuncionariosPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState(null);

  // 2. Obter o token do hook useAuth
  const { token } = useAuth();

  const loadData = async () => {
    // Só tenta carregar se tiver token
    if (!token) return;

    setLoading(true);
    try {
      // 3. Passar o token para a função do serviço
      const funcionarios = await readAll(token); 
      setData(funcionarios || []);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      // Não alertar erro se for apenas questão de token carregando
    } finally {
      setLoading(false);
    }
  };

  // Carrega dados ao abrir a página ou quando o token mudar
  useEffect(() => {
    loadData();
  }, [token]); // Adicionado token como dependência

  const handleCreate = () => {
    setEditingFuncionario(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (funcionario) => {
    setEditingFuncionario(funcionario);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      try {
        // 4. Passar o token para excluir
        await deleteRecord(id, token); 
        alert("Funcionário excluído com sucesso!");
        loadData();
      } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir funcionário.");
      }
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground">
            Gerencie o time de colaboradores da sua empresa.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Novo Funcionário
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card p-4">
        <FuncionariosTable 
          data={data} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFuncionario ? "Editar Funcionário" : "Cadastrar Novo Funcionário"}
            </DialogTitle>
            <DialogDescription>
              {editingFuncionario 
                ? "Faça as alterações necessárias e clique em Atualizar." 
                : "Preencha os campos abaixo para adicionar um colaborador ao sistema."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {/* O formulário já vai pegar o token internamente via useAuth também */}
            <FuncionarioForm
              funcionario={editingFuncionario}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}