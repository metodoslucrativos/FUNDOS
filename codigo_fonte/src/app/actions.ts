// src/app/actions.ts
"use server";

// Este arquivo é mantido para estrutura, mas a lógica principal
// foi movida para o lado do cliente usando localStorage.
// As funções aqui não devem ser chamadas diretamente pelos componentes
// que agora usam localStorageUtils.

import { revalidatePath } from "next/cache";

console.warn("actions.ts: Este arquivo contém lógica de servidor obsoleta. A persistência agora é feita via localStorage no cliente.");

// Função placeholder para adicionar aplicação (não usar)
export async function addAplicacao(formData: FormData) {
  console.error("addAplicacao (Server Action) chamada - Lógica movida para localStorageUtils no cliente.");
  // Simula um retorno para não quebrar chamadas antigas, mas indica erro.
  return { success: false, message: "Erro: Lógica movida para o cliente (localStorage)." };
}

// Função placeholder para buscar aplicações (não usar)
export async function getAplicacoes() {
  console.error("getAplicacoes (Server Action) chamada - Lógica movida para localStorageUtils no cliente.");
  return []; // Retorna array vazio
}

// Função placeholder para adicionar resgate (não usar)
export async function addResgate(formData: FormData) {
  console.error("addResgate (Server Action) chamada - Lógica movida para localStorageUtils no cliente.");
  // Simula um retorno para não quebrar chamadas antigas, mas indica erro.
  return { success: false, message: "Erro: Lógica movida para o cliente (localStorage)." };
}

// Função placeholder para buscar resgates (não usar)
export async function getResgatesPorAplicacao(aplicacaoId: number) {
    console.error("getResgatesPorAplicacao (Server Action) chamada - Lógica movida para localStorageUtils no cliente.");
    return [];
}

