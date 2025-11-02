"use client";

import * as React from "react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { vendaService } from "@/services/vendaService"
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Função para buscar dados do dashboard da API
 */
async function getDashboardData() {
  try {
    // Busca vendas recentes para o dashboard
    const vendas = await vendaService.listar({});
    
    // Transforma os dados para o formato esperado pelo DataTable
    // O DataTable espera um array com id, header, type, status, etc
    // Vamos adaptar os dados de vendas para esse formato
    const dataFormatada = vendas.slice(0, 20).map((venda, index) => ({
      id: venda.venda_id || venda.id || index + 1,
      header: `Venda #${venda.venda_id || venda.id || index + 1}`,
      type: "Venda",
      status: venda.status_venda || venda.status || "Concluída",
      target: new Date(venda.data_venda || venda.created_at).toLocaleDateString("pt-BR"),
      limit: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(venda.valor_total || 0),
      reviewer: venda.nome_funcionario || venda.funcionario || "N/A",
    }));

    return dataFormatada;
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    // Retorna array vazio em caso de erro
    return [];
  }
}

export default function Page() {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const carregarDados = async () => {
      setIsLoading(true);
      try {
        const dados = await getDashboardData();
        setData(dados);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 md:gap-6">
        <SectionCards />
        <div className="space-y-2">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    // O layout (Sidebar, Header) é provido pelo `layout.jsx`
    // Esta página só precisa renderizar seu conteúdo específico.
    <div className="flex flex-col gap-4 md:gap-6">
      <SectionCards />
      <ChartAreaInteractive />
      <DataTable data={data} />
    </div>
  );
}
