"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { create, update } from "@/services/lojaService";
import { toast } from "sonner";
import { MaskedInput } from "@/components/ui/masked-input";

// Formatações manuais simples se precisar
const formatCNPJ = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5").slice(0, 18);
const formatPhone = (v) => v.replace(/\D/g, "").replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3").slice(0, 15);

export function LojaForm({ loja, onSuccess, onCancel }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    telefone: "",
    email: "",
    is_matriz: false,
    is_ativo: true
  });

  useEffect(() => {
    if (loja) {
      setFormData({
        nome: loja.nome || "",
        cnpj: loja.cnpj || "",
        endereco: loja.endereco || "",
        telefone: loja.telefone || "",
        email: loja.email || "",
        is_matriz: !!loja.is_matriz,
        is_ativo: loja.is_ativo !== undefined ? !!loja.is_ativo : true,
      });
    }
  }, [loja]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMaskChange = (field, formatter) => (e) => {
    const val = formatter(e.target.value);
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);

    try {
      // Limpa máscaras antes de enviar
      const payload = {
        ...formData,
        cnpj: formData.cnpj.replace(/\D/g, ""),
        telefone: formData.telefone.replace(/\D/g, "")
      };

      if (loja) {
        await update(loja.id || loja.loja_id, payload, token);
        toast.success("Loja atualizada com sucesso!");
      } else {
        await create(payload, token);
        toast.success("Loja criada com sucesso!");
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar loja.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2 md:col-span-1">
          <Label htmlFor="nome">Nome da Loja *</Label>
          <Input 
            id="nome" name="nome" 
            value={formData.nome} onChange={handleChange} 
            required placeholder="Ex: QG Blackout - Centro" 
          />
        </div>

        <div className="space-y-2 col-span-2 md:col-span-1">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input 
            id="cnpj" name="cnpj" 
            value={formData.cnpj} onChange={handleMaskChange("cnpj", formatCNPJ)} 
            placeholder="00.000.000/0001-00" 
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input 
            id="endereco" name="endereco" 
            value={formData.endereco} onChange={handleChange} 
            placeholder="Rua, Número, Bairro, Cidade - UF" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input 
            id="telefone" name="telefone" 
            value={formData.telefone} onChange={handleMaskChange("telefone", formatPhone)} 
            placeholder="(00) 00000-0000" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" name="email" type="email"
            value={formData.email} onChange={handleChange} 
            placeholder="loja@qgblackout.com.br" 
          />
        </div>

        <div className="flex items-center space-x-2 pt-4">
            <Checkbox 
                id="is_matriz" 
                checked={formData.is_matriz}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_matriz: checked }))}
            />
            <Label htmlFor="is_matriz" className="cursor-pointer">É a Loja Matriz?</Label>
        </div>

        <div className="flex items-center space-x-2 pt-4">
            <Label>Status:</Label>
            <Select 
                value={formData.is_ativo ? "true" : "false"}
                onValueChange={(val) => setFormData(prev => ({ ...prev, is_ativo: val === "true" }))}
            >
                <SelectTrigger className="w-[120px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="true">Ativa</SelectItem>
                    <SelectItem value="false">Inativa</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : (loja ? "Salvar Alterações" : "Cadastrar Loja")}
        </Button>
      </div>
    </form>
  );
}