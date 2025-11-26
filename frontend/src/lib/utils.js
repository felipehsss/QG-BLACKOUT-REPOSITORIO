import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Funções de formatação de documentos e telefone

export const formatCPF = (value) => {
  if (!value) return "";
  const numericValue = value.replace(/\D/g, "").slice(0, 11);
  // Aplica a máscara de forma incremental
  return numericValue
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
};

export const formatPhone = (value) => {
  if (!value) return "";
  // Remove tudo que não for dígito e limita a 11 caracteres
  const numericValue = value.replace(/\D/g, "").slice(0, 11);

  // Aplica a máscara de celular (11 dígitos)
  if (numericValue.length > 10) {
    return numericValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  // Aplica a máscara de telefone fixo (10 dígitos) ou celular incompleto
  return numericValue
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

export const formatCNPJ = (value) => {
  if (!value) return "";
  const numericValue = value.replace(/\D/g, "").slice(0, 14);
  return numericValue
    .replace(/(\d{2})(\d)/, "$1.$2") // xx.
    .replace(/(\d{2})\.(\d{3})(\d)/, "$1.$2.$3") // xx.xxx.
    .replace(/\.(\d{3})(\d)/, ".$1/$2") // xx.xxx.xxx/
    .replace(/(\d{4})(\d)/, "$1-$2"); // xx.xxx.xxx/xxxx-xx
};
