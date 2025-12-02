"use client";

import React from "react";
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  MessageCircle, // Ícone para WhatsApp
  Mail,          // Ícone para Email
  Phone          // Ícone para Telefone
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Opcional: Se tiver tooltips instalados

export function FornecedoresTable({ data = [], onEdit, onDelete }) {
  const defaultOnEdit = (f) => console.log("Editar:", f);
  const defaultOnDelete = (f) => {
    if (confirm(`Confirma exclusão de "${f.nome ?? f.razao_social}" ?`)) console.log("Excluir:", f);
  };

  // Função para gerar link do WhatsApp
  const getWhatsappLink = (phone) => {
    if (!phone) return null;
    // Remove tudo que não é dígito
    const cleanNum = phone.replace(/\D/g, "");
    
    // Evita links quebrados com números muito curtos
    if (cleanNum.length < 10) return null;

    // Adiciona código do país Brasil (55) se não parecer ter
    const finalNum = cleanNum.length <= 11 ? `55${cleanNum}` : cleanNum;
    
    return `https://wa.me/${finalNum}`;
  };

  return (
    <div className="rounded-md border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[40%]">Razão Social / Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead className="hidden md:table-cell">Contato Rápido</TableHead>
            <TableHead className="w-[50px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                Nenhum fornecedor encontrado.
              </TableCell>
            </TableRow>
          ) : (
            data.map((fornecedor, idx) => {
              const key = fornecedor.id ?? fornecedor.fornecedor_id ?? idx;
              
              const nome = fornecedor.nome ?? fornecedor.razao_social ?? "Sem nome";
              const cnpj = fornecedor.cnpj || "Não informado";
              const email = fornecedor.email || null;
              const telefone = fornecedor.telefone || null;
              const whatsappLink = getWhatsappLink(telefone);

              return (
                <TableRow key={key} className="hover:bg-muted/50 transition-colors">
                  {/* Nome e CNPJ */}
                  <TableCell className="font-medium text-foreground">
                    <div className="flex flex-col">
                      <span>{nome}</span>
                      <span className="md:hidden text-xs text-muted-foreground">{cnpj}</span>
                      {/* Em mobile, mostra telefone texto se existir */}
                      <span className="md:hidden text-xs text-muted-foreground mt-1">
                        {telefone || email || ""}
                      </span>
                    </div>
                  </TableCell>

                  {/* CNPJ (Desktop) */}
                  <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                    {cnpj}
                  </TableCell>

                  {/* Coluna de Contato Rápido (Desktop) */}
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      {/* Botão Email */}
                      {email ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => window.location.href = `mailto:${email}`}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Enviar Email: {email}</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <div className="h-8 w-8" /> // Espaçador
                      )}

                      {/* Botão WhatsApp */}
                      {whatsappLink ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => window.open(whatsappLink, '_blank')}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Abrir WhatsApp: {telefone}</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        // Se não tiver link válido, mostra apenas o ícone de telefone estático ou texto
                        telefone && <span className="text-xs text-muted-foreground ml-2">{telefone}</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem
                          onClick={() => (onEdit ?? defaultOnEdit)(fornecedor)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={() => (onDelete ?? defaultOnDelete)(fornecedor)}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}