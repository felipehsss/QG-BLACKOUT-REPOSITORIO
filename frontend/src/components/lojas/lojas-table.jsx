"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, MapPin, Phone, Building2 } from "lucide-react";

export function LojasTable({ data = [], onEdit, onDelete, viewMode = 'table' }) {
  
  // Função auxiliar para renderizar o Status
  const renderStatus = (ativo) => (
    (ativo === 1 || ativo === true) ? 
    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Ativa</Badge> : 
    <Badge variant="destructive">Inativa</Badge>
  );

  // Função para determinar o Tipo (Matriz ou Filial) baseado no banco
  const getTipoLoja = (loja) => {
    // Verifica se is_matriz é 1 (true) ou 0 (false)
    return (loja.is_matriz === 1 || loja.is_matriz === true) ? "Matriz" : "Filial";
  };

  // Função auxiliar para renderizar o Menu de Ações
  const ActionMenu = ({ loja }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEdit(loja)}>
          <Edit className="mr-2 h-4 w-4" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(loja.id ?? loja.loja_id)}>
          <Trash2 className="mr-2 h-4 w-4" /> Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // --- MODO GRID (CARDS) ---
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.length > 0 ? (
          data.map((loja) => (
            <Card key={loja.id ?? loja.loja_id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base font-semibold line-clamp-1" title={loja.nome}>
                    {loja.nome}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {getTipoLoja(loja)}
                  </div>
                </div>
                <div className="ml-2">
                    {renderStatus(loja.is_ativo)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2 py-4 text-sm text-muted-foreground">
                 {/* Exibe Email se existir */}
                 {loja.email && (
                  <div className="text-xs text-blue-600 truncate mb-2">
                    {loja.email}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 opacity-70 shrink-0" />
                  <span className="truncate" title={loja.endereco}>
                    {/* Como não tem cidade no DB, mostramos o endereço */}
                    {loja.endereco || "Endereço não inf."}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 opacity-70 shrink-0" />
                  <span>{loja.telefone || "Sem telefone"}</span>
                </div>
              </CardContent>

              <CardFooter className="border-t pt-4 flex justify-between items-center bg-muted/20">
                <span className="text-xs text-muted-foreground">ID: {loja.id ?? loja.loja_id}</span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(loja)}>
                        <Edit className="h-3 w-3 mr-1" /> Editar
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(loja.id ?? loja.loja_id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            Nenhuma loja encontrada.
          </div>
        )}
      </div>
    );
  }

  // --- MODO TABELA (PADRÃO) ---
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome / Razão Social</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((loja) => (
              <TableRow key={loja.id ?? loja.loja_id}>
                <TableCell className="font-medium">
                  {loja.nome}
                  {/* Exibe o e-mail pequeno abaixo do nome se existir */}
                  {loja.email && <div className="text-xs text-muted-foreground">{loja.email}</div>}
                </TableCell>
                {/* Ajustado para exibir Endereço, pois cidade não existe no banco */}
                <TableCell>{loja.endereco || "-"}</TableCell>
                <TableCell>
                    <Badge variant="secondary" className="font-normal">
                        {getTipoLoja(loja)}
                    </Badge>
                </TableCell>
                <TableCell>{loja.telefone || "-"}</TableCell>
                <TableCell>{renderStatus(loja.is_ativo)}</TableCell>
                <TableCell className="text-right">
                  <ActionMenu loja={loja} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhuma loja encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}