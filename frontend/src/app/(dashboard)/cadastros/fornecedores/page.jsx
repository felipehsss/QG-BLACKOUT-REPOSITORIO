"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"; // Mudança de Dialog para Sheet
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Truck, 
  Loader2, 
  BarChart3, 
  Package, 
  DollarSign, 
  AlertCircle,
  FileText,
  Calendar
} from "lucide-react";

import {
  readAll as readAllFornecedores,
  deleteRecord as deleteFornecedor,
  getRelatorio 
} from "@/services/fornecedorService";

import { FornecedoresTable } from "@/components/fornecedores/fornecedores-table";
import { FornecedorForm } from "@/components/fornecedores/fornecedor-form";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function FornecedoresPage() {
  const { token } = useAuth();
  const [fornecedores, setFornecedores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para CRUD
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);

  // Estados para Relatório (Sheet)
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isReportLoading, setIsReportLoading] = useState(false);

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
      toast.success("Fornecedor excluído.");
      fetchFornecedores();
    } catch (err) {
      toast.error("Erro ao excluir.");
    }
  };

  // --- Report Handler ---
  const handleViewReport = async (fornecedor) => {
    setIsReportOpen(true);
    setIsReportLoading(true);
    setReportData(null); // Limpa dados anteriores
    try {
      const id = fornecedor.id || fornecedor.fornecedor_id;
      const data = await getRelatorio(id, token);
      setReportData(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar relatório do fornecedor.");
    } finally {
      setIsReportLoading(false);
    }
  };

  const formatCurrency = (val) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fornecedores</h1>
            <p className="text-muted-foreground">Gerencie parceiros e visualize relatórios financeiros.</p>
          </div>
          <Button onClick={() => { setEditingFornecedor(null); setIsFormOpen(true); }}>
            <Truck className="mr-2 h-4 w-4" /> Novo Fornecedor
          </Button>
        </div>

        {/* Lista */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : (
              <FornecedoresTable
                data={fornecedores}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewReport={handleViewReport} 
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Cadastro (Mantido como Dialog ou Sheet conforme sua preferência, aqui mantive o componente original) */}
      <FornecedorForm
        open={isFormOpen}
        setOpen={setIsFormOpen}
        onSuccess={() => { setIsFormOpen(false); fetchFornecedores(); }}
        initialData={editingFornecedor}
      />

      {/* PAINEL LATERAL (SHEET) DE RELATÓRIO */}
      <Sheet open={isReportOpen} onOpenChange={setIsReportOpen}>
        {/* side="right" faz aparecer da direita. w-[400px] sm:w-[540px] controla a largura */}
        <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto">
          <SheetHeader className="pb-4 border-b mb-4">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-5 w-5 text-primary" />
              {reportData ? (reportData.fornecedor.nome || reportData.fornecedor.razao_social) : "Carregando..."}
            </SheetTitle>
            <SheetDescription>
              Resumo detalhado de movimentações e pendências.
            </SheetDescription>
          </SheetHeader>

          {isReportLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Buscando dados no sistema...</p>
            </div>
          ) : reportData ? (
            <div className="space-y-6">
              
              {/* Cards Resumo (Grid de 2 colunas para caber bem na lateral) */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-muted/40">
                  <CardContent className="p-4 flex flex-col justify-center">
                    <span className="text-xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> A Pagar
                    </span>
                    <span className="text-xl font-bold text-red-600 mt-1">
                      {formatCurrency(reportData.financeiro.total_divida)}
                    </span>
                  </CardContent>
                </Card>

                <Card className="bg-muted/40">
                  <CardContent className="p-4 flex flex-col justify-center">
                    <span className="text-xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> Total Histórico
                    </span>
                    <span className="text-xl font-bold text-foreground mt-1">
                      {formatCurrency(reportData.financeiro.total_geral)}
                    </span>
                  </CardContent>
                </Card>

                <Card className="bg-muted/40 col-span-2">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                        <Package className="h-3 w-3" /> Produtos Vinculados
                        </span>
                        <span className="text-xl font-bold mt-1">{reportData.produtos.length}</span>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                        Ver Estoque
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Abas */}
              <Tabs defaultValue="contas" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="contas">Financeiro</TabsTrigger>
                  <TabsTrigger value="produtos">Produtos</TabsTrigger>
                </TabsList>

                {/* ABA FINANCEIRO */}
                <TabsContent value="contas" className="mt-4 space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Contas a Pagar
                  </h4>
                  <ScrollArea className="h-[300px] pr-4">
                    {reportData.financeiro.contas.length > 0 ? (
                      <div className="space-y-2">
                        {reportData.financeiro.contas.map((conta) => (
                          <div key={conta.conta_pagar_id} className="flex flex-col p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium line-clamp-1">{conta.descricao}</span>
                                <Badge variant={conta.status === 'Pago' ? "default" : "destructive"} className="text-[10px] h-5">
                                    {conta.status}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                    <Calendar className="h-3 w-3" /> 
                                    {conta.data_vencimento ? new Date(conta.data_vencimento).toLocaleDateString('pt-BR') : '-'}
                                </span>
                                <span className="font-bold">
                                    {formatCurrency(conta.valor)}
                                </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                        Nenhuma conta registrada para este fornecedor.
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                {/* ABA PRODUTOS */}
                <TabsContent value="produtos" className="mt-4 space-y-4">
                   <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" /> Catálogo
                  </h4>
                  <ScrollArea className="h-[300px] pr-4">
                    {reportData.produtos.length > 0 ? (
                      <div className="space-y-2">
                        {reportData.produtos.map((prod) => (
                          <div key={prod.produto_id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                            <div className="h-10 w-10 bg-muted rounded flex items-center justify-center font-bold text-xs text-muted-foreground">
                                {prod.sku ? prod.sku.slice(0,3) : 'IMG'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{prod.nome}</p>
                                <p className="text-xs text-muted-foreground">{prod.categoria || 'Sem categoria'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-mono">{formatCurrency(prod.preco_custo)}</p>
                                <p className="text-[10px] text-muted-foreground">Custo</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                        Nenhum produto vinculado.
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>

            </div>
          ) : (
            <div className="p-8 text-center text-red-500">Erro ao carregar dados.</div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}