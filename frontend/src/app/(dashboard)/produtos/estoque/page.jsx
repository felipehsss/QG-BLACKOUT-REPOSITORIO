"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Search, Loader2, Package, Building2, Download, RefreshCw, Store } from "lucide-react"

// --- COMPONENTES UI SIMPLIFICADOS (Para garantir funcionamento sem dependências externas) ---

const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>{children}</div>
)
const CardHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
)
const CardTitle = ({ children, className = "" }) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
)
const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
)
const Button = ({ children, variant = "primary", className = "", ...props }) => {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-900/90",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-100 text-slate-900",
    destructive: "bg-red-500 text-white hover:bg-red-500/90",
  }
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
const Input = ({ className = "", ...props }) => (
  <input 
    className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)
const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "border-transparent bg-slate-900 text-slate-50 shadow hover:bg-slate-900/80",
    secondary: "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
    destructive: "border-transparent bg-red-500 text-slate-50 shadow hover:bg-red-500/80",
    outline: "text-foreground",
  }
  // Se a variant não existir no map, usa default ou classes customizadas passadas via className
  const baseClass = variants[variant] || ""
  return (
    <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${baseClass} ${className}`}>
      {children}
    </div>
  )
}

// --- DADOS MOCKADOS (Simulando API) ---
const MOCK_ESTOQUE = [
  { estoque_id: 1, loja_nome: "Loja Matriz", sku: "CAM-001", produto_nome: "Camiseta Básica Preta", quantidade: 150 },
  { estoque_id: 2, loja_nome: "Loja Matriz", sku: "CAM-002", produto_nome: "Camiseta Básica Branca", quantidade: 80 },
  { estoque_id: 3, loja_nome: "Loja Matriz", sku: "CAL-001", produto_nome: "Calça Jeans Slim", quantidade: 4 },
  { estoque_id: 4, loja_nome: "Filial Shopping", sku: "CAM-001", produto_nome: "Camiseta Básica Preta", quantidade: 20 },
  { estoque_id: 5, loja_nome: "Filial Shopping", sku: "CAL-001", produto_nome: "Calça Jeans Slim", quantidade: 0 },
  { estoque_id: 6, loja_nome: "Filial Centro", sku: "CAM-002", produto_nome: "Camiseta Básica Branca", quantidade: 12 },
  { estoque_id: 7, loja_nome: "Filial Centro", sku: "ACE-001", produto_nome: "Boné Trucker", quantidade: 5 },
  { estoque_id: 8, loja_nome: "Loja Matriz", sku: "ACE-001", produto_nome: "Boné Trucker", quantidade: 45 },
]

export default function EstoqueMatrizPage() {
  // Estado
  const [estoque, setEstoque] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filtros
  const [busca, setBusca] = useState("")
  const [filtroLoja, setFiltroLoja] = useState("todas")

  // Carregar Dados (Simulado)
  useEffect(() => {
    carregarEstoque()
  }, [])

  const carregarEstoque = async () => {
    setLoading(true)
    // Simulando delay de rede
    setTimeout(() => {
      setEstoque(MOCK_ESTOQUE)
      setLoading(false)
    }, 1000)
  }

  // Extrair lista de lojas única e ORDENAR para que a Matriz seja a principal
  const lojas = useMemo(() => {
    const nomes = estoque.map(item => item.loja_nome).filter(Boolean)
    const listaUnica = Array.from(new Set(nomes))

    // Ordenação: Matriz primeiro, depois alfabética
    return listaUnica.sort((a, b) => {
      const nomeA = a.toLowerCase()
      const nomeB = b.toLowerCase()
      
      // Verifica se é matriz para priorizar
      const isMatrizA = nomeA.includes("matriz")
      const isMatrizB = nomeB.includes("matriz")

      if (isMatrizA && !isMatrizB) return -1
      if (!isMatrizA && isMatrizB) return 1
      return nomeA.localeCompare(nomeB)
    })
  }, [estoque])

  // Filtragem
  const estoqueFiltrado = useMemo(() => {
    const termo = busca.toLowerCase()
    return estoque.filter(item => {
      const matchNome = (item.produto_nome || "").toLowerCase().includes(termo)
      const matchSku = (item.sku || "").toLowerCase().includes(termo)
      
      // Lógica do filtro de lojas
      const matchLoja = filtroLoja === "todas" || item.loja_nome === filtroLoja
      
      return (matchNome || matchSku) && matchLoja
    })
  }, [estoque, busca, filtroLoja])

  // Resumo
  const resumo = useMemo(() => {
    const totalItens = estoqueFiltrado.reduce((acc, item) => acc + Number(item.quantidade), 0)
    const produtosUnicos = new Set(estoqueFiltrado.map(i => i.sku)).size
    const lojasAtivas = new Set(estoqueFiltrado.map(i => i.loja_nome)).size
    return { totalItens, lojasAtivas, produtosUnicos }
  }, [estoqueFiltrado])

  // Função para Exportar CSV
  const handleExportarCSV = () => {
    if (estoqueFiltrado.length === 0) {
      alert("Não há dados para exportar.")
      return
    }

    const cabecalho = ["Loja", "SKU", "Produto", "Quantidade", "Status"]
    const linhas = estoqueFiltrado.map(item => {
      let status = "Normal"
      if (item.quantidade <= 0) status = "Zerado"
      else if (item.quantidade < 5) status = "Baixo"
      
      return [
        `"${item.loja_nome}"`,
        `"${item.sku}"`,
        `"${item.produto_nome}"`,
        item.quantidade,
        status
      ].join(",")
    })

    const csvContent = "data:text/csv;charset=utf-8," + [cabecalho.join(","), ...linhas].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `estoque_rede_${new Date().toISOString().slice(0,10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    alert("Relatório exportado com sucesso!")
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-slate-900">
            <Building2 className="h-8 w-8 text-blue-600" />
            Visão Geral de Estoque
          </h1>
          <p className="text-slate-500">
            Monitoramento centralizado de estoque (Matriz e Filiais).
          </p>
        </div>
        <Button variant="outline" onClick={carregarEstoque} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Itens (Qtd)</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{resumo.totalItens.toLocaleString()}</div>
            <p className="text-xs text-slate-500">Soma total do estoque visível</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Lojas Monitoradas</CardTitle>
            <Store className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{resumo.lojasAtivas}</div>
            <p className="text-xs text-slate-500">Filiais com estoque listado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Produtos Distintos</CardTitle>
            <Search className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{resumo.produtosUnicos}</div>
            <p className="text-xs text-slate-500">SKUs únicos na rede</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Inventário da Rede</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            
            {/* Filtro de Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por produto ou SKU..."
                className="pl-9"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            {/* Filtro de Lojas - Substituído Select por select nativo para evitar complexidade em arquivo único */}
            <div className="relative w-full md:w-[280px]">
              <div className="absolute left-2.5 top-2.5 pointer-events-none">
                 <Store className="w-4 h-4 text-slate-400" />
              </div>
              <select
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent pl-9 pr-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                value={filtroLoja}
                onChange={(e) => setFiltroLoja(e.target.value)}
              >
                <option value="todas">Todas as Lojas</option>
                {lojas.map(loja => (
                  <option key={loja} value={loja}>
                    {loja} {loja.toLowerCase().includes('matriz') ? "(Principal)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão Exportar */}
            <Button variant="secondary" onClick={handleExportarCSV}>
              <Download className="w-4 h-4 mr-2" /> Exportar CSV
            </Button>
          </div>

          <div className="rounded-md border border-slate-200">
            <div className="w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-slate-200 transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100">
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">Loja</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">SKU</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">Produto</th>
                    <th className="h-12 px-4 align-middle font-medium text-slate-500 text-right">Quantidade</th>
                    <th className="h-12 px-4 align-middle font-medium text-slate-500 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-4 align-middle h-24 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                          <span className="text-sm text-slate-500">Carregando estoque da rede...</span>
                        </div>
                      </td>
                    </tr>
                  ) : estoqueFiltrado.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 align-middle h-32 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="w-8 h-8 opacity-20" />
                          Nenhum registro encontrado com os filtros atuais.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    estoqueFiltrado.map((item) => {
                      // Verifica se é Matriz para destacar na tabela
                      const isMatriz = (item.loja_nome || "").toLowerCase().includes('matriz')
                      
                      return (
                        <tr 
                          key={item.estoque_id} 
                          className={`border-b border-slate-200 transition-colors hover:bg-slate-100/50 ${isMatriz ? "bg-slate-50" : ""}`}
                        >
                          <td className="p-4 align-middle font-medium">
                            <div className="flex items-center gap-2">
                              {item.loja_nome}
                              {isMatriz && <Badge variant="secondary" className="text-[10px] h-5 bg-slate-200 text-slate-800">Matriz</Badge>}
                            </div>
                          </td>
                          <td className="p-4 align-middle font-mono text-xs text-slate-500">{item.sku}</td>
                          <td className="p-4 align-middle">{item.produto_nome}</td>
                          <td className="p-4 align-middle text-right font-bold text-base">
                            {item.quantidade}
                          </td>
                          <td className="p-4 align-middle text-center">
                            {item.quantidade <= 0 ? (
                              <Badge variant="destructive">Zerado</Badge>
                            ) : item.quantidade < 5 ? (
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
                                Baixo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-emerald-600 border-emerald-600 bg-emerald-50">
                                Normal
                              </Badge>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-4 text-right">
             Mostrando {estoqueFiltrado.length} registros
          </div>
        </CardContent>
      </Card>
    </div>
  )
}