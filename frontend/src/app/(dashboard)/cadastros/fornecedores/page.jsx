"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Truck, 
  Loader2, 
  Plus, 
  Search, 
  Users, 
  Mail, 
  Phone 
} from "lucide-react";

import {
  readAll as readAllFornecedores,
  deleteRecord as deleteFornecedor,
} from "@/services/fornecedorService";

import { FornecedoresTable } from "@/components/fornecedores/fornecedores-table";
import { FornecedorForm } from "@/components/fornecedores/fornecedor-form";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function FornecedoresPage() {
  const { token } = useAuth();
  const [fornecedores, setFornecedores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para Filtros
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para CRUD
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);

  const fetchFornecedores = async () => {
    setIsLoading(true);
    try {
      if (!token) return;
      const list = await readAllFornecedores(token);
      setFornecedores(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error("Erro ao carregar lista de fornecedores.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFornecedores();
  }, [token]);

  // --- Lógica de Filtro e Dados ---
  
  const filteredData = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();
    return fornecedores.filter((f) => {
      const nome = (f.nome || f.razao_social || "").toLowerCase();
      const cnpj = (f.cnpj || "").replace(/\D/g, ""); // busca números puros também
      const email = (f.email || "").toLowerCase();
      
      return (
        nome.includes(lowerTerm) ||
        f.cnpj?.includes(lowerTerm) ||
        cnpj.includes(lowerTerm) ||
        email.includes(lowerTerm)
      );
    });
  }, [fornecedores, searchTerm]);

  const kpis = useMemo(() => {
    return {
      total: fornecedores.length,
      comEmail: fornecedores.filter(f => f.email && f.email.trim() !== "").length,
      comTelefone: fornecedores.filter(f => f.telefone && f.telefone.trim() !== "").length,
    };
  }, [fornecedores]);

  // --- CRUD Handlers ---
  const handleEdit = (fornecedor) => {
    setEditingFornecedor(fornecedor);
    setIsFormOpen(true);
  };

  const handleDelete = async (fornecedor) => {
    if (!confirm(`Excluir ${fornecedor.nome || fornecedor.razao_social}?`)) return;
    try {
      const id = fornecedor.id || fornecedor.fornecedor_id;
      await deleteFornecedor(id, token);
      toast.success("Fornecedor excluído com sucesso.");
      fetchFornecedores();
    } catch (err) {
      toast.error("Erro ao excluir fornecedor.");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Fornecedores</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus parceiros comerciais.
            </p>
          </div>
          <Button onClick={() => { setEditingFornecedor(null); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
          </Button>
        </div>

        {/* KPIs / Dados Rápidos */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrado</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.total}</div>
              <p className="text-xs text-muted-foreground">Fornecedores ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Contato (Email)</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.comEmail}</div>
              <p className="text-xs text-muted-foreground">
                {((kpis.comEmail / (kpis.total || 1)) * 100).toFixed(0)}% da base
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Telefone</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpis.comTelefone}</div>
              <p className="text-xs text-muted-foreground">Para contato rápido</p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Filtros */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CNPJ ou email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lista */}
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando fornecedores...</p>
              </div>
            ) : (
              <FornecedoresTable
                data={filteredData}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Cadastro */}
      <FornecedorForm
        open={isFormOpen}
        setOpen={setIsFormOpen}
        onSuccess={() => { setIsFormOpen(false); fetchFornecedores(); }}
        initialData={editingFornecedor}
      />
    </>
  );
}