// src/components/dashboard/DashboardSummary.tsx
"use client";

import React from "react";
import { calcularRentabilidade } from "@/lib/calculadora";

interface DashboardSummaryProps {
  aplicacoes: any[];
}

// Função para formatar valores monetários com segurança
const formatarMoedaSeguro = (valor: number | null | undefined): string => {
  const numero = Number(valor);
  if (isNaN(numero)) {
    return "R$ --,--"; // Ou R$ 0,00 ou outra representação
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
};

const DashboardSummary = ({ aplicacoes }: DashboardSummaryProps) => {
  // Calcula os totais agregados
  const totais = aplicacoes.reduce(
    (acc, app) => {
      try {
        const dataAplicacao = new Date(`${app.data_aplicacao}T00:00:00`);
        const hoje = new Date();
        
        // Verifica se a data é válida
        if (isNaN(dataAplicacao.getTime())) {
            console.warn("Data de aplicação inválida encontrada no resumo:", app);
            return acc; // Ignora aplicação com data inválida
        }

        const calculos = calcularRentabilidade(
          app.valor_aplicado,
          app.tipo_aplicacao,
          dataAplicacao,
          app.percentual_cdi,
          hoje
        );

        // Garante que os valores são numéricos antes de somar
        acc.totalAplicado += Number(app.valor_aplicado) || 0;
        acc.valorBrutoAtual += Number(calculos.valorBruto) || 0;
        acc.valorLiquidoAtual += Number(calculos.valorLiquido) || 0;
        acc.rendimentoBrutoTotal += Number(calculos.rendimentoBruto) || 0;
        acc.rendimentoLiquidoTotal += Number(calculos.rendimentoLiquido) || 0;
        acc.impostoIRTotal += Number(calculos.ir) || 0;
        acc.impostoIOFTotal += Number(calculos.iof) || 0;

      } catch (error) {
        console.error("Erro ao calcular rentabilidade para resumo:", app, error);
        // Se houver erro no cálculo, apenas soma o valor aplicado inicial
        acc.totalAplicado += Number(app.valor_aplicado) || 0;
        acc.valorBrutoAtual += Number(app.valor_aplicado) || 0; // Considera valor bruto como o aplicado
        acc.valorLiquidoAtual += Number(app.valor_aplicado) || 0; // Considera valor líquido como o aplicado
        // Não soma rendimentos ou impostos em caso de erro
      }
      return acc;
    },
    {
      totalAplicado: 0,
      valorBrutoAtual: 0,
      valorLiquidoAtual: 0,
      rendimentoBrutoTotal: 0,
      rendimentoLiquidoTotal: 0,
      impostoIRTotal: 0,
      impostoIOFTotal: 0,
    }
  );

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-white">Resumo Geral</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Aplicado */}
        <div className="bg-gray-700 p-3 rounded shadow">
          <p className="text-sm text-gray-400 mb-1">Total Aplicado</p>
          <p className="text-lg font-semibold text-white">
            {formatarMoedaSeguro(totais.totalAplicado)}
          </p>
        </div>
        {/* Valor Bruto Atual */}
        <div className="bg-gray-700 p-3 rounded shadow">
          <p className="text-sm text-gray-400 mb-1">Valor Bruto Atual</p>
          <p className="text-lg font-semibold text-white">
            {formatarMoedaSeguro(totais.valorBrutoAtual)}
          </p>
        </div>
        {/* Valor Líquido Atual */}
        <div className="bg-gray-700 p-3 rounded shadow">
          <p className="text-sm text-gray-400 mb-1">Valor Líquido Atual</p>
          <p className="text-lg font-semibold text-green-400">
            {formatarMoedaSeguro(totais.valorLiquidoAtual)}
          </p>
        </div>
        {/* Rendimento Bruto Total */}
        <div className="bg-gray-700 p-3 rounded shadow">
          <p className="text-sm text-gray-400 mb-1">Rendimento Bruto Total</p>
          <p className="text-lg font-semibold text-white">
            {formatarMoedaSeguro(totais.rendimentoBrutoTotal)}
          </p>
        </div>
        {/* Rendimento Líquido Total */}
        <div className="bg-gray-700 p-3 rounded shadow">
          <p className="text-sm text-gray-400 mb-1">Rendimento Líquido Total</p>
          <p className="text-lg font-semibold text-green-400">
            {formatarMoedaSeguro(totais.rendimentoLiquidoTotal)}
          </p>
        </div>
        {/* Imposto IR (Estimado) */}
        <div className="bg-gray-700 p-3 rounded shadow">
          <p className="text-sm text-gray-400 mb-1">Imposto IR (Estimado)</p>
          <p className="text-lg font-semibold text-red-400">
            {formatarMoedaSeguro(totais.impostoIRTotal)}
          </p>
        </div>
        {/* Imposto IOF (Estimado) */}
        <div className="bg-gray-700 p-3 rounded shadow">
          <p className="text-sm text-gray-400 mb-1">Imposto IOF (Estimado)</p>
          <p className="text-lg font-semibold text-red-400">
            {formatarMoedaSeguro(totais.impostoIOFTotal)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;

