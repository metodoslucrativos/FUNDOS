// src/app/page.tsx
"use client"; // Mark as a Client Component for state and effects

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import CadastroForm from '@/components/cadastro/CadastroForm';
import AplicacoesList from '@/components/aplicacoes/AplicacoesList';
import DashboardSummary from '@/components/dashboard/DashboardSummary';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import DashboardFilters, { FilterState } from '@/components/dashboard/DashboardFilters';
// Importar funções do localStorage
import { getStoredAplicacoes } from '@/lib/localStorageUtils';

// Componente de Loading para a lista de aplicações
const AplicacoesListSkeleton = () => (
  <div className="bg-gray-800 p-4 rounded-lg mb-4 animate-pulse">
    <h3 className="text-lg font-semibold mb-2 h-6 bg-gray-700 rounded w-1/4"></h3>
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-700 rounded-lg">
        <thead>
          <tr className="border-b border-gray-600">
            {[...Array(13)].map((_, i) => (
              <th key={i} className={`px-3 py-2 h-8 bg-gray-600 ${i === 0 ? 'rounded-tl-lg' : ''} ${i === 12 ? 'rounded-tr-lg' : ''}`}></th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
              Carregando aplicações...
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// Componente de Loading para o Resumo e Gráficos
const DashboardSkeleton = () => (
  <>
    {/* Skeleton for Summary */}
    <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-md animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="bg-gray-700 p-3 rounded">
            <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-600 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
    {/* Skeleton for Charts */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-pulse">
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="h-5 bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="h-5 bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg shadow-md md:col-span-2">
        <div className="h-5 bg-gray-700 rounded w-1/4 mb-2"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    </div>
  </>
);

export default function HomePage() {
  const [aplicacoes, setAplicacoes] = useState<any[]>([]);
  const [filteredAplicacoes, setFilteredAplicacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [refreshKey, setRefreshKey] = useState(0); // Removido: Não mais necessário com localStorage
  const [filters, setFilters] = useState<FilterState>({
    empresa: '',
    banco: '',
    codigoConta: '',
    tipoInvestimento: '',
    periodoInicio: '',
    periodoFim: '',
  });

  // Função para carregar/recarregar dados do localStorage
  const loadData = useCallback(() => {
    console.log("loadData: Carregando dados do localStorage...");
    try {
      setLoading(true);
      setError(null);
      const data = getStoredAplicacoes();
      console.log("loadData: Dados carregados:", data);
      setAplicacoes(data);
      // O filtro será aplicado no useEffect abaixo
    } catch (err) {
      console.error("Erro ao carregar dados do localStorage:", err);
      setError("Erro ao carregar dados. Verifique o console ou tente limpar o cache do navegador.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega dados iniciais
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Apply filters when filters or aplicacoes change
  useEffect(() => {
    console.log("Aplicando filtros...", filters, aplicacoes);
    let tempAplicacoes = [...aplicacoes];

    if (filters.empresa) {
      tempAplicacoes = tempAplicacoes.filter(app =>
        app.nome_empresa.toLowerCase().includes(filters.empresa.toLowerCase())
      );
    }
    if (filters.banco) {
      tempAplicacoes = tempAplicacoes.filter(app =>
        app.nome_banco.toLowerCase().includes(filters.banco.toLowerCase())
      );
    }
    if (filters.codigoConta) {
      tempAplicacoes = tempAplicacoes.filter(app =>
        app.codigo_conta.toLowerCase().includes(filters.codigoConta.toLowerCase())
      );
    }
    if (filters.tipoInvestimento) {
      tempAplicacoes = tempAplicacoes.filter(app =>
        app.tipo_aplicacao === filters.tipoInvestimento
      );
    }
    if (filters.periodoInicio) {
      try {
        const inicio = new Date(`${filters.periodoInicio}T00:00:00`);
        if (!isNaN(inicio.getTime())) {
            tempAplicacoes = tempAplicacoes.filter(app =>
                new Date(`${app.data_aplicacao}T00:00:00`) >= inicio
            );
        }
      } catch (e) { console.error("Erro ao parsear data de início:", e); }
    }
    if (filters.periodoFim) {
        try {
            const fim = new Date(`${filters.periodoFim}T00:00:00`);
            if (!isNaN(fim.getTime())) {
                tempAplicacoes = tempAplicacoes.filter(app =>
                    new Date(`${app.data_aplicacao}T00:00:00`) <= fim
                );
            }
        } catch (e) { console.error("Erro ao parsear data de fim:", e); }
    }

    console.log("Aplicações filtradas:", tempAplicacoes);
    setFilteredAplicacoes(tempAplicacoes);
  }, [filters, aplicacoes]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Dashboard de Investimentos - Renda Fixa</h1>

      {/* Exibir mensagem de erro se houver */}
      {error && (
        <div className="bg-red-900/50 text-red-200 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Seção de Filtros */}
      <DashboardFilters onFilterChange={handleFilterChange} />

      {/* Seção de Resumo e Gráficos */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <DashboardSummary aplicacoes={filteredAplicacoes} />
          <DashboardCharts aplicacoes={filteredAplicacoes} />
        </>
      )}

      {/* Seção de Cadastro */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Adicionar Nova Aplicação</h2>
        {/* Passa a função loadData para o formulário chamar após sucesso */}
        <CadastroForm onSuccess={loadData} />
      </div>

      {/* Seção de Visualização das Aplicações */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Minhas Aplicações</h2>
        {loading ? (
          <AplicacoesListSkeleton />
        ) : (
          /* Passa loadData para a lista poder atualizar após resgate */
          <AplicacoesList aplicacoes={filteredAplicacoes} onDataChange={loadData} />
        )}
      </div>

      {/* Botão para atualizar manualmente (pode ser útil para depuração) */}
      {/* <div className="mt-8 text-center">
        <button
          onClick={loadData}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-sm"
        >
          Atualizar Dados (localStorage)
        </button>
      </div> */}
    </div>
  );
}

