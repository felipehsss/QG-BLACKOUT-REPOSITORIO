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
import { Textarea } from "@/components/ui/textarea"; // Certifique-se de ter este componente ou use Input
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Plus, Edit, Trash2, Search, Tag, Truck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

import * as produtoService from "@/services/produtoService";
import * as fornecedorService from "@/services/fornecedorService"; // Precisamos buscar os fornecedores

export default function ProdutosPage() {
  const { token } = useAuth();

  const [produtos, setProdutos] = React.useState([]);
  const [fornecedores, setFornecedores] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Estado para Edição
  const [editingId, setEditingId] = React.useState(null);

  const [preview, setPreview] = React.useState(null);
  const [formData, setFormData] = React.useState({
    sku: "",
    nome: "",
    marca: "",
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

  // Filtro simples de busca
  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seu estoque, marcas e fornecedores.
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {/* Barra de Busca */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou SKU..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    <span>{produto.categoria || "Sem Categoria"}</span>
                    <span className="mx-1">•</span>
                    <span className="font-medium text-foreground">{produto.marca || "Sem Marca"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
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
          <p>Nenhum produto encontrado.</p>
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

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Marca</Label>
                    <Input value={formData.marca} onChange={(e) => setFormData({...formData, marca: e.target.value})} placeholder="Ex: Bosch, Fram" />
                </div>
                <div className="space-y-2">
                    <Label>Categoria / Tipo</Label>
                    <Input value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} placeholder="Ex: Motor, Freios" />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Fornecedor Principal</Label>
                <Select 
                    value={formData.fornecedor_id} 
                    onValueChange={(val) => setFormData({...formData, fornecedor_id: val})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um fornecedor..." />
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