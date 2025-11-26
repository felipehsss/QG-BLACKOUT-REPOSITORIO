"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Trash2, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Importando os services necessários
import * as produtoService from "@/services/produtoService";
import * as fornecedorService from "@/services/fornecedorService";
import * as produtoFornecedorService from "@/services/produtoFornecedorService";

export default function VinculoProdutoFornecedorPage() {
  const { token } = useAuth();

  // Estados de Carga
  const [loading, setLoading] = React.useState(true);
  const [processing, setProcessing] = React.useState(false);

  // Listas Gerais
  const [produtos, setProdutos] = React.useState([]);
  const [fornecedores, setFornecedores] = React.useState([]);

  // Seleção Atual
  const [produtoSelecionadoId, setProdutoSelecionadoId] = React.useState("");
  const [vinculosAtuais, setVinculosAtuais] = React.useState([]);

  // Formulário de Novo Vínculo
  const [novoVinculo, setNovoVinculo] = React.useState({
    fornecedor_id: "",
    preco_custo: "",
    sku_fornecedor: "",
  });

  // Carregar Produtos e Fornecedores ao abrir a tela
  React.useEffect(() => {
    if (token) {
      Promise.all([
        produtoService.readAll(token),
        fornecedorService.readAll(token),
      ])
        .then(([listaProdutos, listaFornecedores]) => {
          setProdutos(Array.isArray(listaProdutos) ? listaProdutos : []);
          setFornecedores(Array.isArray(listaFornecedores) ? listaFornecedores : []);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Erro ao carregar listas iniciais.");
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  // Quando selecionar um produto, buscar os vínculos dele
  React.useEffect(() => {
    if (produtoSelecionadoId && token) {
      carregarVinculos(produtoSelecionadoId);
    } else {
      setVinculosAtuais([]);
    }
  }, [produtoSelecionadoId, token]);

  const carregarVinculos = async (id) => {
    try {
      const dados = await produtoFornecedorService.getFornecedoresDoProduto(id);
      setVinculosAtuais(Array.isArray(dados) ? dados : []);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar fornecedores do produto.");
    }
  };

  const handleAdicionarVinculo = async (e) => {
    e.preventDefault();
    if (!produtoSelecionadoId || !novoVinculo.fornecedor_id || !novoVinculo.preco_custo) {
      toast.warning("Preencha o produto, o fornecedor e o custo.");
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        produto_id: Number(produtoSelecionadoId),
        fornecedor_id: Number(novoVinculo.fornecedor_id),
        preco_custo: parseFloat(novoVinculo.preco_custo),
        sku_fornecedor: novoVinculo.sku_fornecedor,
      };

      await produtoFornecedorService.linkarFornecedor(payload);
      toast.success("Vínculo salvo com sucesso!");
      
      // Recarrega a tabela e limpa o form
      await carregarVinculos(produtoSelecionadoId);
      setNovoVinculo({ fornecedor_id: "", preco_custo: "", sku_fornecedor: "" });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar vínculo.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoverVinculo = async (fornecedorId) => {
    if (!confirm("Deseja remover este fornecedor da lista deste produto?")) return;
    
    try {
      await produtoFornecedorService.deslinkarFornecedor(produtoSelecionadoId, fornecedorId);
      toast.success("Vínculo removido.");
      carregarVinculos(produtoSelecionadoId);
    } catch (error) {
      toast.error("Erro ao remover.");
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Link2 className="h-8 w-8 text-primary" /> Cotação e Fornecedores
          </h1>
          <p className="text-muted-foreground">
            Gerencie múltiplos fornecedores e preços de custo para um mesmo produto.
          </p>
        </div>
      </div>

      {/* Card de Seleção de Produto */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle>1. Selecione o Produto</CardTitle>
          <CardDescription>Qual item do estoque você deseja configurar?</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex gap-4 items-center">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Select value={produtoSelecionadoId} onValueChange={setProdutoSelecionadoId}>
                    <SelectTrigger className="w-full md:w-[500px]">
                        <SelectValue placeholder="Busque um produto..." />
                    </SelectTrigger>
                    <SelectContent>
                        {produtos.map((p, index) => {
                            // Tratamento de segurança para ID e Key
                            const pId = p.produto_id || p.id; 
                            const pKey = pId ? String(pId) : `prod-${index}`;
                            return (
                                <SelectItem key={pKey} value={String(pId || "")}>
                                    {p.sku || "S/ SKU"} - {p.nome || "Produto Sem Nome"}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>

      {produtoSelecionadoId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Coluna da Esquerda: Formulário de Adição */}
            <div className="md:col-span-1">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-lg">Adicionar Fornecedor</CardTitle>
                        <CardDescription>Vincule um novo fornecedor a este produto.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdicionarVinculo} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Fornecedor</Label>
                                <Select 
                                    value={novoVinculo.fornecedor_id} 
                                    onValueChange={(val) => setNovoVinculo({...novoVinculo, fornecedor_id: val})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fornecedores.map((f, index) => {
                                            // Tratamento de segurança para ID e Key
                                            const fId = f.fornecedor_id || f.id;
                                            const fKey = fId ? String(fId) : `forn-${index}`;
                                            return (
                                                <SelectItem key={fKey} value={String(fId || "")}>
                                                    {f.razao_social || f.nome || "Fornecedor Sem Nome"}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Preço de Custo (R$)</Label>
                                <Input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="0.00"
                                    required
                                    value={novoVinculo.preco_custo}
                                    onChange={(e) => setNovoVinculo({...novoVinculo, preco_custo: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Cód. no Fornecedor (SKU)</Label>
                                <Input 
                                    placeholder="Opcional"
                                    value={novoVinculo.sku_fornecedor}
                                    onChange={(e) => setNovoVinculo({...novoVinculo, sku_fornecedor: e.target.value})}
                                />
                                <p className="text-xs text-muted-foreground">Código usado pelo fornecedor na NF.</p>
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                <Save className="w-4 h-4 mr-2" /> 
                                {processing ? "Salvando..." : "Vincular / Atualizar"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Coluna da Direita: Lista de Vínculos Existentes */}
            <div className="md:col-span-2">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-lg">Fornecedores Vinculados</CardTitle>
                        <CardDescription>Lista de quem fornece este produto e o custo atual.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {vinculosAtuais.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fornecedor</TableHead>
                                        <TableHead>Cód. Deles</TableHead>
                                        <TableHead>Custo (R$)</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vinculosAtuais.map((v, idx) => (
                                        <TableRow key={v.fornecedor_id || idx}>
                                            <TableCell className="font-medium">{v.razao_social}</TableCell>
                                            <TableCell className="text-muted-foreground">{v.sku_fornecedor || "-"}</TableCell>
                                            <TableCell className="font-bold text-green-600">
                                                {formatCurrency(v.preco_custo)}
                                            </TableCell>
                                            <TableCell>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleRemoverVinculo(v.fornecedor_id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                                <p>Nenhum fornecedor vinculado a este produto ainda.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}