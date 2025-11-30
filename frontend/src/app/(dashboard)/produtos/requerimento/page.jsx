"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Check, X, Eye, Clock, Truck, PackageCheck } from "lucide-react"
import { toast } from "sonner"

// MOCK DE DADOS (Simulando o que viria de uma API /api/requerimentos)
const requerimentosMock = [
  {
    id: "REQ-001",
    loja: "QG Blackout - Centro",
    data: "29/11/2025 10:30",
    status: "Pendente",
    itens: [
      { nome: "Pastilha de Freio Bosch", qtd: 10, codigo: "PF-001" },
      { nome: "Óleo 5w30", qtd: 20, codigo: "OL-530" }
    ],
    obs: "Urgência para cliente VIP."
  },
  {
    id: "REQ-002",
    loja: "QG Blackout - Zona Norte",
    data: "28/11/2025 15:45",
    status: "Aprovado",
    itens: [
      { nome: "Lâmpada H4", qtd: 50, codigo: "LP-H4" }
    ],
    obs: "Reposição mensal."
  },
  {
    id: "REQ-003",
    loja: "QG Blackout - Shopping",
    data: "28/11/2025 09:00",
    status: "Rejeitado",
    itens: [
      { nome: "Pneu 175/70 R13", qtd: 4, codigo: "PN-13" }
    ],
    obs: "Sem estoque na matriz no momento."
  }
]

export default function RequerimentosPage() {
  const [requerimentos, setRequerimentos] = useState(requerimentosMock)
  const [selectedReq, setSelectedReq] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)

  const handleStatusChange = (id, novoStatus) => {
    setLoadingAction(true)
    // Aqui você chamaria a API: await apiService.put(`/requerimentos/${id}`, { status: novoStatus })
    
    setTimeout(() => {
      setRequerimentos(prev => prev.map(r => r.id === id ? { ...r, status: novoStatus } : r))
      toast.success(`Requerimento ${novoStatus === 'Aprovado' ? 'aprovado' : 'rejeitado'} com sucesso.`)
      setSelectedReq(null)
      setLoadingAction(false)
    }, 600)
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case "Pendente": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1"/> Pendente</Badge>
      case "Aprovado": return <Badge className="bg-green-600 hover:bg-green-700"><Truck className="w-3 h-3 mr-1"/> Em Separação</Badge>
      case "Rejeitado": return <Badge variant="destructive"><X className="w-3 h-3 mr-1"/> Negado</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pedidos das Filiais</h1>
        <p className="text-muted-foreground">Gerenciamento de solicitações de reposição de estoque.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         {/* Cards de KPI */}
         <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pendentes</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-yellow-600">{requerimentos.filter(r => r.status === "Pendente").length}</div></CardContent>
         </Card>
         <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Aprovados (Hoje)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{requerimentos.filter(r => r.status === "Aprovado").length}</div></CardContent>
         </Card>
         <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Requisições</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{requerimentos.length}</div></CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Solicitações</CardTitle>
          <CardDescription>Clique em visualizar para aprovar ou rejeitar.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Filial Solicitante</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requerimentos.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-mono font-medium">{req.id}</TableCell>
                  <TableCell>{req.loja}</TableCell>
                  <TableCell>{req.data}</TableCell>
                  <TableCell>{req.itens.length} itens</TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedReq(req)}>
                      <Eye className="w-4 h-4 mr-2" /> Visualizar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Detalhes / Aprovação */}
      <Dialog open={!!selectedReq} onOpenChange={() => setSelectedReq(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido {selectedReq?.id}</DialogTitle>
            <div className="text-sm text-muted-foreground pt-1">
               Solicitado por: <span className="font-medium text-foreground">{selectedReq?.loja}</span> em {selectedReq?.data}
            </div>
          </DialogHeader>
          
          {selectedReq && (
            <div className="space-y-4">
               <div className="border rounded-md p-4 bg-muted/20">
                  <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                    <PackageCheck className="w-4 h-4" /> Itens Solicitados
                  </h4>
                  <ul className="space-y-2 text-sm">
                     {selectedReq.itens.map((item, idx) => (
                        <li key={idx} className="flex justify-between border-b last:border-0 pb-1 last:pb-0 border-dashed border-gray-300">
                           <span>{item.nome} <span className="text-xs text-muted-foreground">({item.codigo})</span></span>
                           <span className="font-bold">x{item.qtd}</span>
                        </li>
                     ))}
                  </ul>
               </div>

               {selectedReq.obs && (
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-100 text-sm text-yellow-900">
                     <strong>Observação da Loja:</strong> {selectedReq.obs}
                  </div>
               )}

               <div className="flex items-center justify-between pt-4">
                  <div className="text-sm font-medium">Ação necessária:</div>
                  {selectedReq.status === "Pendente" ? (
                    <div className="flex gap-2">
                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleStatusChange(selectedReq.id, "Rejeitado")} disabled={loadingAction}>
                           <X className="w-4 h-4 mr-2" /> Rejeitar
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(selectedReq.id, "Aprovado")} disabled={loadingAction}>
                           <Check className="w-4 h-4 mr-2" /> Aprovar Pedido
                        </Button>
                    </div>
                  ) : (
                    <Badge variant="outline">Pedido já processado ({selectedReq.status})</Badge>
                  )}
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}