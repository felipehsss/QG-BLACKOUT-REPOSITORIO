"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";
import * as funcionarioService from "@/services/funcionarioService";

// Importamos os componentes novos que criamos
import { FuncionariosTable } from "@/components/funcionarios/funcionarios-table";
import { FuncionarioForm } from "@/components/funcionarios/funcionario-form";

export default function FuncionariosPage() {
  const { token } = useAuth();
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para controlar o Modal de Adicionar/Editar
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState(null);

  // Carrega dados ao iniciar
  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await funcionarioService.readAll(token);
      setFuncionarios(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar funcionários.");
    } finally {
      setLoading(false);
    }
  };

  // Função chamada ao clicar em "Adicionar"
  const handleAdd = () => {
    setEditingFuncionario(null); // Garante que não há dados antigos
    setIsDialogOpen(true);       // Abre o modal
  };

  // Função chamada ao clicar em "Editar" na tabela
  const handleEdit = (funcionario) => {
    setEditingFuncionario(funcionario);
    setIsDialogOpen(true);
  };

  // Função chamada ao clicar em "Excluir" na tabela
  const handleDelete = async (id) => {
    try {
      await funcionarioService.deleteRecord(id, token);
      toast.success("Funcionário excluído com sucesso!");
      loadData(); // Recarrega a lista
    } catch (error) {
      toast.error("Erro ao excluir funcionário.");
    }
  };

  // Função chamada quando o formulário salva com sucesso
  const handleSuccess = () => {
    setIsDialogOpen(false);
    loadData();
  };

  // Filtro de busca
  const filteredData = funcionarios.filter((f) =>
    f.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" /> Funcionários
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe, acessos e perfis.
          </p>
        </div>
        
        {/* BOTÃO DE ADICIONAR - Agora funciona! */}
        <Button onClick={handleAdd} size="lg">
          <Plus className="mr-2 h-5 w-5" /> Novo Funcionário
        </Button>
      </div>

      {/* Barra de Busca */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabela de Funcionários (O componente que criamos antes) */}
      {loading ? (
        <div className="text-center py-10">Carregando...</div>
      ) : (
        <FuncionariosTable 
          data={filteredData} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      {/* Modal de Formulário (Controlado por esta página) */}
      <FuncionarioForm
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
        initialData={editingFuncionario}
        onSuccess={handleSuccess}
      />
    </div>
  );
}