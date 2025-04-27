'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Registrar os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface DashboardChartsProps {
  aplicacoes: any[];
}

const DashboardCharts = ({ aplicacoes }: DashboardChartsProps) => {
  // Agrupar aplicações por tipo
  const aplicacoesPorTipo: Record<string, number> = {};
  const aplicacoesPorBanco: Record<string, number> = {};
  const aplicacoesPorEmpresa: Record<string, number> = {};
  
  // Dados para gráfico de evolução (simulado)
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  
  aplicacoes.forEach((aplicacao) => {
    // Agrupar por tipo
    if (aplicacoesPorTipo[aplicacao.tipo_aplicacao]) {
      aplicacoesPorTipo[aplicacao.tipo_aplicacao] += aplicacao.valor_aplicado;
    } else {
      aplicacoesPorTipo[aplicacao.tipo_aplicacao] = aplicacao.valor_aplicado;
    }
    
    // Agrupar por banco
    if (aplicacoesPorBanco[aplicacao.nome_banco]) {
      aplicacoesPorBanco[aplicacao.nome_banco] += aplicacao.valor_aplicado;
    } else {
      aplicacoesPorBanco[aplicacao.nome_banco] = aplicacao.valor_aplicado;
    }
    
    // Agrupar por empresa
    if (aplicacoesPorEmpresa[aplicacao.nome_empresa]) {
      aplicacoesPorEmpresa[aplicacao.nome_empresa] += aplicacao.valor_aplicado;
    } else {
      aplicacoesPorEmpresa[aplicacao.nome_empresa] = aplicacao.valor_aplicado;
    }
  });
  
  // Configuração do gráfico de barras (por tipo)
  const barChartData = {
    labels: Object.keys(aplicacoesPorTipo),
    datasets: [
      {
        label: 'Valor Aplicado (R$)',
        data: Object.values(aplicacoesPorTipo),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Configuração do gráfico de pizza (por banco)
  const pieChartData = {
    labels: Object.keys(aplicacoesPorBanco),
    datasets: [
      {
        label: 'Valor Aplicado (R$)',
        data: Object.values(aplicacoesPorBanco),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Configuração do gráfico de linha (evolução simulada)
  const lineChartData = {
    labels: meses,
    datasets: [
      {
        label: 'Valor Bruto',
        data: meses.map((_, index) => {
          // Simulação de crescimento para demonstração
          const totalAplicado = aplicacoes.reduce((sum, app) => sum + app.valor_aplicado, 0);
          return totalAplicado * (1 + 0.01 * (index + 1));
        }),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Valor Líquido',
        data: meses.map((_, index) => {
          // Simulação de crescimento para demonstração (com desconto de impostos)
          const totalAplicado = aplicacoes.reduce((sum, app) => sum + app.valor_aplicado, 0);
          return totalAplicado * (1 + 0.008 * (index + 1));
        }),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Distribuição por Tipo</h3>
        <div className="h-64">
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Distribuição por Banco</h3>
        <div className="h-64">
          <Pie data={pieChartData} options={chartOptions} />
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg shadow-md md:col-span-2">
        <h3 className="text-lg font-semibold mb-2">Evolução do Patrimônio (Simulação)</h3>
        <div className="h-64">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
