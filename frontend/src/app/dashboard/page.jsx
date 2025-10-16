import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"

// Em um cenário real, os dados viriam de uma API.
// Vamos simular essa busca de dados de forma assíncrona.
import rawData from "./data.json"

/**
 * Função para simular a busca de dados de uma API.
 * No Next.js com App Router, essa função executaria no servidor.
 */
async function getData() {
  // Em um caso real, você faria a chamada para sua API:
  // const res = await fetch('https://api.example.com/dashboard-data')
  // const data = await res.json()
  // return data;

  // Por enquanto, apenas retornamos os dados do JSON local.
  return rawData
}

export default async function Page() {
  const data = await getData()

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
