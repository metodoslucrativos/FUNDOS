// src/lib/calculadora.ts

// --- Constantes e Tabelas ---

// Tabela Regressiva de IR para Renda Fixa (exceto PGBL/VGBL)
const tabelaIR = [
  { dias: 180, aliquota: 0.225 }, // Até 180 dias
  { dias: 360, aliquota: 0.20 },  // De 181 a 360 dias
  { dias: 720, aliquota: 0.175 }, // De 361 a 720 dias
  { dias: Infinity, aliquota: 0.15 }, // Acima de 720 dias
];

// Tabela Regressiva de IOF sobre Rendimentos (para resgates em menos de 30 dias)
const tabelaIOF = [
  { dias: 1, aliquota: 0.96 }, { dias: 2, aliquota: 0.93 }, { dias: 3, aliquota: 0.90 },
  { dias: 4, aliquota: 0.86 }, { dias: 5, aliquota: 0.83 }, { dias: 6, aliquota: 0.80 },
  { dias: 7, aliquota: 0.76 }, { dias: 8, aliquota: 0.73 }, { dias: 9, aliquota: 0.70 },
  { dias: 10, aliquota: 0.66 }, { dias: 11, aliquota: 0.63 }, { dias: 12, aliquota: 0.60 },
  { dias: 13, aliquota: 0.56 }, { dias: 14, aliquota: 0.53 }, { dias: 15, aliquota: 0.50 },
  { dias: 16, aliquota: 0.46 }, { dias: 17, aliquota: 0.43 }, { dias: 18, aliquota: 0.40 },
  { dias: 19, aliquota: 0.36 }, { dias: 20, aliquota: 0.33 }, { dias: 21, aliquota: 0.30 },
  { dias: 22, aliquota: 0.26 }, { dias: 23, aliquota: 0.23 }, { dias: 24, aliquota: 0.20 },
  { dias: 25, aliquota: 0.16 }, { dias: 26, aliquota: 0.13 }, { dias: 27, aliquota: 0.10 },
  { dias: 28, aliquota: 0.06 }, { dias: 29, aliquota: 0.03 }, { dias: 30, aliquota: 0.00 },
];

// Taxa DI diária simulada (ex: 10.40% ao ano / 252 dias úteis)
// Idealmente, buscar de uma API, mas usaremos um valor fixo para simplificar.
// (1 + 0.1040)^(1/252) - 1 ≈ 0.000393
const TAXA_DI_DIARIA_SIMULADA = 0.000393; // Aproximadamente 10.40% a.a.

// --- Funções Auxiliares ---

const calcularDiasCorridos = (dataInicio: Date, dataFim: Date): number => {
  if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) return 0;
  const diffTime = Math.max(0, dataFim.getTime() - dataInicio.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getAliquotaIR = (dias: number): number => {
  for (const faixa of tabelaIR) {
    if (dias <= faixa.dias) {
      return faixa.aliquota;
    }
  }
  return 0.15; // Fallback para a menor alíquota
};

const getAliquotaIOF = (dias: number): number => {
  if (dias >= 30) return 0;
  const faixa = tabelaIOF.find(f => f.dias === dias);
  return faixa ? faixa.aliquota : 0; // Retorna 0 se não encontrar (ou para dias >= 30)
};

// --- Função Principal de Cálculo ---

export const calcularRentabilidade = (
  valorAplicado: number,
  tipoAplicacao: string,
  dataAplicacao: Date,
  percentualCDI: number | null,
  dataCalculo: Date
): {
  valorBruto: number;
  valorLiquido: number;
  rendimentoBruto: number;
  rendimentoLiquido: number;
  ir: number;
  iof: number;
  percentualRentabilidadeBruta: number;
  percentualRentabilidadeLiquida: number;
  diasCorridos: number;
} => {
  try {
    // Validações iniciais
    if (isNaN(valorAplicado) || valorAplicado <= 0 || isNaN(dataAplicacao.getTime()) || isNaN(dataCalculo.getTime())) {
      throw new Error("Valores de entrada inválidos para cálculo.");
    }
    if (dataCalculo < dataAplicacao) {
        // Se a data de cálculo for anterior à aplicação, retorna valores zerados
        return {
            valorBruto: valorAplicado,
            valorLiquido: valorAplicado,
            rendimentoBruto: 0,
            rendimentoLiquido: 0,
            ir: 0,
            iof: 0,
            percentualRentabilidadeBruta: 0,
            percentualRentabilidadeLiquida: 0,
            diasCorridos: 0,
        };
    }

    const diasCorridos = calcularDiasCorridos(dataAplicacao, dataCalculo);

    // Simulação de Rentabilidade (simplificada - juros compostos diários)
    let taxaDiariaEfetiva = 0;
    if (tipoAplicacao === "CDB" && percentualCDI !== null && !isNaN(percentualCDI)) {
      taxaDiariaEfetiva = TAXA_DI_DIARIA_SIMULADA * (percentualCDI / 100);
    } else if (tipoAplicacao.startsWith("Fundo")) {
      // Fundos podem ter taxas diferentes, simularemos com 100% do DI por simplicidade
      taxaDiariaEfetiva = TAXA_DI_DIARIA_SIMULADA; // Simplificação
    } else {
        // Tipo desconhecido ou sem taxa, sem rendimento
        taxaDiariaEfetiva = 0;
    }

    // Cálculo do valor bruto usando juros compostos diários
    // ValorBruto = ValorAplicado * (1 + TaxaDiariaEfetiva)^DiasCorridos
    // Usamos dias corridos aqui para simplificar, o correto seria dias úteis para CDI, mas mantemos a simplicidade.
    const valorBruto = valorAplicado * Math.pow(1 + taxaDiariaEfetiva, diasCorridos);
    const rendimentoBruto = valorBruto - valorAplicado;

    // Cálculo do IOF (somente se dias < 30)
    const aliquotaIOF = getAliquotaIOF(diasCorridos);
    const iof = rendimentoBruto > 0 ? rendimentoBruto * aliquotaIOF : 0;

    // Cálculo do IR (sobre o rendimento bruto após IOF)
    const baseCalculoIR = rendimentoBruto - iof;
    const aliquotaIR = getAliquotaIR(diasCorridos);
    const ir = baseCalculoIR > 0 ? baseCalculoIR * aliquotaIR : 0;

    // Cálculo do valor líquido e rendimento líquido
    const rendimentoLiquido = rendimentoBruto - iof - ir;
    const valorLiquido = valorAplicado + rendimentoLiquido;

    // Cálculo dos percentuais de rentabilidade
    const percentualRentabilidadeBruta = valorAplicado > 0 ? (rendimentoBruto / valorAplicado) * 100 : 0;
    const percentualRentabilidadeLiquida = valorAplicado > 0 ? (rendimentoLiquido / valorAplicado) * 100 : 0;

    // Retorna todos os valores calculados
    return {
      valorBruto: isNaN(valorBruto) ? valorAplicado : valorBruto,
      valorLiquido: isNaN(valorLiquido) ? valorAplicado : valorLiquido,
      rendimentoBruto: isNaN(rendimentoBruto) ? 0 : rendimentoBruto,
      rendimentoLiquido: isNaN(rendimentoLiquido) ? 0 : rendimentoLiquido,
      ir: isNaN(ir) ? 0 : ir,
      iof: isNaN(iof) ? 0 : iof,
      percentualRentabilidadeBruta: isNaN(percentualRentabilidadeBruta) ? 0 : percentualRentabilidadeBruta,
      percentualRentabilidadeLiquida: isNaN(percentualRentabilidadeLiquida) ? 0 : percentualRentabilidadeLiquida,
      diasCorridos: diasCorridos,
    };

  } catch (error) {
    console.error("Erro detalhado em calcularRentabilidade:", error);
    // Retorna valores padrão em caso de erro grave
    return {
      valorBruto: valorAplicado || 0,
      valorLiquido: valorAplicado || 0,
      rendimentoBruto: 0,
      rendimentoLiquido: 0,
      ir: 0,
      iof: 0,
      percentualRentabilidadeBruta: 0,
      percentualRentabilidadeLiquida: 0,
      diasCorridos: 0,
    };
  }
};

