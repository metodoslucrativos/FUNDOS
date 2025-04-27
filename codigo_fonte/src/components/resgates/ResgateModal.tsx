// src/components/resgates/ResgateModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { calcularRentabilidade } from "@/lib/calculadora";
import { addStoredResgate, getStoredAplicacaoById } from "@/lib/localStorageUtils";

interface ResgateModalProps {
  aplicacao: any; // A aplicação para a qual o resgate está sendo feito
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback para atualizar a lista após resgate
}

const ResgateModal = ({ aplicacao, isOpen, onClose, onSuccess }: ResgateModalProps) => {
  const [dataResgate, setDataResgate] = useState(new Date().toISOString().split("T")[0]);
  const [valorResgate, setValorResgate] = useState("");
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);
  const [formStatus, setFormStatus] = useState({ message: "", isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcula o saldo líquido disponível quando o modal abre ou a aplicação muda
  useEffect(() => {
    if (isOpen && aplicacao) {
      try {
        const dataAplicacaoDate = new Date(`${aplicacao.data_aplicacao}T00:00:00`);
        const hoje = new Date();
        const calculosHoje = calcularRentabilidade(
          aplicacao.valor_aplicado,
          aplicacao.tipo_aplicacao,
          dataAplicacaoDate,
          aplicacao.percentual_cdi,
          hoje
        );
        const saldoLiquidoAtual = calculosHoje.valorLiquido - (aplicacao.total_resgatado || 0);
        setSaldoDisponivel(saldoLiquidoAtual > 0 ? saldoLiquidoAtual : 0);
        // Reseta o formulário ao abrir
        setDataResgate(new Date().toISOString().split("T")[0]);
        setValorResgate("");
        setFormStatus({ message: "", isError: false });
      } catch (error) {
        console.error("Erro ao calcular saldo disponível:", error);
        setFormStatus({ message: "Erro ao calcular saldo disponível.", isError: true });
        setSaldoDisponivel(0);
      }
    }
  }, [isOpen, aplicacao]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ message: "", isError: false });

    try {
      const valorResgatadoNum = parseFloat(valorResgate);
      const aplicacaoId = aplicacao.id;

      // Validações
      if (isNaN(valorResgatadoNum) || valorResgatadoNum <= 0) {
        throw new Error("Valor do resgate deve ser um número positivo.");
      }
      const dataAplicacaoDate = new Date(`${aplicacao.data_aplicacao}T00:00:00`);
      const dataResgateDate = new Date(`${dataResgate}T00:00:00`);
      if (dataResgateDate < dataAplicacaoDate) {
        throw new Error("Data do resgate não pode ser anterior à data da aplicação.");
      }

      // Recalcula o saldo disponível na data do resgate para validação final
      const calculosNaDataResgate = calcularRentabilidade(
        aplicacao.valor_aplicado,
        aplicacao.tipo_aplicacao,
        dataAplicacaoDate,
        aplicacao.percentual_cdi,
        dataResgateDate // Calcula até a data do resgate
      );
      const saldoLiquidoNaData = calculosNaDataResgate.valorLiquido - (aplicacao.total_resgatado || 0);

      if (valorResgatadoNum > saldoLiquidoNaData) {
        throw new Error(`Valor do resgate (R$ ${valorResgatadoNum.toFixed(2)}) excede o saldo líquido disponível (R$ ${saldoLiquidoNaData.toFixed(2)}) na data do resgate.`);
      }

      // Adiciona o resgate usando localStorageUtils
      console.log("Adicionando resgate ao localStorage...");
      addStoredResgate({
        aplicacao_id: aplicacaoId,
        data_resgate: dataResgate,
        valor_resgatado: valorResgatadoNum,
      });
      console.log("Resgate adicionado com sucesso.");

      setFormStatus({ message: "Resgate registrado com sucesso!", isError: false });
      
      // Chama o callback de sucesso para atualizar a lista
      if (onSuccess) {
        onSuccess();
      }

      // Fecha o modal após um pequeno atraso
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Erro ao registrar resgate:", error);
      setFormStatus({ message: error instanceof Error ? error.message : "Erro desconhecido ao registrar resgate.", isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-white">Registrar Resgate</h2>
        
        {formStatus.message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            formStatus.isError
              ? "bg-red-900/50 text-red-200"
              : "bg-green-900/50 text-green-200"
          }`}>
            {formStatus.message}
          </div>
        )}

        <div className="mb-4 text-sm text-gray-400">
          <p>Aplicação: {aplicacao.nome_empresa} / {aplicacao.nome_banco} ({aplicacao.tipo_aplicacao})</p>
          <p>Saldo Líquido Disponível: <span className="font-semibold text-green-400">R$ {saldoDisponivel.toFixed(2)}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="dataResgate" className="block text-sm font-medium text-gray-300 mb-1">Data do Resgate</label>
            <input
              type="date"
              id="dataResgate"
              name="dataResgate"
              value={dataResgate}
              onChange={(e) => setDataResgate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="valorResgatado" className="block text-sm font-medium text-gray-300 mb-1">Valor a Resgatar (R$)</label>
            <input
              type="number"
              id="valorResgatado"
              name="valorResgatado"
              value={valorResgate}
              onChange={(e) => setValorResgate(e.target.value)}
              step="0.01"
              required
              min="0.01"
              max={saldoDisponivel > 0 ? saldoDisponivel.toFixed(2) : "0.01"} // Define max baseado no saldo
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-gray-200 font-semibold rounded-md text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || saldoDisponivel <= 0}
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-sm ${isSubmitting || saldoDisponivel <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? "Registrando..." : "Confirmar Resgate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResgateModal;

