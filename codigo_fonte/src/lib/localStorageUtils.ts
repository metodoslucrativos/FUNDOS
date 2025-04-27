// src/lib/localStorageUtils.ts

const APLICACOES_KEY = "controleFinanceiroAplicacoes";
const RESGATES_KEY = "controleFinanceiroResgates";

// --- Aplicações ---

export const getStoredAplicacoes = (): any[] => {
  if (typeof window === "undefined") {
    return []; // Não fazer nada no servidor
  }
  try {
    const storedData = localStorage.getItem(APLICACOES_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // Garante que sempre retorna um array e inicializa total_resgatado se não existir
      return Array.isArray(parsedData) ? parsedData.map(app => ({ ...app, total_resgatado: app.total_resgatado || 0 })) : [];
    } else {
      // Inicializa com dados de exemplo se não houver nada
      const exampleData = [
        {
          id: 1,
          nome_empresa: "Empresa Exemplo LS",
          nome_banco: "Bradesco",
          codigo_conta: "12345",
          data_aplicacao: "2025-01-15",
          valor_aplicado: 10000,
          tipo_aplicacao: "CDB",
          percentual_cdi: 110,
          created_at: "2025-01-15T00:00:00.000Z",
          updated_at: new Date().toISOString(),
          total_resgatado: 0
        }
      ];
      saveStoredAplicacoes(exampleData);
      return exampleData;
    }
  } catch (error) {
    console.error("Erro ao ler aplicações do localStorage:", error);
    localStorage.removeItem(APLICACOES_KEY); // Limpa dados corrompidos
    return [];
  }
};

export const saveStoredAplicacoes = (aplicacoes: any[]): void => {
  if (typeof window === "undefined") {
    return; // Não fazer nada no servidor
  }
  try {
    localStorage.setItem(APLICACOES_KEY, JSON.stringify(aplicacoes));
  } catch (error) {
    console.error("Erro ao salvar aplicações no localStorage:", error);
  }
};

export const addStoredAplicacao = (novaAplicacaoData: Omit<any, 'id' | 'created_at' | 'updated_at' | 'total_resgatado'>): any => {
  const aplicacoes = getStoredAplicacoes();
  const nextId = aplicacoes.length > 0 ? Math.max(...aplicacoes.map(a => a.id)) + 1 : 1;
  const novaAplicacao = {
    ...novaAplicacaoData,
    id: nextId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_resgatado: 0
  };
  const novasAplicacoes = [...aplicacoes, novaAplicacao];
  saveStoredAplicacoes(novasAplicacoes);
  return novaAplicacao; // Retorna a aplicação adicionada com ID
};

export const deleteStoredAplicacao = (id: number): boolean => {
  let aplicacoes = getStoredAplicacoes();
  const initialLength = aplicacoes.length;
  aplicacoes = aplicacoes.filter(app => app.id !== id);
  if (aplicacoes.length < initialLength) {
    saveStoredAplicacoes(aplicacoes);
    // Também exclui resgates associados
    let resgates = getStoredResgates();
    resgates = resgates.filter(res => res.aplicacao_id !== id);
    saveStoredResgates(resgates);
    return true;
  }
  return false;
};

export const updateStoredAplicacao = (id: number, updatedData: Partial<Omit<any, 'id' | 'created_at' | 'updated_at' | 'total_resgatado'>>): any | null => {
  let aplicacoes = getStoredAplicacoes();
  const index = aplicacoes.findIndex(app => app.id === id);
  if (index !== -1) {
    // Mantém o total_resgatado e IDs
    aplicacoes[index] = {
      ...aplicacoes[index],
      ...updatedData,
      updated_at: new Date().toISOString()
    };
    saveStoredAplicacoes(aplicacoes);
    return aplicacoes[index];
  }
  return null;
};

export const getStoredAplicacaoById = (id: number): any | null => {
    const aplicacoes = getStoredAplicacoes();
    return aplicacoes.find(app => app.id === id) || null;
};

// --- Resgates ---

export const getStoredResgates = (): any[] => {
  if (typeof window === "undefined") {
    return []; // Não fazer nada no servidor
  }
  try {
    const storedData = localStorage.getItem(RESGATES_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Erro ao ler resgates do localStorage:", error);
    localStorage.removeItem(RESGATES_KEY); // Limpa dados corrompidos
    return [];
  }
};

export const saveStoredResgates = (resgates: any[]): void => {
  if (typeof window === "undefined") {
    return; // Não fazer nada no servidor
  }
  try {
    localStorage.setItem(RESGATES_KEY, JSON.stringify(resgates));
  } catch (error) {
    console.error("Erro ao salvar resgates no localStorage:", error);
  }
};

export const addStoredResgate = (novoResgateData: Omit<any, 'id' | 'created_at'>): any => {
  const resgates = getStoredResgates();
  const nextId = resgates.length > 0 ? Math.max(...resgates.map(r => r.id)) + 1 : 1;
  const novoResgate = {
    ...novoResgateData,
    id: nextId,
    created_at: new Date().toISOString()
  };
  const novosResgates = [...resgates, novoResgate];
  saveStoredResgates(novosResgates);

  // Atualiza o total_resgatado na aplicação correspondente no localStorage
  const aplicacoes = getStoredAplicacoes();
  const aplicacaoIndex = aplicacoes.findIndex(a => a.id === novoResgate.aplicacao_id);
  if (aplicacaoIndex !== -1) {
    aplicacoes[aplicacaoIndex].total_resgatado = (aplicacoes[aplicacaoIndex].total_resgatado || 0) + novoResgate.valor_resgatado;
    saveStoredAplicacoes(aplicacoes);
  }

  return novoResgate; // Retorna o resgate adicionado com ID
};

