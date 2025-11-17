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
import { Loader2, Wallet } from "lucide-react";
import {
  readAll as readAllContas,
  deleteRecord as deleteConta,
} from "@/services/contaPagarService";
import { ContaPagarForm } from "@/components/financeiro/conta-pagar-form";
import { ContaPagarTable } from "@/components/financeiro/contas-pagar-table"; // tabela que você vai criar
import { useAuth } from "@/contexts/AuthContext";

export default function ContasPagarPage() {
  const { token } = useAuth();
  const [contas, setContas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConta, setEditingConta] = useState(null);

  const fetchContas = async () => {
    setIsLoading(true);
    try {
      if (!token) return;
      const list = await readAllContas(token);
      setContas(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Erro ao buscar contas a pagar:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchContas();
  }, [token]);

  const handleEdit = (conta) => {
    setEditingConta(conta);
    setIsFormOpen(true);
  };

  const handleDelete = async (conta) => {
    const descricao = conta.descricao ?? "conta";
    if (!confirm(`Confirma exclusão de "${descricao}" ?`)) return;

    try {
      const id = conta.id ?? conta.conta_pagar_id;
      if (!id) throw new Error("ID da conta não encontrado.");
      await deleteConta(id, token);
      fetchContas();
    } catch (err) {
      console.error("Erro ao excluir conta:", err);
    }
  };

  const handleFormSuccess = () => {
    setEditingConta(null);
    setIsFormOpen(false);
    fetchContas();
  };

  return (
    <>
      {/* Modal de cadastro/edição */}
      <ContaPagarForm
        open={isFormOpen}
        setOpen={(v) => {
          setIsFormOpen(v);
          if (!v) setEditingConta(null);
        }}
        onSuccess={handleFormSuccess}
        initialData={editingConta}
      />

      <div className="flex flex-col gap-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contas a Pagar</h1>
            <p className="text-muted-foreground">
              Gerencie suas despesas e acompanhe vencimentos.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingConta(null);
              setIsFormOpen(true);
            }}
          >
            Adicionar Conta
          </Button>
        </div>

        {/* Card com tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Contas</CardTitle>
            <CardDescription>
              Visualize e gerencie suas contas a pagar cadastradas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : contas.length > 0 ? (
              <ContaPagarTable
                data={contas}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Wallet className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  Nenhuma conta cadastrada
                </h3>
                <p className="text-sm text-muted-foreground">
                  Comece adicionando sua primeira conta a pagar.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setEditingConta(null);
                    setIsFormOpen(true);
                  }}
                >
                  Adicionar Conta
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
