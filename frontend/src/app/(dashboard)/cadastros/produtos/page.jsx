"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Plus, Edit, Trash2, Search, Tag, Truck, Car, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

import * as produtoService from "@/services/produtoService";
import * as fornecedorService from "@/services/fornecedorService";

export default function ProdutosPage() {
  const { token } = useAuth();

  const [produtos, setProdutos] = React.useState([]);
  const [fornecedores, setFornecedores] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // --- NOVOS ESTADOS DE FILTRO ---
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filtroMarca, setFiltroMarca] = React.useState("todos");
  const [filtroModelo, setFiltroModelo] = React.useState("todos");
  const [filtroAno, setFiltroAno] = React.useState("todos");

  // Estado para Edição
  const [editingId, setEditingId] = React.useState(null);

  const [preview, setPreview] = React.useState(null);
  const [formData, setFormData] = React.useState({
    sku: "",
    nome: "",
    marca: "",
    modelo: "", // Novo campo
    ano: "",    // Novo campo
    categoria: "",
    fornecedor_id: "",
    descricao: "",
    preco_custo: "",
    preco_venda: "",
    foto: null,
  });

  React.useEffect(() => {
    if (token) {
      carregarDados();
    }
  }, [token]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Carrega produtos e fornecedores em paralelo
      const [listaProdutos, listaFornecedores] = await Promise.all([
        produtoService.readAll(token),
        fornecedorService.readAll(token),
      ]);
      setProdutos(listaProdutos || []);
      setFornecedores(listaFornecedores || []);
    } catch (error) {
      console.error("Erro ao carregar:", error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, foto: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const openDialog = (produto = null) => {
    if (produto) {
      setEditingId(produto.produto_id || produto.id);
      setFormData({
        sku: produto.sku,
        nome: produto.nome,
        marca: produto.marca || "",
        modelo: produto.modelo || "", // Preencher
        ano: produto.ano || "",       // Preencher
        categoria: produto.categoria || "",
        fornecedor_id: produto.fornecedor_id ? String(produto.fornecedor_id) : "",
        descricao: produto.descricao || "",
        preco_custo: produto.preco_custo,
        preco_venda: produto.preco_venda,
        foto: null,
      });
      setPreview(produto.foto ? `http://localhost:3080/uploads/${produto.foto}` : null);
    } else {
      setEditingId(null);
      setFormData({
        sku: "",
        nome: "",
        marca: "",
        modelo: "",
        ano: "",
        categoria: "",
        fornecedor_id: "",
        descricao: "",
        preco_custo: "",
        preco_venda: "",
        foto: null,
      });
      setPreview(null);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("sku", formData.sku.trim());
      data.append("nome", formData.nome.trim());
      if (formData.marca) data.append("marca", formData.marca.trim());
      if (formData.modelo) data.append("modelo", formData.modelo.trim()); // Enviar novo campo
      if (formData.ano) data.append("ano", formData.ano.trim());          // Enviar novo campo
      if (formData.categoria) data.append("categoria", formData.categoria.trim());
      if (formData.fornecedor_id) data.append("fornecedor_id", formData.fornecedor_id);
      if (formData.descricao) data.append("descricao", formData.descricao.trim());
      data.append("preco_custo", formData.preco_custo);
      data.append("preco_venda", formData.preco_venda);

      if (formData.foto instanceof File) {
        data.append("foto", formData.foto);
      }

      if (editingId) {
        await produtoService.update(editingId, data, token);
        toast.success("Produto atualizado!");
      } else {
        await produtoService.create(data, token);
        toast.success("Produto criado!");
      }

      setIsDialogOpen(false);
      await carregarDados();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar produto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Excluir este produto?")) return;
    try {
      await produtoService.deleteRecord(id, token);
      toast.success("Produto excluído.");
      await carregarDados();
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // --- LÓGICA PARA EXTRAIR OPÇÕES ÚNICAS PARA OS FILTROS ---
  const marcasDisponiveis = [...new Set(produtos.map(p => p.marca).filter(Boolean))].sort();
  const modelosDisponiveis = [...new Set(produtos.map(p => p.modelo).filter(Boolean))].sort();
  const anosDisponiveis = [...new Set(produtos.map(p => p.ano).filter(Boolean))].sort((a, b) => b - a);

  // --- LÓGICA DE FILTRAGEM COMBINADA ---
  const produtosFiltrados = produtos.filter((p) => {
    const matchSearch =
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchMarca = filtroMarca === "todos" || p.marca === filtroMarca;
    const matchModelo = filtroModelo === "todos" || p.modelo === filtroModelo;
    const matchAno = filtroAno === "todos" || p.ano === filtroAno;

    return matchSearch && matchMarca && matchModelo && matchAno;
  });

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seu estoque, marcas e aplicações.
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {/* --- BARRA DE FILTROS E BUSCA --- */}
      <div className="flex flex-col lg:flex-row gap-4 bg-muted/20 p-4 rounded-lg border">
        {/* Busca Texto */}
        <div className="relative w-full lg:w-1/4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou SKU..."
            className="pl-8 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtro Marca */}
        <div className="w-full lg:w-1/6">
          <Select value={filtroMarca} onValueChange={setFiltroMarca}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Marcas</SelectItem>
              {marcasDisponiveis.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro Modelo */}
        <div className="w-full lg:w-1/6">
          <Select value={filtroModelo} onValueChange={setFiltroModelo}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Modelos</SelectItem>
              {modelosDisponiveis.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro Ano */}
        <div className="w-full lg:w-1/6">
          <Select value={filtroAno} onValueChange={setFiltroAno}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Anos</SelectItem>
              {anosDisponiveis.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botão Limpar Filtros */}
        {(filtroMarca !== "todos" || filtroModelo !== "todos" || filtroAno !== "todos" || searchTerm) && (
          <Button
            variant="ghost"
            onClick={() => {
              setFiltroMarca("todos");
              setFiltroModelo("todos");
              setFiltroAno("todos");
              setSearchTerm("");
            }}
          >
            Limpar
          </Button>
        )}
      </div>

      {/* GRID DE CARDS */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[350px] w-full rounded-xl" />
          ))}
        </div>
      ) : produtosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {produtosFiltrados.map((produto) => (
            <Card key={produto.produto_id || produto.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
              
              {/* Área da Imagem */}
              <div className="relative h-48 w-full bg-muted flex items-center justify-center overflow-hidden">
                {produto.foto ? (
                  <img
                    src={`http://localhost:3080/uploads/${produto.foto}`}
                    alt={produto.nome}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <Package className="h-16 w-16 text-muted-foreground/50" />
                )}
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold shadow-sm">
                  {produto.sku}
                </div>
              </div>

              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1" title={produto.nome}>{produto.nome}</CardTitle>
                </div>
                <CardDescription className="line-clamp-2 h-10">
                    {produto.descricao || "Sem descrição."}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-2 text-sm">
                <div className="flex flex-wrap gap-2 text-muted-foreground">
                    {produto.marca && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-medium dark:bg-blue-900 dark:text-blue-300">
                        <Tag className="h-3 w-3" /> {produto.marca}
                      </span>
                    )}
                    {produto.modelo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-medium dark:bg-green-900 dark:text-green-300">
                        <Car className="h-3 w-3" /> {produto.modelo}
                      </span>
                    )}
                    {produto.ano && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-xs font-medium dark:bg-orange-900 dark:text-orange-300">
                        <Calendar className="h-3 w-3" /> {produto.ano}
                      </span>
                    )}
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground pt-1">
                    <Truck className="h-3 w-3" />
                    <span className="truncate max-w-[200px]">
                        {produto.nome_fornecedor || "Fornecedor N/A"}
                    </span>
                </div>
              </CardContent>

              <CardFooter className="border-t bg-muted/10 pt-4 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Preço de Venda</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(produto.preco_venda)}</span>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(produto)}>
                        <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(produto.produto_id || produto.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <Package className="h-12 w-12 mb-4 opacity-20" />
          <p>Nenhum produto encontrado com os filtros selecionados.</p>
          <Button variant="link" onClick={() => {
             setFiltroMarca("todos"); setFiltroModelo("todos"); setFiltroAno("todos"); setSearchTerm("");
          }}>Limpar Filtros</Button>
        </div>
      )}

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
            <DialogDescription>Preencha as informações detalhadas do produto.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            {/* Upload de Foto */}
            <div className="flex flex-col items-center gap-4 pb-4 border-b">
              <Avatar className="w-32 h-32 rounded-lg border-2 border-dashed">
                <AvatarImage src={preview} className="object-cover" />
                <AvatarFallback className="rounded-lg"><Package className="h-12 w-12 text-muted-foreground" /></AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                 <Label htmlFor="foto" className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium">
                    Escolher Imagem
                 </Label>
                 <Input id="foto" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>SKU *</Label>
                    <Input value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} required placeholder="Cód. Único" />
                </div>
                <div className="space-y-2">
                    <Label>Nome do Produto *</Label>
                    <Input value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required placeholder="Ex: Filtro de Óleo" />
                </div>
            </div>

            {/* --- SEÇÃO DE APLICAÇÃO DO VEÍCULO --- */}
            <div className="grid grid-cols-3 gap-4 bg-muted/30 p-3 rounded-md border">
                <div className="col-span-3 text-xs font-bold text-muted-foreground uppercase">Aplicação / Veículo</div>
                <div className="space-y-2">
                    <Label>Marca (Carro)</Label>
                    <Input value={formData.marca} onChange={(e) => setFormData({...formData, marca: e.target.value})} placeholder="Ex: Fiat" />
                </div>
                <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Input value={formData.modelo} onChange={(e) => setFormData({...formData, modelo: e.target.value})} placeholder="Ex: Palio" />
                </div>
                <div className="space-y-2">
                    <Label>Ano</Label>
                    <Input value={formData.ano} onChange={(e) => setFormData({...formData, ano: e.target.value})} placeholder="Ex: 2015" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Categoria / Tipo</Label>
                    <Input value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} placeholder="Ex: Motor, Freios" />
                </div>
                <div className="space-y-2">
                    <Label>Fornecedor Principal</Label>
                    <Select 
                        value={formData.fornecedor_id} 
                        onValueChange={(val) => setFormData({...formData, fornecedor_id: val})}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {fornecedores.map((f) => (
                                <SelectItem key={f.fornecedor_id} value={String(f.fornecedor_id)}>
                                    {f.razao_social}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} placeholder="Detalhes técnicos, aplicação..." />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                 <div className="space-y-2">
                    <Label>Preço de Custo (R$)</Label>
                    <Input type="number" step="0.01" value={formData.preco_custo} onChange={(e) => setFormData({...formData, preco_custo: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label className="text-primary font-bold">Preço de Venda (R$) *</Label>
                    <Input type="number" step="0.01" required value={formData.preco_venda} onChange={(e) => setFormData({...formData, preco_venda: e.target.value})} className="border-primary/50 focus-visible:ring-primary" />
                </div>
            </div>

            <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar Produto"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}