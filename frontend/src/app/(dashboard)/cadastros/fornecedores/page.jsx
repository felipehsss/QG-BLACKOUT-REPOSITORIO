"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Truck, Loader2 } from "lucide-react";
import {
  readAll as readAllFornecedores,
  deleteRecord as deleteFornecedor,
} from "@/services/fornecedorService";
import { FornecedoresTable } from "@/components/fornecedores/fornecedores-table";
import { FornecedorForm } from "@/components/fornecedores/fornecedor-form";
import { useAuth } from "@/contexts/AuthContext";

export default function FornecedoresPage() {
  const { token } = useAuth();
  const [fornecedores, setFornecedores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);

  const fetchFornecedores = async () => {
    setIsLoading(true);
    try {
      if (!token) return;
      const list = await readAllFornecedores(token);
      setFornecedores(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Erro ao buscar fornecedores:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchFornecedores();
  }, [token]);

  const handleEdit = (fornecedor) => {
    setEditingFornecedor(fornecedor);
    setIsFormOpen(true);
  };

  const handleDelete = async (fornecedor) => {
    const nome = fornecedor.nome ?? fornecedor.razao_social ?? "fornecedor";
    if (!confirm(`Confirma exclusão de "${nome}" ?`)) return;

    try {
      const id = fornecedor.id ?? fornecedor.fornecedor_id;
      if (!id) throw new Error("ID do fornecedor não encontrado.");
      await deleteFornecedor(id, token);
      fetchFornecedores();
    } catch (err) {
      console.error("Erro ao excluir fornecedor:", err);
    }
  };

  const handleFormSuccess = () => {
    setEditingFornecedor(null);
    setIsFormOpen(false);
    fetchFornecedores();
  };

  return (
    <>
      {/* Modal de cadastro/edição */}
      <FornecedorForm
        open={isFormOpen}
        setOpen={(v) => {
          setIsFormOpen(v);
          if (!v) setEditingFornecedor(null);
        }}
        onSuccess={handleFormSuccess}
        initialData={editingFornecedor}
      />

      <div className="flex flex-col gap-4">
        {/* Cabeçalho da página */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Gestão de Fornecedores
            </h1>
            <p className="text-muted-foreground">
              Mantenha um registro centralizado dos seus fornecedores.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingFornecedor(null);
              setIsFormOpen(true);
            }}
          >
            Adicionar Fornecedor
          </Button>
        </div>

        {/* Card com tabela */}
        <Card>
          
      
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : fornecedores.length > 0 ? (
              <FornecedoresTable
                data={fornecedores}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Truck className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  Nenhum fornecedor cadastrado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Comece adicionando seu primeiro fornecedor.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setEditingFornecedor(null);
                    setIsFormOpen(true);
                  }}
                >
                  Adicionar Fornecedor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
