"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext"; 
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, ArrowDownCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // Importando Skeleton

// Importando os services que vamos usar
import * as vendaService from "../../services/vendaService"; // Caminho corrigido
import * as clienteService from "../../services/clienteService"; // Caminho corrigido
import * as contaPagarService from "../../services/contaPagarService"; // Caminho corrigido

// --- Componentes Internos da Página ---

/**
 * Componente de Card para exibir um KPI (Métrica Chave)
 */
function KpiCard({ title, value, icon: Icon, description, isLoading }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Mostra um esqueleto enquanto os dados carregam
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Componente para exibir a tabela de Vendas Recentes
 */
function VendasRecentes({ vendas, isLoading }) {
  // Função para formatar moeda
  const formatCurrency = (value) =>
    parseFloat(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas Recentes</CardTitle>
        <CardDescription>
          As 5 vendas mais recentes do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Esqueleto da Tabela (Loading)
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-32 mt-1" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : vendas.length > 0 ? (
              // Dados Reais
              vendas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell>
                    <div className="font-medium">
                      {venda.cliente_nome || "Cliente não identificado"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {/* Precisamos garantir que o backend envie 'cliente_email' */}
                      {venda.cliente_email || ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {/* Você pode ter um campo 'status' na sua venda */}
                      {venda.status || "Concluída"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(venda.valor_total)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Sem Dados
              <TableRow>
                <TableCell colSpan="3" className="text-center">
                  Nenhuma venda recente.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// --- Componente Principal da Página ---

export default function DashboardPage() {
  const { token } = useAuth(); // Pega o token do contexto
  const [stats, setStats] = useState({
    totalVendas: 0,
    totalClientes: 0,
    contasPagar: 0,
  });
  const [vendasRecentes, setVendasRecentes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para formatar moeda
  const formatCurrency = (value) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  // useEffect para buscar os dados da API quando o componente montar
  useEffect(() => {
    // Só busca os dados se o token já foi carregado
    if (!token) {
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Busca todos os dados em paralelo para o dashboard carregar mais rápido
        const results = await Promise.allSettled([
          vendaService.getRelatorioVendas(token),
          clienteService.readAll(token),
          contaPagarService.readAll(token),
        ]);

        let totalVendas = 0;
        let totalClientes = 0;
        let totalContasPagar = 0;

        // 1. Processar dados de Vendas
        if (results[0].status === "fulfilled") {
          const vendas = results[0].value.vendas || [];
          totalVendas = vendas.reduce(
            (acc, v) => acc + parseFloat(v.valor_total),
            0
          );
          // Pega as 5 vendas mais recentes (assumindo que vêm ordenadas)
          setVendasRecentes(vendas.slice(0, 5));
        } else {
          console.error("Erro ao buscar vendas:", results[0].reason);
          toast.error("Erro ao buscar relatório de vendas.");
        }

        // 2. Processar Clientes
        if (results[1].status === "fulfilled") {
          totalClientes = results[1].value.length;
        } else {
          console.error("Erro ao buscar clientes:", results[1].reason);
          toast.error("Erro ao buscar clientes.");
        }

        // 3. Processar Contas a Pagar
        if (results[2].status === "fulfilled") {
          totalContasPagar = results[2].value
            .filter((conta) => conta.status !== "Paga") // Filtra apenas as não pagas
            .reduce((acc, c) => acc + parseFloat(c.valor), 0);
        } else {
          console.error("Erro ao buscar contas a pagar:", results[2].reason);
          toast.error("Erro ao buscar contas a pagar.");
        }

        // Atualiza o estado com todos os dados de uma vez
        setStats({
          totalVendas,
          totalClientes,
          contasPagar: totalContasPagar,
        });
      } catch (error) {
        console.error("Erro inesperado no dashboard:", error);
        toast.error("Falha ao carregar o dashboard.");
      } finally {
        setIsLoading(false); // Termina o carregamento (com sucesso ou falha)
      }
    };

    fetchData();
  }, [token]); // Roda o efeito sempre que o token mudar

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Cards de KPI (Métricas Principais) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="Faturamento Total"
          value={formatCurrency(stats.totalVendas)}
          description="Total de vendas no período"
          icon={DollarSign}
          isLoading={isLoading}
        />
        <KpiCard
          title="Total de Clientes"
          value={stats.totalClientes.toString()} // Valor deve ser string
          description="Clientes cadastrados na base"
          icon={Users}
          isLoading={isLoading}
        />
        <KpiCard
          title="Contas a Pagar"
          value={formatCurrency(stats.contasPagar)}
          description="Total de contas pendentes"
          icon={ArrowDownCircle}
          isLoading={isLoading}
        />
      </div>

      {/* 2. Tabela de Vendas Recentes */}
      <div className="grid grid-cols-1 gap-4">
        <VendasRecentes vendas={vendasRecentes} isLoading={isLoading} />
      </div>

      {/* Aqui você pode adicionar mais componentes, 
        como gráficos (quando tiver o componente de gráfico)
      */}
    </div>
  );
}

