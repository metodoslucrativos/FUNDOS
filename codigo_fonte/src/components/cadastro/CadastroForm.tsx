"use client";

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { addStoredAplicacao } from '@/lib/localStorageUtils';

interface CadastroFormProps {
  onSuccess?: () => void; // Callback para quando o cadastro for bem-sucedido
}

const CadastroForm = ({ onSuccess }: CadastroFormProps) => {
  const router = useRouter();
  const [tipoAplicacao, setTipoAplicacao] = useState("CDB");
  const [formStatus, setFormStatus] = useState({ message: "", isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTipoAplicacao(e.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ message: "", isError: false }); // Clear previous status
    
    try {
      console.log("Processando formulário de cadastro...");
      const formData = new FormData(event.currentTarget);
      
      // Extrair dados do formulário
      const novaAplicacao = {
        nome_empresa: formData.get("empresa") as string,
        nome_banco: formData.get("banco") as string,
        codigo_conta: formData.get("codigoConta") as string,
        data_aplicacao: formData.get("dataAplicacao") as string,
        valor_aplicado: parseFloat(formData.get("valorAplicado") as string),
        tipo_aplicacao: formData.get("tipoAplicacao") as string,
        percentual_cdi: formData.has("percentualCDI")
          ? parseFloat(formData.get("percentualCDI") as string)
          : null,
      };
      
      // Validação básica
      if (!novaAplicacao.nome_empresa || !novaAplicacao.nome_banco || !novaAplicacao.codigo_conta || 
          !novaAplicacao.data_aplicacao || isNaN(novaAplicacao.valor_aplicado) || !novaAplicacao.tipo_aplicacao) {
        throw new Error("Todos os campos obrigatórios devem ser preenchidos.");
      }
      if (novaAplicacao.tipo_aplicacao === "CDB" && (novaAplicacao.percentual_cdi === null || isNaN(novaAplicacao.percentual_cdi))) {
        throw new Error("Percentual do CDI é obrigatório para aplicações CDB.");
      }
      if (novaAplicacao.valor_aplicado <= 0) {
        throw new Error("Valor aplicado deve ser positivo.");
      }
      
      // Adicionar ao localStorage
      console.log("Adicionando aplicação ao localStorage:", novaAplicacao);
      addStoredAplicacao(novaAplicacao);
      
      // Atualizar UI
      setFormStatus({
        message: "Aplicação adicionada com sucesso!",
        isError: false,
      });
      
      // Resetar formulário
      (event.target as HTMLFormElement).reset();
      setTipoAplicacao("CDB");
      
      // Atualizar dados na página principal
      router.refresh();
      
      // Chamar callback de sucesso, se fornecido
      if (onSuccess) {
        console.log("Chamando callback de sucesso");
        onSuccess();
      }
      
      // Limpar mensagem de sucesso após um tempo
      setTimeout(() => {
        setFormStatus({ message: "", isError: false });
      }, 3000);
      
    } catch (error) {
      console.error("Erro ao processar o formulário:", error);
      setFormStatus({
        message: error instanceof Error ? error.message : "Erro ao processar o formulário",
        isError: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      {formStatus.message && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            formStatus.isError
              ? "bg-red-900/50 text-red-200"
              : "bg-green-900/50 text-green-200"
          }`}
        >
          {formStatus.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="empresa"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Empresa
            </label>
            <input
              type="text"
              id="empresa"
              name="empresa"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="banco"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Banco
            </label>
            <input
              type="text"
              id="banco"
              name="banco"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="codigoConta"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Código da Conta
            </label>
            <input
              type="text"
              id="codigoConta"
              name="codigoConta"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="tipoAplicacao"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Tipo de Aplicação
            </label>
            <select
              id="tipoAplicacao"
              name="tipoAplicacao"
              value={tipoAplicacao}
              onChange={handleTipoChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CDB">CDB</option>
              <option value="Fundo Bradesco Cred Priv">
                Fundo Bradesco Crédito Privado
              </option>
              <option value="Fundo Bradesco DI Max">
                Fundo Bradesco DI Max
              </option>
            </select>
          </div>

          {tipoAplicacao === "CDB" && (
            <div>
              <label
                htmlFor="percentualCDI"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                % do CDI
              </label>
              <input
                type="number"
                id="percentualCDI"
                name="percentualCDI"
                step="0.01"
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 110.5"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="dataAplicacao"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Data da Aplicação
            </label>
            <input
              type="date"
              id="dataAplicacao"
              name="dataAplicacao"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="valorAplicado"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Valor Aplicado (R$)
            </label>
            <input
              type="number"
              id="valorAplicado"
              name="valorAplicado"
              step="0.01"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? "Salvando..." : "Adicionar Aplicação"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CadastroForm;
