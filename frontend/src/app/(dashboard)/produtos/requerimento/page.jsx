"use client";

import { useState, useEffect } from "react";
import { 
  Card, CardHeader, CardTitle, CardContent, CardDescription 
} from "@/components/ui/card";
import { 
  Table, TableHeader, TableRow, TableHead, TableCell, TableBody 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Check, X, Truck, PackageCheck, MapPin, Archive, ArrowRight, Box, Activity, Package, CheckCircle2, Search, RotateCcw, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion"; 

// Serviços e Contexto
import { 
  getSolicitacoes, 
  despacharSolicitacao, 
  receberSolicitacao, 
  rejeitarSolicitacao 
} from "@/services/solicitacaoService";
import { getEstoqueCompleto } from "@/services/estoqueService"; // Importação Nova
import { useAuth } from "@/contexts/AuthContext";

// --- Componentes Visuais ---

const StatusBadge = ({ status }) => {
  const styles = {
    'Pendente': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    'Em Trânsito': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    'Concluída': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    'Rejeitada': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  };

  const Icon = {
    'Pendente': Package,
    'Em Trânsito': Truck,
    'Concluída': CheckCircle2,
    'Rejeitada': X,
  }[status] || Activity;

  return (
    <Badge variant="outline" className={`${styles[status] || 'bg-muted text-muted-foreground'} px-3 py-1 font-medium gap-1.5 transition-all`}>
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
    <div className="flex items-center justify-center p-4 bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
      <X className="w-4 h-4 mr-2" /> Solicitação cancelada ou rejeitada.
    </div>
  );

  return (
    <div className="relative flex items-center justify-between w-full px-4 py-6 select-none">
      <div className="absolute top-1/2 left-0 w-full h-[3px] bg-muted -z-10 rounded-full" />
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
                backgroundColor: isActive ? "hsl(var(--primary))" : "hsl(var(--background))",
                borderColor: isActive ? "hsl(var(--primary))" : "hsl(var(--border))",
                scale: isCurrent ? 1.1 : 1
              }}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 ${isActive ? 'text-primary-foreground shadow-md' : 'text-muted-foreground'}`}
            >
              <Icon className="w-5 h-5" />
            </motion.div>
            <span className={`absolute -bottom-6 text-[10px] uppercase tracking-wider font-bold whitespace-nowrap ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function RequerimentosPage() {
  const [requerimentos, setRequerimentos] = useState([]);
  const [estoqueMatriz, setEstoqueMatriz] = useState([]); // Estado para o estoque
  const [filteredReqs, setFilteredReqs] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Filtragem
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = requerimentos.filter(req => 
      (req.loja_nome || `Loja ${req.loja_id}`).toLowerCase().includes(term) ||
      String(req.solicitacao_id).includes(term) ||
      req.status.toLowerCase().includes(term)
    );
    setFilteredReqs(filtered);
  }, [searchTerm, requerimentos]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Busca Solicitações e Estoque em paralelo
      const [reqData, estData] = await Promise.all([
        getSolicitacoes(token),
        getEstoqueCompleto(token)
      ]);

      const sortedReqs = Array.isArray(reqData) 
        ? reqData.sort((a, b) => new Date(b.data_solicitacao) - new Date(a.data_solicitacao)) 
        : [];
      setRequerimentos(sortedReqs);

      // Filtra apenas o estoque da Matriz (assumindo ID 1 ou nome contendo Matriz)
      const estoqueMatrizData = Array.isArray(estData) 
        ? estData.filter(item => item.loja_id === 1 || (item.loja_nome && item.loja_nome.toLowerCase().includes('matriz')))
        : [];
      setEstoqueMatriz(estoqueMatrizData);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  // Helper para verificar disponibilidade
  const checkEstoque = (produtoId) => {
    const item = estoqueMatriz.find(e => e.produto_id === produtoId || e.produto?.produto_id === produtoId);
    return item ? Number(item.quantidade) : 0;
  };

  const handleAction = async (action, id) => {
    setLoadingAction(true);
    try {
      if (action === 'despachar') await despacharSolicitacao(id, token);
      else if (action === 'receber') await receberSolicitacao(id, token);
      else if (action === 'rejeitar') await rejeitarSolicitacao(id, token);
      
      toast.success(`Ação '${action}' realizada com sucesso!`);
      await fetchData();
      
      if (action === 'receber') setSelectedReq(prev => ({ ...prev, status: 'Concluída' }));
      else setSelectedReq(null);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar a ação.");
    } finally {
      setLoadingAction(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : "-";

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary" />
            Logística de Reposição
          </h1>
          <p className="text-muted-foreground">Gerenciamento de solicitações e verificação de estoque.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RotateCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPIs (mantidos iguais) */}
        {[
          { label: 'Pendentes', count: requerimentos.filter(r => r.status === "Pendente").length, icon: Package, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Em Trânsito', count: requerimentos.filter(r => r.status === "Em Trânsito").length, icon: Truck, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Entregues', count: requerimentos.filter(r => r.status === "Concluída").length, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Total', count: requerimentos.length, icon: Box, color: 'text-muted-foreground' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stat.count}</div></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista de Solicitações</CardTitle>
          <CardDescription>Clique em Detalhes para verificar a disponibilidade de estoque.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar loja, ID ou status..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Volumes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Carregando...</TableCell></TableRow>
                ) : filteredReqs.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center h-32 text-muted-foreground">Nenhuma solicitação encontrada.</TableCell></TableRow>
                ) : (
                  filteredReqs.map((req) => (
                    <TableRow key={req.solicitacao_id} className="group hover:bg-muted/50">
                      <TableCell className="font-mono text-xs font-medium text-muted-foreground">#{req.solicitacao_id}</TableCell>
                      <TableCell className="font-medium">{req.loja_nome || `Loja ${req.loja_id}`}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDate(req.data_solicitacao)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{req.itens ? req.itens.length : 0} itens</TableCell>
                      <TableCell><StatusBadge status={req.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedReq(req)}>
                          Detalhes <ArrowRight className="w-3.5 h-3.5 ml-2" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes com Verificação de Estoque */}
      <Dialog open={!!selectedReq} onOpenChange={(open) => !open && setSelectedReq(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl bg-card">
          {selectedReq && (
            <AnimatePresence mode="wait">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-muted/40 p-6 border-b">
                  <DialogHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="font-mono text-xs">REQ-{selectedReq.solicitacao_id}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(selectedReq.data_solicitacao).toLocaleDateString()}</span>
                    </div>
                    <DialogTitle className="text-xl font-bold">{selectedReq.loja_nome}</DialogTitle>
                    <DialogDescription className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Destino da Carga</DialogDescription>
                  </DialogHeader>
                  <div className="mt-6"><TimelineStatus status={selectedReq.status} /></div>
                </div>

                <div className="p-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Archive className="w-4 h-4" /> Análise de Disponibilidade (Estoque Matriz)
                  </h4>
                  <ScrollArea className="h-[240px] pr-4">
                    <div className="space-y-3">
                      {selectedReq.itens?.map((item, idx) => {
                        // Lógica de Disponibilidade
                        const disponivel = checkEstoque(item.produto_id);
                        const solicitado = Number(item.quantidade_solicitada);
                        const temEstoque = disponivel >= solicitado;
                        const isPendente = selectedReq.status === 'Pendente';

                        return (
                          <div key={idx} className={`flex justify-between items-center p-3 rounded-lg border text-sm ${isPendente && !temEstoque ? 'border-red-200 bg-red-50 dark:bg-red-900/10' : 'bg-muted/20'}`}>
                            <div>
                              <span className="font-medium block">{item.produto_nome}</span>
                              <span className="text-xs text-muted-foreground">SKU: {item.sku || item.produto_id}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              {/* Exibe estoque disponível apenas se estiver pendente */}
                              {isPendente && (
                                <div className={`text-right text-xs ${temEstoque ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400 font-bold'}`}>
                                  <div className="flex items-center justify-end gap-1">
                                    {temEstoque ? <CheckCircle2 className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                                    Disponível: {disponivel}
                                  </div>
                                </div>
                              )}
                              <Badge variant="outline" className="bg-background h-8 px-3 text-sm">
                                Solicitado: {solicitado}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  
                  {/* Alerta de falta de estoque */}
                  {selectedReq.status === 'Pendente' && selectedReq.itens?.some(i => checkEstoque(i.produto_id) < i.quantidade_solicitada) && (
                    <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-md flex items-center border border-red-200 dark:border-red-800">
                      <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Atenção: Há itens com estoque insuficiente na Matriz para atender este pedido integralmente.</span>
                    </div>
                  )}
                </div>

                <DialogFooter className="p-6 bg-muted/40 border-t flex items-center justify-between sm:justify-between">
                  <Button variant="ghost" onClick={() => setSelectedReq(null)}>Fechar</Button>
                  <div className="flex gap-2">
                    {selectedReq.status === "Pendente" && (
                      <>
                        <Button variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleAction('rejeitar', selectedReq.solicitacao_id)} disabled={loadingAction}>
                          Rejeitar
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleAction('despachar', selectedReq.solicitacao_id)} disabled={loadingAction}>
                          {loadingAction ? <Activity className="w-4 h-4 animate-spin mr-2"/> : <Truck className="w-4 h-4 mr-2" />}
                          Despachar
                        </Button>
                      </>
                    )}
                    {selectedReq.status === "Em Trânsito" && (
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction('receber', selectedReq.solicitacao_id)} disabled={loadingAction}>
                         Confirmar Recebimento
                      </Button>
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