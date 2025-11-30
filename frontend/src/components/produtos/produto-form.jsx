"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Package } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { create, update } from "@/services/produtoService";
import { readAll as getFornecedores } from "@/services/fornecedorService";
import { toast } from "sonner";

export function ProdutoForm({ produto, onSuccess, onCancel }) {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fornecedores, setFornecedores] = useState([]);
  const [preview, setPreview] = useState(null);
  
  const [formData, setFormData] = useState({
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

  // Carregar dados iniciais e fornecedores
  useEffect(() => {
    async function loadAuxData() {
      if (!token) return;
      try {
        const lista = await getFornecedores(token);
        setFornecedores(lista || []);
      } catch (err) {
        console.error("Erro ao carregar fornecedores", err);
      }
    }
    loadAuxData();

    if (produto) {
      setFormData({
        sku: produto.sku || "",
        nome: produto.nome || "",
        marca: produto.marca || "",
        modelo: produto.modelo || "",
        ano: produto.ano || "",
        categoria: produto.categoria || "",
        fornecedor_id: produto.fornecedor_id ? String(produto.fornecedor_id) : "",
        descricao: produto.descricao || "",
        preco_custo: produto.preco_custo || "",
        preco_venda: produto.preco_venda || "",
        foto: null,
      });
      setPreview(produto.foto ? `http://localhost:3080/uploads/${produto.foto}` : null);
    }
  }, [produto, token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, foto: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);

    try {
      const data = new FormData();
      // Campos obrigatórios e opcionais
      data.append("sku", formData.sku);
      data.append("nome", formData.nome);
      data.append("preco_venda", formData.preco_venda);
      
      if (formData.marca) data.append("marca", formData.marca);
      if (formData.modelo) data.append("modelo", formData.modelo);
      if (formData.ano) data.append("ano", formData.ano);
      if (formData.categoria) data.append("categoria", formData.categoria);
      if (formData.fornecedor_id) data.append("fornecedor_id", formData.fornecedor_id);
      if (formData.descricao) data.append("descricao", formData.descricao);
      if (formData.preco_custo) data.append("preco_custo", formData.preco_custo);

      if (formData.foto instanceof File) {
        data.append("foto", formData.foto);
      }

      if (produto) {
        await update(produto.produto_id || produto.id, data, token);
      } else {
        await create(data, token);
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar produto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        {/* Upload de Foto */}
        <div className="flex flex-col items-center gap-4 pb-4 border-b">
            <Avatar className="w-32 h-32 rounded-lg border-2 border-dashed">
            <AvatarImage src={preview} className="object-cover" />
            <AvatarFallback className="rounded-lg"><Package className="h-12 w-12 text-muted-foreground" /></AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
                <Label htmlFor="foto-prod" className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium">
                Escolher Imagem
                </Label>
                <Input id="foto-prod" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
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

        {/* Seção Veículo */}
        <div className="grid grid-cols-3 gap-4 bg-muted/30 p-3 rounded-md border">
            <div className="col-span-3 text-xs font-bold text-muted-foreground uppercase">Aplicação / Veículo</div>
            <div className="space-y-2">
                <Label>Marca</Label>
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
                <Label>Categoria</Label>
                <Input value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})} placeholder="Ex: Motor" />
            </div>
            <div className="space-y-2">
                <Label>Fornecedor</Label>
                <Select 
                    value={formData.fornecedor_id} 
                    onValueChange={(val) => setFormData({...formData, fornecedor_id: val})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                        {fornecedores.map((f) => (
                            <SelectItem key={f.id || f.fornecedor_id} value={String(f.id || f.fornecedor_id)}>
                                {f.nome || f.razao_social}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} placeholder="Detalhes técnicos..." />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                <Label>Custo (R$)</Label>
                <Input type="number" step="0.01" value={formData.preco_custo} onChange={(e) => setFormData({...formData, preco_custo: e.target.value})} />
            </div>
            <div className="space-y-2">
                <Label className="text-primary font-bold">Venda (R$) *</Label>
                <Input type="number" step="0.01" required value={formData.preco_venda} onChange={(e) => setFormData({...formData, preco_venda: e.target.value})} className="border-primary/50 focus-visible:ring-primary" />
            </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
        </div>
    </form>
  );
}