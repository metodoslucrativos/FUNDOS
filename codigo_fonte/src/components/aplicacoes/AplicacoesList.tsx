"use client";

import React, { useState } from "react";
import { calcularRentabilidade } from "@/lib/calculadora";
import ResgateModal from "@/components/resgates/ResgateModal";
import EditarAplicacaoModal from "@/components/aplicacoes/EditarAplicacaoModal";
import { deleteStoredAplicacao } from "@/lib/localStorageUtils";

interface AplicacoesListProps {
  aplicacoes: any[];
  onDataChange?: () => void; // Callback para atualizar dados após operações
}

// Função para formatar valores monetários com segurança
const formatarMoedaSeguro = (valor: number | null | undefined): string => {
  const numero = Number(valor);
  if (isNaN(numero)) {
    return "R$ --,--"; // Ou outra representação para valor inválido
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
};

// Função para formatar percentuais com segurança
const formatarPercentualSeguro = (valor: number | null | undefined): string => {
  const numero = Number(valor);
  if (isNaN(numero)) {
    return "--,--%"; // Ou outra representação para valor inválido
  }
  return `${numero.toFixed(2)}%`;
};

const AplicacoesList = ({ aplicacoes, onDataChange }: AplicacoesListProps) => {
  const [resgateModalOpen, setResgateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAplicacao, setSelectedAplicacao] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Função para calcular rentabilidade atual
  const calcularRentabilidadeAtual = (aplicacao: any) => {
    try {
      const dataAplicacao = new Date(`${aplicacao.data_aplicacao}T00:00:00`);
      const hoje = new Date();
      // Valida se a data é válida antes de calcular
      if (isNaN(dataAplicacao.getTime())) {
          throw new Error("Data de aplicação inválida");
      }
      return calcularRentabilidade(
        aplicacao.valor_aplicado,
        aplicacao.tipo_aplicacao,
        dataAplicacao,
        aplicacao.percentual_cdi,
        hoje
      );
    } catch (error) {
      console.error("Erro ao calcular rentabilidade para aplicação:", aplicacao, error);
      // Retorna valores padrão numéricos em caso de erro
      return {
        valorBruto: aplicacao.valor_aplicado || 0,
        valorLiquido: aplicacao.valor_aplicado || 0,
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

  // Função para formatar datas
  const formatarData = (dataString: string) => {
    try {
        const data = new Date(`${dataString}T00:00:00`);
        if (isNaN(data.getTime())) return "--/--/----"
        return data.toLocaleDateString("pt-BR");
    } catch {
        return "--/--/----"
    }
  };

  // Função para calcular dias corridos
  const calcularDiasCorridos = (dataString: string) => {
    try {
        const dataAplicacao = new Date(`${dataString}T00:00:00`);
        if (isNaN(dataAplicacao.getTime())) return "--";
        const hoje = new Date();
        const diffTime = Math.abs(hoje.getTime() - dataAplicacao.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    } catch {
        return "--";
    }
  };

  // Função para abrir modal de resgate
  const handleResgateClick = (aplicacao: any) => {
    setSelectedAplicacao(aplicacao);
    setResgateModalOpen(true);
  };

  // Função para abrir modal de edição
  const handleEditClick = (aplicacao: any) => {
    setSelectedAplicacao(aplicacao);
    setEditModalOpen(true);
  };

  // Função para confirmar exclusão
  const handleDeleteClick = (id: number) => {
    setConfirmDeleteId(id);
  };

  // Função para executar exclusão
  const executeDelete = (id: number) => {
    console.log(`Excluindo aplicação ID ${id}...`);
    const success = deleteStoredAplicacao(id);
    if (success) {
      console.log(`Aplicação ID ${id} excluída com sucesso.`);
      if (onDataChange) {
        onDataChange(); // Atualiza a lista após exclusão
      }
    } else {
      console.error(`Falha ao excluir aplicação ID ${id}.`);
      alert("Erro ao excluir aplicação. Tente novamente.");
    }
    setConfirmDeleteId(null);
  };

  // Função para cancelar exclusão
  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  // Função para fechar modal de resgate e atualizar dados
  const handleResgateSuccess = () => {
    if (onDataChange) {
      onDataChange();
    }
  };

  // Função para fechar modal de edição e atualizar dados
  const handleEditSuccess = () => {
    if (onDataChange) {
      onDataChange();
    }
  };

  if (aplicacoes.length === 0) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <p className="text-center text-gray-400 py-8">
          Nenhuma aplicação encontrada. Adicione uma nova aplicação usando o formulário acima.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-700 rounded-lg">
          <thead>
            <tr className="border-b border-gray-600">
              {/* Colunas existentes */}
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Empresa</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Banco</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Código</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Dias</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Valor Aplicado</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Valor Bruto</th>
              {/* Novas colunas para Impostos */}
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">IOF</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">IR</th>
              {/* Colunas restantes */}
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Valor Líquido</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Rentab. Líq.</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Resgatado</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Disponível</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {aplicacoes.map((aplicacao) => {
              const rentabilidade = calcularRentabilidadeAtual(aplicacao);
              const totalResgatado = aplicacao.total_resgatado || 0;
              // Garante que saldoDisponivel seja um número
              const saldoDisponivel = (rentabilidade.valorLiquido || 0) - totalResgatado;

              return (
                <tr key={aplicacao.id} className="hover:bg-gray-650">
                  {/* Colunas existentes */}
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{aplicacao.nome_empresa}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{aplicacao.nome_banco}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{aplicacao.codigo_conta}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                    {aplicacao.tipo_aplicacao}
                    {aplicacao.tipo_aplicacao === "CDB" && aplicacao.percentual_cdi && (
                      <span className="text-xs text-gray-400 ml-1">({aplicacao.percentual_cdi}% CDI)</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{formatarData(aplicacao.data_aplicacao)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{calcularDiasCorridos(aplicacao.data_aplicacao)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300 text-right">{formatarMoedaSeguro(aplicacao.valor_aplicado)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300 text-right">{formatarMoedaSeguro(rentabilidade.valorBruto)}</td>
                  {/* Novas colunas para Impostos */}
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-red-400 text-right">{formatarMoedaSeguro(rentabilidade.iof)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-red-400 text-right">{formatarMoedaSeguro(rentabilidade.ir)}</td>
                  {/* Colunas restantes */}
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-green-400 text-right font-semibold">{formatarMoedaSeguro(rentabilidade.valorLiquido)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-green-400 text-right font-semibold">{formatarPercentualSeguro(rentabilidade.percentualRentabilidadeLiquida)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300 text-right">{formatarMoedaSeguro(totalResgatado)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300 text-right">{formatarMoedaSeguro(saldoDisponivel)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                    {confirmDeleteId === aplicacao.id ? (
                      <div className="flex space-x-1 justify-center">
                        <button onClick={() => executeDelete(aplicacao.id)} className="text-xs bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded">Confirmar</button>
                        <button onClick={cancelDelete} className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded">Cancelar</button>
                      </div>
                    ) : (
                      <div className="flex space-x-1 justify-center">
                        <button onClick={() => handleResgateClick(aplicacao)} className="text-xs text-yellow-400 hover:text-yellow-300 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={saldoDisponivel <= 0}>Resgatar</button>
                        <button onClick={() => handleEditClick(aplicacao)} className="text-xs text-blue-400 hover:text-blue-300 mx-2">Editar</button>
                        <button onClick={() => handleDeleteClick(aplicacao.id)} className="text-xs text-red-400 hover:text-red-300">Excluir</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Resgate */}
      {resgateModalOpen && selectedAplicacao && (
        <ResgateModal
          aplicacao={selectedAplicacao}
          isOpen={resgateModalOpen}
          onClose={() => setResgateModalOpen(false)}
          onSuccess={handleResgateSuccess}
        />
      )}

      {/* Modal de Edição */}
      {editModalOpen && selectedAplicacao && (
        <EditarAplicacaoModal
          aplicacaoId={selectedAplicacao.id}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default AplicacoesList;
