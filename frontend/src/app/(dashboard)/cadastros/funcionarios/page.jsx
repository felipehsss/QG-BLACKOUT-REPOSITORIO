"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Users, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Componentes da feature
import { FuncionariosTable } from "@/components/funcionarios/funcionarios-table";
import { FuncionarioForm } from "@/components/funcionarios/funcionario-form";

// Serviços e Contexto
import { readAll, deleteRecord } from "@/services/funcionarioService";
import { useAuth } from "@/contexts/AuthContext";

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para controle do Modal e Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState(null);
  
  // Estado do Filtro
  const [searchTerm, setSearchTerm] = useState("");
  
  const { token } = useAuth();

  // --- Carregar Dados ---
  const loadFuncionarios = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await readAll(token);
      setFuncionarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFuncionarios();
  }, [token]);

  // --- Handlers de Ação ---

  // Abrir modal para CRIAR
  const handleCreate = () => {
    setEditingFuncionario(null); // Limpa edição
    setIsModalOpen(true);
  };

  // Abrir modal para EDITAR (Recebe o funcionário da tabela)
  const handleEdit = (funcionario) => {
    setEditingFuncionario(funcionario); // Define quem será editado
    setIsModalOpen(true);
  };


// Função de EXCLUIR
  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      try {
        await deleteRecord(id, token);
        toast.success("Funcionário excluído com sucesso!");
        loadFuncionarios();
      } catch (error) {
        console.error("Erro ao excluir:", error);
        
        // Verifica se a mensagem de erro contém o texto de restrição de chave estrangeira
        const msg = error.message || "";
        
        if (msg.includes("foreign key") || msg.includes("Cannot delete")) {
            toast.error("Não é possível excluir: Este funcionário tem registros vinculados (Vendas ou Caixa). Edite e mude o status para 'Inativo'.", {
              duration: 5000,
            });
        } else {
            toast.error("Erro ao excluir funcionário. Tente novamente.");
        }
      }
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    loadFuncionarios();
    toast.success(editingFuncionario ? "Funcionário atualizado!" : "Funcionário cadastrado!");
  };

  // --- Lógica de Filtro ---
  const filteredFuncionarios = funcionarios.filter((func) => {
    const term = searchTerm.toLowerCase();
    const nome = func.nome_completo?.toLowerCase() || "";
    const email = func.email?.toLowerCase() || "";
    const cpf = func.cpf || "";

    return nome.includes(term) || email.includes(term) || cpf.includes(term);
  });

  return (
    <div className="space-y-6 p-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Funcionários
          </h1>
          <p className="text-muted-foreground">
            Gerencie o acesso, dados e status da sua equipe.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadFuncionarios} title="Recarregar tabela">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Novo Funcionário
          </Button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Listagem de Colaboradores</CardTitle>
          <CardDescription>
            Visualize métricas e gerencie os registros ativos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Barra de Pesquisa */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF ou email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="rounded-md ">
            <FuncionariosTable 
              data={filteredFuncionarios} 
              onEdit={handleEdit}     // <--- ESSENCIAL PARA O BOTÃO EDITAR FUNCIONAR
              onDelete={handleDelete} // <--- ESSENCIAL PARA O BOTÃO EXCLUIR FUNCIONAR
            />
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Mostrando {filteredFuncionarios.length} de {funcionarios.length} registros
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFuncionario ? "Editar Funcionário" : "Novo Funcionário"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo. Campos obrigatórios estão marcados.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2">
            <FuncionarioForm 
              funcionario={editingFuncionario} // Passa os dados se for edição
              onSuccess={handleFormSuccess} 
              onCancel={() => setIsModalOpen(false)} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}