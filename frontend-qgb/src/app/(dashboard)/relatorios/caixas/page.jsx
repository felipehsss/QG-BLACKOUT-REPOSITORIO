"use client"

import { useState, useMemo } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

// --- Mock inicial ---
const caixasMock = [
  { id: 1, nome: "Caixa Principal", status: "Aberto", saldo: 1500.5 },
  { id: 2, nome: "Caixa Secundário", status: "Fechado", saldo: 0 },
]

const movimentacoesMock = {
  1: [
    { id: "MOV001", tipo: "Entrada", valor: 500, descricao: "Venda balcão", data: "2025-11-15 10:30" },
    { id: "MOV002", tipo: "Saída", valor: 200, descricao: "Pagamento fornecedor", data: "2025-11-15 14:00" },
  ],
  2: [],
}

export default function Caixas() {
  const [caixas, setCaixas] = useState(caixasMock)
  const [selectedCaixa, setSelectedCaixa] = useState(null)
  const [showNovoCaixa, setShowNovoCaixa] = useState(false)
  const [novoCaixa, setNovoCaixa] = useState({ nome: "", saldo: 0 })
  const [busca, setBusca] = useState("")
  const [novaMov, setNovaMov] = useState({ tipo: "Entrada", valor: "", descricao: "" })

  // Resumo financeiro
  const resumo = useMemo(() => {
    const total = caixas.reduce((acc, c) => acc + c.saldo, 0)
    const abertos = caixas.filter(c => c.status === "Aberto").length
    const fechados = caixas.filter(c => c.status === "Fechado").length
    return { total, abertos, fechados }
  }, [caixas])

  // Filtrar caixas pela busca
  const caixasFiltrados = caixas.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const abrirCaixa = (id) => {
    setCaixas(prev => prev.map(c => c.id === id ? { ...c, status: "Aberto" } : c))
  }

  const fecharCaixa = (id) => {
    setCaixas(prev => prev.map(c => c.id === id ? { ...c, status: "Fechado" } : c))
  }

  const criarCaixa = () => {
    if (!novoCaixa.nome.trim()) return
    const novo = {
      id: caixas.length ? Math.max(...caixas.map(c => c.id)) + 1 : 1,
      nome: novoCaixa.nome.trim(),
      status: "Fechado",
      saldo: parseFloat(novoCaixa.saldo) || 0,
    }
    setCaixas(prev => [...prev, novo])
    setNovoCaixa({ nome: "", saldo: 0 })
    setShowNovoCaixa(false)
  }

  const registrarMovimentacao = () => {
    if (!selectedCaixa) return
    const valorNum = parseFloat(novaMov.valor)
    if (!novaMov.descricao.trim() || isNaN(valorNum) || valorNum <= 0) return

    const mov = {
      id: "MOV" + Math.floor(1000 + Math.random() * 9000),
      tipo: novaMov.tipo,
      valor: valorNum,
      descricao: novaMov.descricao.trim(),
      data: new Date().toLocaleString(),
    }

    movimentacoesMock[selectedCaixa.id] = [
      ...(movimentacoesMock[selectedCaixa.id] || []),
      mov,
    ]

    setCaixas(prev =>
      prev.map(c =>
        c.id === selectedCaixa.id
          ? { ...c, saldo: mov.tipo === "Entrada" ? c.saldo + mov.valor : c.saldo - mov.valor }
          : c
      )
    )

    // Atualiza o selectedCaixa para refletir saldo atualizado
    const atualizado = caixas.find(c => c.id === selectedCaixa.id)
    setSelectedCaixa(atualizado ? { ...atualizado, saldo: mov.tipo === "Entrada" ? atualizado.saldo + mov.valor : atualizado.saldo - mov.valor } : selectedCaixa)

    setNovaMov({ tipo: "Entrada", valor: "", descricao: "" })
  }

  return (
    <div className="grid flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      {/* Resumo financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total em caixas</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">
            {resumo.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Caixas abertos</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">{resumo.abertos}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Caixas fechados</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">{resumo.fechados}</CardContent>
        </Card>
      </div>

      {/* Lista de caixas */}
      <Card>
        <CardHeader>
          <CardTitle>Caixas</CardTitle>
          <CardDescription>Gerencie os caixas da loja.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Input
              placeholder="Buscar caixa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={() => setShowNovoCaixa(true)}>+ Novo Caixa</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caixasFiltrados.map((caixa) => (
                <TableRow key={caixa.id}>
                  <TableCell className="font-medium">{caixa.nome}</TableCell>
                  <TableCell className={caixa.status === "Aberto" ? "text-green-600" : "text-red-600"}>
                    {caixa.status}
                  </TableCell>
                  <TableCell className="text-right">
                    {caixa.saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {caixa.status === "Fechado" ? (
                      <Button size="sm" onClick={() => abrirCaixa(caixa.id)}>Abrir</Button>
                    ) : (
                      <Button size="sm" variant="destructive" onClick={() => fecharCaixa(caixa.id)}>Fechar</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setSelectedCaixa(caixa)}>Detalhes</Button>
                  </TableCell>
                </TableRow>
              ))}
              {caixasFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum caixa encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={!!selectedCaixa} onOpenChange={() => setSelectedCaixa(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do {selectedCaixa?.nome}</DialogTitle>
          </DialogHeader>
          {selectedCaixa && (
            <div className="space-y-4">
              <p>Status: <strong>{selectedCaixa.status}</strong></p>
              <p>Saldo atual: <strong>{selectedCaixa.saldo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong></p>
              <Separator />

              {/* Movimentações */}
              <p className="font-medium">Movimentações:</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(movimentacoesMock[selectedCaixa.id] || []).map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell>{mov.id}</TableCell>
                      <TableCell>{mov.tipo}</TableCell>
                      <TableCell>{mov.descricao}</TableCell>
                      <TableCell>{mov.data}</TableCell>
                      <TableCell className="text-right">
                        {mov.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!movimentacoesMock[selectedCaixa.id] || movimentacoesMock[selectedCaixa.id].length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhuma movimentação registrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <Separator />

              {/* Registrar nova movimentação */}
              <div className="space-y-2">
                <p className="font-medium">Registrar movimentação</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <select
                    className="border rounded px-2 py-2"
                    value={novaMov.tipo}
                    onChange={(e) => setNovaMov({ ...novaMov, tipo: e.target.value })}
                  >
                    <option value="Entrada">Entrada</option>
                    <option value="Saída">Saída</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Valor"
                    value={novaMov.valor}
                    onChange={(e) => setNovaMov({ ...novaMov, valor: e.target.value })}
                  />
                  <Input
                    placeholder="Descrição"
                    value={novaMov.descricao}
                    onChange={(e) => setNovaMov({ ...novaMov, descricao: e.target.value })}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={registrarMovimentacao}>Adicionar</Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCaixa(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de novo caixa */}
      <Dialog open={showNovoCaixa} onOpenChange={setShowNovoCaixa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Caixa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nome do caixa"
              value={novoCaixa.nome}
              onChange={(e) => setNovoCaixa({ ...novoCaixa, nome: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Saldo inicial"
              value={novoCaixa.saldo}
              onChange={(e) => setNovoCaixa({ ...novoCaixa, saldo: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNovoCaixa(false)}>Cancelar</Button>
            <Button onClick={criarCaixa}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
