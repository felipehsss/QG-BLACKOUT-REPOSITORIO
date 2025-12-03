'use client';

import { useState, useEffect } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableCell, 
  TableBody 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Check, 
  X, 
  Eye, 
  Clock, 
  Truck, 
  PackageCheck, 
  MapPin, 
  Archive, 
  ArrowRight, 
  Box, 
  Activity,
  Package,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion"; // Importando animações

import { 
  getSolicitacoes, 
  despacharSolicitacao, 
  receberSolicitacao, 
  rejeitarSolicitacao 
} from "@/services/solicitacaoService";

// --- Componentes Visuais ---

const StatusBadge = ({ status }) => {
  const styles = {
    'Pendente': 'bg-amber-100 text-amber-700 border-amber-200',
    'Em Trânsito': 'bg-blue-50 text-blue-700 border-blue-200',
    'Concluída': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Rejeitada': 'bg-red-50 text-red-700 border-red-200',
  };

  const Icon = {
    'Pendente': Package,
    'Em Trânsito': Truck,
    'Concluída': CheckCircle2,
    'Rejeitada': X,
  }[status] || Activity;

  return (
    <Badge variant="outline" className={`${styles[status] || 'bg-slate-100'} px-3 py-1 font-medium gap-1.5 transition-all`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </Badge>
  );
};

const TimelineStatus = ({ status }) => {
  const steps = [
    { id: 'Pendente', label: 'Solicitado', icon: Package },
    { id: 'Em Trânsito', label: 'Em Trânsito', icon: Truck },
    { id: 'Concluída', label: 'Entregue', icon: CheckCircle2 },
  ];

  const currentIndex = steps.findIndex(s => s.id === status);
  const isRejected = status === 'Rejeitada';

  if (isRejected) return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center p-4 bg-red-50/50 border border-red-100 rounded-lg text-red-600 text-sm font-medium"
    >
      <X className="w-4 h-4 mr-2" /> Solicitação cancelada ou rejeitada.
    </motion.div>
  );

  return (
    <div className="relative flex items-center justify-between w-full px-4 py-6 select-none">
      {/* Linha de fundo */}
      <div className="absolute top-1/2 left-0 w-full h-[3px] bg-slate-100 -z-10 rounded-full" />
      
      {/* Linha de progresso animada */}
      <motion.div 
        className="absolute top-1/2 left-0 h-[3px] bg-primary -z-10 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      {steps.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const Icon = step.icon;

        return (
          <div key={step.id} className="relative flex flex-col items-center">
            <motion.div 
              initial={false}
              animate={{ 
                backgroundColor: isActive ? "var(--primary)" : "#ffffff",
                borderColor: isActive ? "var(--primary)" : "#e2e8f0",
                scale: isCurrent ? 1.1 : 1
              }}
              className={`
                w-10 h-10 rounded-full border-2 flex items-center justify-center z-10
                ${isActive ? 'text-primary-foreground shadow-md' : 'text-slate-400'}
              `}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
            
            <motion.span 
              animate={{ color: isActive ? "var(--primary)" : "#94a3b8" }}
              className="absolute -bottom-6 text-[10px] uppercase tracking-wider font-bold whitespace-nowrap"
            >
              {step.label}
            </motion.span>

            {/* Animação de "ping" para o status atual */}
            {isCurrent && status !== 'Concluída' && (
              <span className="absolute w-10 h-10 rounded-full bg-primary/20 animate-ping -z-10" />
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- Página Principal ---

export default function RequerimentosPage() {
  const [requerimentos, setRequerimentos] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSolicitacoes();
      const sortedData = Array.isArray(data) 
        ? data.sort((a, b) => new Date(b.data_solicitacao) - new Date(a.data_solicitacao)) 
        : [];
      setRequerimentos(sortedData);
    } catch (error) {
      toast.error("Não foi possível carregar as solicitações.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, id) => {
    setLoadingAction(true);
    try {
      if (action === 'despachar') {
        await despacharSolicitacao(id);
        toast.success("Carga despachada! 🚚");
      } else if (action === 'receber') {
        await receberSolicitacao(id);
        toast.success("Recebimento confirmado! 🎉");
      } else if (action === 'rejeitar') {
        await rejeitarSolicitacao(id);
        toast.info("Solicitação rejeitada.");
      }
      
      // Pequeno delay para a animação ser percebida antes de atualizar os dados
      await new Promise(r => setTimeout(r, 500));
      await fetchData();
      
      // Se a ação foi receber, manter o modal aberto um pouco para ver o "Concluída"
      if (action !== 'receber') {
        setSelectedReq(null);
      } else {
        // Atualiza o objeto local para refletir a mudança instantaneamente no modal
        setSelectedReq(prev => ({ ...prev, status: 'Concluída' }));
      }

    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar a ação.");
    } finally {
      setLoadingAction(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : "-";

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 bg-slate-50/50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Logística de Reposição</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerenciamento de solicitações de estoque.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <Activity className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* KPI Cards (Simplificados) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pendentes', count: requerimentos.filter(r => r.status === "Pendente").length, icon: Package, color: 'text-amber-600' },
          { label: 'Em Trânsito', count: requerimentos.filter(r => r.status === "Em Trânsito").length, icon: Truck, color: 'text-blue-600' },
          { label: 'Entregues', count: requerimentos.filter(r => r.status === "Concluída").length, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Total', count: requerimentos.length, icon: Box, color: 'text-slate-600' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela Principal */}
      <Card className="border shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px] pl-6">ID</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Volumes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6} className="h-16 text-center"><div className="w-full h-4 bg-slate-100 animate-pulse rounded"/></TableCell></TableRow>
              ))
            ) : requerimentos.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center h-32 text-muted-foreground">Nenhuma solicitação.</TableCell></TableRow>
            ) : (
              requerimentos.map((req) => (
                <TableRow key={req.solicitacao_id} className="group hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-6 font-mono text-xs font-medium text-slate-500">#{req.solicitacao_id}</TableCell>
                  <TableCell className="font-medium text-slate-900">{req.loja_nome || `Loja ${req.loja_id}`}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDate(req.data_solicitacao)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{req.itens ? req.itens.length : 0} itens</TableCell>
                  <TableCell><StatusBadge status={req.status} /></TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedReq(req)}>
                      Detalhes <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal de Detalhes Animado */}
      <Dialog open={!!selectedReq} onOpenChange={(open) => !open && setSelectedReq(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden gap-0 border-none shadow-2xl">
          {selectedReq && (
            <AnimatePresence mode="wait">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
              >
                {/* Header Estilizado */}
                <div className="bg-slate-50 p-6 border-b relative">
                  <DialogHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="font-mono text-xs">REQ-{selectedReq.solicitacao_id}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(selectedReq.data_solicitacao).toLocaleDateString()}</span>
                    </div>
                    <DialogTitle className="text-xl font-bold">{selectedReq.loja_nome}</DialogTitle>
                    <DialogDescription className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Destino da Carga</DialogDescription>
                  </DialogHeader>

                  {/* Timeline */}
                  <div className="mt-8 mb-2">
                    <TimelineStatus status={selectedReq.status} />
                  </div>

                  {/* Animação Extra de Sucesso ao Concluir */}
                  {selectedReq.status === 'Concluída' && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className="absolute top-4 right-4 text-green-500"
                    >
                      <CheckCircle2 className="w-12 h-12 opacity-20" />
                    </motion.div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Archive className="w-4 h-4" /> Itens do Pedido
                  </h4>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-2">
                      {selectedReq.itens?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-lg border bg-white/50 text-sm">
                          <span className="font-medium">{item.produto_nome}</span>
                          <Badge variant="outline" className="bg-slate-100">x{item.quantidade_solicitada}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Ações */}
                <DialogFooter className="p-6 bg-slate-50/50 border-t flex items-center justify-between sm:justify-between">
                  <Button variant="ghost" onClick={() => setSelectedReq(null)}>Fechar</Button>

                  <div className="flex gap-2">
                    {selectedReq.status === "Pendente" && (
                      <>
                        <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleAction('rejeitar', selectedReq.solicitacao_id)} disabled={loadingAction}>
                          Rejeitar
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleAction('despachar', selectedReq.solicitacao_id)} disabled={loadingAction}>
                          {loadingAction ? <Activity className="w-4 h-4 animate-spin mr-2"/> : <Truck className="w-4 h-4 mr-2" />}
                          Despachar
                        </Button>
                      </>
                    )}

                    {selectedReq.status === "Em Trânsito" && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction('receber', selectedReq.solicitacao_id)} disabled={loadingAction}>
                          {loadingAction ? <Activity className="w-4 h-4 animate-spin mr-2"/> : <PackageCheck className="w-4 h-4 mr-2" />}
                          Confirmar Recebimento
                        </Button>
                      </motion.div>
                    )}
                    
                    {selectedReq.status === "Concluída" && (
                      <div className="flex items-center text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-2 rounded">
                        <Check className="w-4 h-4 mr-2" /> Processo Finalizado
                      </div>
                    )}
                  </div>
                </DialogFooter>
              </motion.div>
            </AnimatePresence>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}