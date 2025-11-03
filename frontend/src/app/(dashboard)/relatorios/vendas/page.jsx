// frontend/src/app/dashboard/relatorios/vendas/page.jsx

"use client"; // Obrigatório para usar hooks

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext"; // 1. Nosso hook para pegar o token
import * as vendaService from "@/services/vendaService"; // 2. Importa o service de vendas
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RelatorioVendasPage() {
  // 3. Estados para guardar os dados, loading e erros
  const [vendas, setVendas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 4. Pegar o token do usuário logado
  // O useAuth() pega o token automaticamente do localStorage
  // através do nosso AuthContext
  const { token } = useAuth();

  // 5. Hook para buscar os dados quando a página carregar
  useEffect(() => {
    // Só executa se o token já foi carregado
    if (!token) {
      return;
    }

    const fetchVendas = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 6. AQUI ESTÁ A CHAMADA:
        // Chama a função do service, passando o token
        const data = await vendaService.getRelatorioVendas(token);
        
        setVendas(data.vendas || []); // Ajuste o nome da propriedade conforme o seu backend
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendas();
  }, [token]); // O array [token] faz o useEffect rodar de novo se o token mudar

  // 7. Renderizar o estado da página
  if (isLoading) {
    return <div>Carregando relatório...</div>;
  }

  if (error) {
    return <div className="text-red-500">Erro ao buscar relatório: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório de Vendas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Venda</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendas.length > 0 ? (
              vendas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell>{venda.id}</TableCell>
                  <TableCell>{venda.cliente_nome || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(venda.data_venda).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {parseFloat(venda.valor_total).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="4" className="text-center">
                  Nenhuma venda encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}