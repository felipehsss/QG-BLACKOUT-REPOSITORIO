"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, X, Eye, Clock, Truck, PackageCheck, MapPin, Archive } from "lucide-react"
import { toast } from "sonner"
// Importamos tudo do serviço
import * as solicitacaoService from "@/services/solicitacaoService"

// Componente simples de Timeline para visualizar o status
const TimelineStatus = ({ status }) => {
  const steps = [
    { id: 'Pendente', label: 'Solicitado', icon: Clock },
    { id: 'Em Trânsito', label: 'Em Trânsito', icon: Truck },
    { id: 'Concluída', label: 'Entregue', icon: MapPin },
  ];

  const currentIndex = steps.findIndex(s => s.id === status);
  const isRejected = status === 'Rejeitada';

  if(isRejected) return (
    <div className="text-red-600 font-bold flex items-center justify-center p-4 bg-red-50 rounded-lg">
        <X className="mr-2"/> Pedido Recusado pela Matriz
    </div>
  )

  return (
    <div className="flex items-center justify-between w-full px-4 py-6">
      {steps.map((step, index) => {
        // Lógica: se o status atual for 'Concluída', todos os passos anteriores ficam ativos
        const isActive = index <= currentIndex || (status === 'Concluída'); 
        const isCurrent = index === currentIndex;
        
        return (
          <div key={step.id} className="flex flex-col items-center relative z-10 w-1/3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 
              ${isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-muted-foreground/30'}
              ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}
            `}>
              <step.icon className="w-5 h-5" />
            </div>
            <span className={`text-xs mt-2 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
            {/* Linha conectora entre as bolinhas */}
            {index < steps.length - 1 && (
              <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 
                ${index < currentIndex ? 'bg-primary' : 'bg-muted-foreground/20'}
              `} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function RequerimentosPage() {
  const [requerimentos, setRequerimentos] = useState([])
  const [selectedReq, setSelectedReq] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Chama o serviço para buscar a lista
      const data = await solicitacaoService.getSolicitacoes();
      setRequerimentos(data);
    } catch (error) {
      toast.error("Erro ao carregar dados.");
    }
  };

  // Função centralizada para lidar com as ações dos botões
  const handleAction = async (action, id) => {
    setLoadingAction(true)
    try {
      if (action === 'despachar') {
        // CORREÇÃO: Chama a nova função 'despacharSolicitacao'
        await solicitacaoService.despacharSolicitacao(id);
        toast.success("Caminhão despachado! Estoque saiu da Matriz.");
      } else if (action === 'receber') {
        // CORREÇÃO: Chama a nova função 'receberSolicitacao'
        await solicitacaoService.receberSolicitacao(id);
        toast.success("Mercadoria recebida e adicionada ao estoque local.");
      } else if (action === 'rejeitar') {
        await solicitacaoService.rejeitarSolicitacao(id);
        toast.info("Pedido rejeitado.");
      }
      
      // Atualiza a lista e fecha o modal
      await fetchData();
      setSelectedReq(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro na operação");
    } finally {
      setLoadingAction(false)
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case "Pendente": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Clock className="w-3 h-3 mr-1"/> Aguardando Aprovação</Badge>
      case "Em Trânsito": return <Badge className="bg-blue-600 hover:bg-blue-700 animate-pulse"><Truck className="w-3 h-3 mr-1"/> Em Trânsito</Badge>
      case "Concluída": return <Badge className="bg-green-600 hover:bg-green-700"><Check className="w-3 h-3 mr-1"/> Recebido</Badge>
      case "Rejeitada": return <Badge variant="destructive"><X className="w-3 h-3 mr-1"/> Cancelado</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const formatDate = (d) => d ? new Date(d).toLocaleString('pt-BR') : "-";

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logística de Reposição</h1>
        <p className="text-muted-foreground">Controle de transferências de estoque entre Matriz e Filiais.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
         <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{requerimentos.filter(r => r.status === "Pendente").length}</div></CardContent>
         </Card>
         <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-blue-600">Em Trânsito</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-blue-700">{requerimentos.filter(r => r.status === "Em Trânsito").length}</div></CardContent>
         </Card>
         <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-600">Entregues</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-700">{requerimentos.filter(r => r.status === "Concluída").length}</div></CardContent>
         </Card>
         <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{requerimentos.length}</div></CardContent>
         </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Painel de Rastreio</CardTitle>
          <CardDescription>Acompanhe o status de cada solicitação.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Rastreio</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Data Pedido</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Status Logístico</TableHead>
                <TableHead className="text-right">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requerimentos.map((req) => (
                <TableRow key={req.solicitacao_id}>
                  <TableCell className="font-mono text-xs">TRACK-{req.solicitacao_id.toString().padStart(4, '0')}</TableCell>
                  <TableCell className="font-medium">{req.loja_nome}</TableCell>
                  <TableCell>{formatDate(req.data_solicitacao)}</TableCell>
                  <TableCell>{req.itens ? req.itens.length : 0} volumes</TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedReq(req)}>
                      <Eye className="w-4 h-4 mr-2" /> Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {requerimentos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    Nenhuma solicitação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Detalhes Logísticos */}
      <Dialog open={!!selectedReq} onOpenChange={() => setSelectedReq(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Rastreamento #{selectedReq?.solicitacao_id}</DialogTitle>
            <div className="text-sm text-muted-foreground">
               Destino: <span className="font-bold text-foreground">{selectedReq?.loja_nome}</span>
            </div>
          </DialogHeader>
          
          {selectedReq && (
            <div className="space-y-6">
               {/* Timeline Visual */}
               <div className="bg-slate-50 rounded-lg border p-2">
                  <TimelineStatus status={selectedReq.status} />
               </div>

               {/* Lista de Itens */}
               <div className="border rounded-md">
                  <div className="bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center">
                    <Archive className="w-3 h-3 mr-2"/> Conteúdo da Carga
                  </div>
                  <div className="p-2 max-h-[200px] overflow-y-auto">
                    <ul className="space-y-1 text-sm">
                        {selectedReq.itens && selectedReq.itens.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center px-2 py-1 hover:bg-slate-50 rounded">
                                <span className="text-muted-foreground">{item.sku}</span>
                                <span className="flex-1 mx-4 truncate font-medium">{item.produto_nome}</span>
                                <span className="font-bold bg-slate-200 px-2 py-0.5 rounded text-xs">x{item.quantidade_solicitada}</span>
                            </li>
                        ))}
                    </ul>
                  </div>
               </div>

               {/* Ações Logísticas (Botões) */}
               <div className="flex justify-end gap-2 pt-2 border-t">
                  {selectedReq.status === "Pendente" && (
                    <>
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction('rejeitar', selectedReq.solicitacao_id)} disabled={loadingAction}>
                           <X className="w-4 h-4 mr-2"/> Recusar
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleAction('despachar', selectedReq.solicitacao_id)} disabled={loadingAction}>
                           <Truck className="w-4 h-4 mr-2"/> Aprovar e Despachar
                        </Button>
                    </>
                  )}

                  {selectedReq.status === "Em Trânsito" && (
                    <Button className="bg-green-600 hover:bg-green-700 text-white w-full" onClick={() => handleAction('receber', selectedReq.solicitacao_id)} disabled={loadingAction}>
                        <PackageCheck className="w-4 h-4 mr-2"/> Confirmar Recebimento (Check-in)
                    </Button>
                  )}

                  {selectedReq.status === "Concluída" && (
                     <div className="text-green-700 flex items-center text-sm font-medium bg-green-50 px-3 py-2 rounded-md w-full justify-center">
                        <Check className="w-4 h-4 mr-2"/> Processo Logístico Finalizado
                     </div>
                  )}
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}