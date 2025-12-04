"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Loader2, Package, Building2, Download, RefreshCw, Store, Filter } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { getEstoqueCompleto } from "@/services/estoqueService"; 
import { getSolicitacoes } from "@/services/solicitacaoService"; // Importação Nova
import { useAuth } from "@/contexts/AuthContext";

export default function EstoquePage() {
  const [estoque, setEstoque] = useState([]);
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState([]); // Novo Estado
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroLoja, setFiltroLoja] = useState("todas");
  const { token } = useAuth();

  const carregarDados = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [estoqueData, solicitacoesData] = await Promise.all([
        getEstoqueCompleto(token),
        getSolicitacoes(token)
      ]);

      setEstoque(Array.isArray(estoqueData) ? estoqueData : []);
      
      // Filtra apenas solicitações que afetam o estoque (Pendentes)
      const pendentes = Array.isArray(solicitacoesData) 
        ? solicitacoesData.filter(s => s.status === 'Pendente')
        : [];
      setSolicitacoesPendentes(pendentes);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [token]);

  // Cálculo de estoque comprometido por produto
  const getComprometido = (produtoId, lojaId) => {
    // Se for a Matriz (assumindo ID 1), somamos o que as filiais pediram
    // Se quiser ver o comprometido de uma filial específica, a lógica seria outra (vendas pendentes, etc)
    // Aqui focamos na Matriz abastecendo as filiais.
    
    // Verifica se a loja atual da linha é a Matriz (ajuste a condição conforme seu ID de matriz)
    const isMatriz = lojaId === 1; 

    if (!isMatriz) return 0;

    let totalComprometido = 0;
    solicitacoesPendentes.forEach(req => {
      req.itens?.forEach(item => {
        if (item.produto_id === produtoId) {
          totalComprometido += Number(item.quantidade_solicitada);
        }
      });
    });
    return totalComprometido;
  };

  const lojas = useMemo(() => {
    const nomes = estoque.map(item => item.loja_nome || item.loja?.nome).filter(Boolean);
    const listaUnica = Array.from(new Set(nomes));
    return listaUnica.sort();
  }, [estoque]);

  const estoqueFiltrado = useMemo(() => {
    const termo = busca.toLowerCase();
    return estoque.filter(item => {
      const nomeProduto = (item.produto_nome || item.produto?.nome || "").toLowerCase();
      const sku = (item.sku || item.produto?.sku || "").toLowerCase();
      const nomeLoja = (item.loja_nome || item.loja?.nome || "");
      return (nomeProduto.includes(termo) || sku.includes(termo)) && (filtroLoja === "todas" || nomeLoja === filtroLoja);
    });
  }, [estoque, busca, filtroLoja]);

  const resumo = useMemo(() => {
    const totalItens = estoqueFiltrado.reduce((acc, item) => acc + Number(item.quantidade || 0), 0);
    const produtosUnicos = new Set(estoqueFiltrado.map(i => i.sku || i.produto?.sku)).size;
    const lojasAtivas = new Set(estoqueFiltrado.map(i => i.loja_nome || i.loja?.nome)).size;
    return { totalItens, lojasAtivas, produtosUnicos };
  }, [estoqueFiltrado]);

  return (
    <div className="space-y-6 p-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Visão Geral de Estoque
          </h1>
          <p className="text-muted-foreground">Monitoramento de saldo e itens comprometidos em pedidos.</p>
        </div>
        <Button variant="outline" onClick={carregarDados} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </div>

      {/* Cards de Resumo (Mantidos) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total de Itens</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{resumo.totalItens}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Lojas Listadas</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{resumo.lojasAtivas}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Produtos Únicos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{resumo.produtosUnicos}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Inventário da Rede</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar produto..." className="pl-9" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <div className="w-full md:w-[280px]">
              <Select value={filtroLoja} onValueChange={setFiltroLoja}>
                <SelectTrigger><SelectValue placeholder="Todas as Lojas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Lojas</SelectItem>
                  {lojas.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loja</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Físico</TableHead>
                  <TableHead className="text-center">Comprometido</TableHead>
                  <TableHead className="text-center">Disponível</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Carregando...</TableCell></TableRow>
                ) : estoqueFiltrado.map((item, idx) => {
                    const qtd = Number(item.quantidade || 0);
                    const comprometido = getComprometido(item.produto_id, item.loja_id);
                    const disponivel = qtd - comprometido;
                    
                    // Status Visual
                    let statusBadge = <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20">Normal</Badge>;
                    if (disponivel <= 0) statusBadge = <Badge variant="destructive">Crítico</Badge>;
                    else if (disponivel < 5) statusBadge = <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Baixo</Badge>;

                    return (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.loja_nome || item.loja?.nome}</TableCell>
                        <TableCell>
                          <div>{item.produto_nome || item.produto?.nome}</div>
                          <div className="text-xs text-muted-foreground font-mono">{item.sku || item.produto?.sku}</div>
                        </TableCell>
                        <TableCell className="text-center font-bold">{qtd}</TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {comprometido > 0 ? <span className="text-amber-600 font-semibold">-{comprometido}</span> : "-"}
                        </TableCell>
                        <TableCell className="text-center font-bold text-primary">
                          {disponivel}
                        </TableCell>
                        <TableCell className="text-center">{statusBadge}</TableCell>
                      </TableRow>
                    );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}