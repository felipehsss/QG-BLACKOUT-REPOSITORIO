"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { create as createFuncionario, update as updateFuncionario } from "@/services/funcionarioService";
import { readAll as getLojas } from "@/services/lojaService"; 
import { readAll as getPerfis } from "@/services/perfilService"; 
import { useAuth } from "@/contexts/AuthContext";

export function FuncionarioForm({
  funcionario,
  onSuccess,
  onCancel
}) {
  const [formData, setFormData] = useState({
    nome_completo: funcionario?.nome_completo || "",
    email: funcionario?.email || "",
    cpf: funcionario?.cpf || "",
    telefone_contato: funcionario?.telefone_contato || "",
    
    // CORREÇÃO 1: Adicionando e formatando a Data de Admissão
    // O input type="date" precisa do formato YYYY-MM-DD
    data_admissao: funcionario?.data_admissao 
      ? new Date(funcionario.data_admissao).toISOString().split('T')[0] 
      : "",

    loja_id: funcionario?.loja_id ? funcionario.loja_id.toString() : "", 
    perfil_id: funcionario?.perfil_id ? funcionario.perfil_id.toString() : "",
    senha: "",
    is_ativo: funcionario ? (funcionario.is_ativo ? "true" : "false") : "true"
  });

  const [lojas, setLojas] = useState([]);
  const [perfis, setPerfis] = useState([]);
  const [loading, setLoading] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    async function loadDados() {
      if (!token) return; 

      try {
        const [listaLojas, listaPerfis] = await Promise.all([
          getLojas(token),
          getPerfis(token)
        ]);

        setLojas(listaLojas || []);
        setPerfis(listaPerfis || []);
      } catch (error) {
        console.error("Erro ao carregar dados auxiliares:", error);
      }
    }

    loadDados();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      alert("Sessão inválida. Tente recarregar a página.");
      return;
    }

    setLoading(true);
    try {
      const dataToSend = { ...formData };
      
      if (funcionario && !dataToSend.senha) {
        delete dataToSend.senha;
      }

      if (funcionario) {
        await updateFuncionario(funcionario.funcionario_id, dataToSend, token);
      } else {
        await createFuncionario(dataToSend, token);
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      alert("Erro ao salvar. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome_completo">Nome Completo</Label>
          <Input
            id="nome_completo"
            name="nome_completo"
            value={formData.nome_completo}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            name="telefone_contato"
            value={formData.telefone_contato}
            onChange={handleChange}
          />
        </div>

        {/* CORREÇÃO 2: Novo campo de Data de Admissão */}
        <div className="space-y-2">
          <Label htmlFor="data_admissao">Data de Admissão</Label>
          <Input
            id="data_admissao"
            name="data_admissao"
            type="date"
            value={formData.data_admissao}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label>Loja</Label>
          <Select 
            value={formData.loja_id} 
            onValueChange={(val) => handleSelectChange("loja_id", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a loja" />
            </SelectTrigger>
            <SelectContent>
              {lojas.map((loja) => (
                <SelectItem key={loja.id} value={loja.id.toString()}>
                  {loja.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Perfil</Label>
          <Select 
            value={formData.perfil_id} 
            onValueChange={(val) => handleSelectChange("perfil_id", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o perfil" />
            </SelectTrigger>
            <SelectContent>
              {perfis.map((perfil) => (
                <SelectItem key={perfil.id} value={perfil.id.toString()}>
                  {perfil.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha">Senha {funcionario && "(Vazio p/ manter)"}</Label>
          <Input
            id="senha"
            name="senha"
            type="password"
            value={formData.senha}
            onChange={handleChange}
            required={!funcionario} 
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select 
            value={formData.is_ativo} 
            onValueChange={(val) => handleSelectChange("is_ativo", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Ativo</SelectItem>
              <SelectItem value="false">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : (funcionario ? "Atualizar" : "Cadastrar")}
        </Button>
      </div>
    </form>
  );
}