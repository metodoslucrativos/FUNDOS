'use client';

import React, { useState } from 'react';

interface DashboardFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  empresa: string;
  banco: string;
  codigoConta: string;
  tipoInvestimento: string;
  periodoInicio: string;
  periodoFim: string;
}

const DashboardFilters = ({ onFilterChange }: DashboardFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    empresa: '',
    banco: '',
    codigoConta: '',
    tipoInvestimento: '',
    periodoInicio: '',
    periodoFim: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      empresa: '',
      banco: '',
      codigoConta: '',
      tipoInvestimento: '',
      periodoInicio: '',
      periodoFim: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filtros</h3>
        <button 
          onClick={handleReset}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Limpar Filtros
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="empresa" className="block text-sm font-medium text-gray-300 mb-1">
            Empresa
          </label>
          <input
            type="text"
            id="empresa"
            name="empresa"
            value={filters.empresa}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Filtrar por empresa"
          />
        </div>
        
        <div>
          <label htmlFor="banco" className="block text-sm font-medium text-gray-300 mb-1">
            Banco
          </label>
          <input
            type="text"
            id="banco"
            name="banco"
            value={filters.banco}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Filtrar por banco"
          />
        </div>
        
        <div>
          <label htmlFor="codigoConta" className="block text-sm font-medium text-gray-300 mb-1">
            Código da Conta
          </label>
          <input
            type="text"
            id="codigoConta"
            name="codigoConta"
            value={filters.codigoConta}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Filtrar por código"
          />
        </div>
        
        <div>
          <label htmlFor="tipoInvestimento" className="block text-sm font-medium text-gray-300 mb-1">
            Tipo de Investimento
          </label>
          <select
            id="tipoInvestimento"
            name="tipoInvestimento"
            value={filters.tipoInvestimento}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os tipos</option>
            <option value="CDB">CDB</option>
            <option value="Fundo Bradesco Cred Priv">Fundo Bradesco Crédito Privado</option>
            <option value="Fundo Bradesco DI Max">Fundo Bradesco DI Max</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="periodoInicio" className="block text-sm font-medium text-gray-300 mb-1">
            Período Início
          </label>
          <input
            type="date"
            id="periodoInicio"
            name="periodoInicio"
            value={filters.periodoInicio}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="periodoFim" className="block text-sm font-medium text-gray-300 mb-1">
            Período Fim
          </label>
          <input
            type="date"
            id="periodoFim"
            name="periodoFim"
            value={filters.periodoFim}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
