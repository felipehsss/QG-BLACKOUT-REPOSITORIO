"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ClipboardList } from "lucide-react"

// Importa os dados do estoque (pode ser via API ou contexto)
import { estoqueMock } from "../estoque/page.jsx" // se estiver exportando do estoque

export default function RequerimentoPage() {
  // Filtra peças em falta ou sob encomenda
  const produtos = useMemo(() => {
    return estoqueMock.filter(p => p.quantidade === 0 || p.quantidade < p.minimo || p.status === "Sob encomenda")
  }, [])

  const [selecionados, setSelecionados] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [observacao, setObservacao] = useState("")
  const [historico, setHistorico] = useState([])

  const resumo = useMemo(() => {
    const falta = produtos.filter(p => p.quantidade === 0 || p.quantidade < p.minimo).length
    const encomenda = produtos.filter(p => p.status === "Sob encomenda").length
    return { falta, encomenda }
  }, [produtos])

  const toggleSelecionado = (id) => {
    setSelecionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const enviarRequisicao = () => {
    const itens = produtos.filter(p => selecionados.includes(p.id))
    const requisicao = {
      data: new Date().toLocaleString("pt-BR"),
      itens,
      observacao,
    }
    setHistorico(prev => [requisicao, ...prev])
    setSelecionados([])
    setObservacao("")
    setShowModal(false)
  }

  return (
    <div className="p-6 space-y-8">
      {/* Resumo */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Peças em falta</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{resumo.falta}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Sob encomenda</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{resumo.encomenda}</CardContent>
        </Card>
      </div>

      {/* Lista de peças */}
      <Card>
        <CardHeader><CardTitle>Selecionar peças para requisição</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Peça</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Qtd atual</TableHead>
                <TableHead>Mínimo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selecionados.includes(p.id)}
                      onChange={() => toggleSelecionado(p.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono">{p.codigo}</TableCell>
                  <TableCell>{p.nome}</TableCell>
                  <TableCell>{p.categoria}</TableCell>
                  <TableCell>
                    {p.status === "Sob encomenda" ? (
                      <Badge variant="secondary">Sob encomenda</Badge>
                    ) : (
                      <Badge variant="destructive">Falta</Badge>
                    )}
                  </TableCell>
                  <TableCell>{p.quantidade}</TableCell>
                  <TableCell>{p.minimo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end">
            <Button disabled={selecionados.length === 0} onClick={() => setShowModal(true)}>
              <ClipboardList className="w-4 h-4 mr-2" /> Enviar requisição
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de requisição */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar requisição</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p>Itens selecionados:</p>
            <ul className="list-disc pl-5">
              {produtos.filter(p => selecionados.includes(p.id)).map(p => (
                <li key={p.id}>{p.codigo} - {p.nome} ({p.status || "Falta"})</li>
              ))}
            </ul>
            <Separator />
            <textarea
              className="w-full min-h-[80px] border rounded p-2 text-sm"
              placeholder="Observações adicionais (ex: urgência, cliente aguardando...)"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={enviarRequisicao}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Histórico */}
      <Card>
        <CardHeader><CardTitle>Histórico de requisições</CardTitle></CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma requisição enviada ainda.</p>
          ) : (
            <ul className="space-y-2">
              {historico.map((req, idx) => (
                <li key={idx} className="border p-2 rounded">
                  <p className="font-semibold">Data: {req.data}</p>
                  <ul className="list-disc pl-5">
                    {req.itens.map(i => (
                      <li key={i.id}>{i.codigo} - {i.nome} ({i.status || "Falta"})</li>
                    ))}
                  </ul>
                  {req.observacao && <p><strong>Obs:</strong> {req.observacao}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
