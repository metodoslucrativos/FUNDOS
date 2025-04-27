// src/components/aplicacoes/EditarAplicacaoModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { updateStoredAplicacao, getStoredAplicacaoById } from "@/lib/localStorageUtils";

interface EditarAplicacaoModalProps {
  aplicacaoId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback para atualizar a lista após edição
}

const EditarAplicacaoModal = ({ aplicacaoId, isOpen, onClose, onSuccess }: EditarAplicacaoModalProps) => {
  const [formData, setFormData] = useState<any>(null);
  const [formStatus, setFormStatus] = useState({ message: "", isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoAplicacao, setTipoAplicacao] = useState("CDB");

  useEffect(() => {
    if (isOpen && aplicacaoId !== null) {
      console.log(`EditModal: Carregando dados para ID ${aplicacaoId}`);
      const appData = getStoredAplicacaoById(aplicacaoId);
      if (appData) {
        setFormData(appData);
        setTipoAplicacao(appData.tipo_aplicacao || "CDB");
        setFormStatus({ message: "", isError: false }); // Limpa status ao abrir
      } else {
        console.error(`EditModal: Aplicação com ID ${aplicacaoId} não encontrada.`);
        setFormStatus({ message: "Erro: Aplicação não encontrada.", isError: true });
        setFormData(null);
      }
    } else {
      setFormData(null); // Limpa dados quando o modal fecha ou ID é nulo
    }
  }, [isOpen, aplicacaoId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Atualiza tipoAplicacao se o select mudar
    if (name === "tipoAplicacao") {
      setTipoAplicacao(value);
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData || aplicacaoId === null) return;

    setIsSubmitting(true);
    setFormStatus({ message: "", isError: false });

    try {
      const dadosAtualizados = {
        nome_empresa: formData.nome_empresa,
        nome_banco: formData.nome_banco,
        codigo_conta: formData.codigo_conta,
        data_aplicacao: formData.data_aplicacao,
        valor_aplicado: parseFloat(formData.valor_aplicado as string),
        tipo_aplicacao: formData.tipo_aplicacao,
        percentual_cdi: formData.tipo_aplicacao === "CDB" ? parseFloat(formData.percentual_cdi as string) : null,
      };

      // Validação básica (similar ao cadastro)
      if (!dadosAtualizados.nome_empresa || !dadosAtualizados.nome_banco || !dadosAtualizados.codigo_conta || 
          !dadosAtualizados.data_aplicacao || isNaN(dadosAtualizados.valor_aplicado) || !dadosAtualizados.tipo_aplicacao) {
        throw new Error("Todos os campos obrigatórios devem ser preenchidos.");
      }
      if (dadosAtualizados.tipo_aplicacao === "CDB" && (dadosAtualizados.percentual_cdi === null || isNaN(dadosAtualizados.percentual_cdi))) {
        throw new Error("Percentual do CDI é obrigatório para aplicações CDB.");
      }
      if (dadosAtualizados.valor_aplicado <= 0) {
        throw new Error("Valor aplicado deve ser positivo.");
      }

      console.log(`EditModal: Atualizando aplicação ID ${aplicacaoId} no localStorage:`, dadosAtualizados);
      const result = updateStoredAplicacao(aplicacaoId, dadosAtualizados);

      if (result) {
        console.log("EditModal: Aplicação atualizada com sucesso.");
        setFormStatus({ message: "Aplicação atualizada com sucesso!", isError: false });
        if (onSuccess) {
          onSuccess();
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error("Falha ao atualizar aplicação no localStorage.");
      }

    } catch (error) {
      console.error("Erro ao atualizar aplicação:", error);
      setFormStatus({ message: error instanceof Error ? error.message : "Erro desconhecido ao atualizar aplicação.", isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Editar Aplicação</h2>
        
        {formStatus.message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            formStatus.isError
              ? "bg-red-900/50 text-red-200"
              : "bg-green-900/50 text-green-200"
          }`}>
            {formStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campos do formulário pré-preenchidos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="empresa" className="block text-sm font-medium text-gray-300 mb-1">Empresa</label>
              <input type="text" id="empresa" name="nome_empresa" value={formData.nome_empresa || ""} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="banco" className="block text-sm font-medium text-gray-300 mb-1">Banco</label>
              <input type="text" id="banco" name="nome_banco" value={formData.nome_banco || ""} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="codigoConta" className="block text-sm font-medium text-gray-300 mb-1">Código da Conta</label>
              <input type="text" id="codigoConta" name="codigo_conta" value={formData.codigo_conta || ""} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="tipoAplicacao" className="block text-sm font-medium text-gray-300 mb-1">Tipo de Aplicação</label>
              <select id="tipoAplicacao" name="tipo_aplicacao" value={tipoAplicacao} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="CDB">CDB</option>
                <option value="Fundo Bradesco Cred Priv">Fundo Bradesco Crédito Privado</option>
                <option value="Fundo Bradesco DI Max">Fundo Bradesco DI Max</option>
              </select>
            </div>

            {tipoAplicacao === "CDB" && (
              <div>
                <label htmlFor="percentualCDI" className="block text-sm font-medium text-gray-300 mb-1">% do CDI</label>
                <input type="number" id="percentualCDI" name="percentual_cdi" value={formData.percentual_cdi || ""} onChange={handleChange} step="0.01" required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: 110.5" />
              </div>
            )}

            <div>
              <label htmlFor="dataAplicacao" className="block text-sm font-medium text-gray-300 mb-1">Data da Aplicação</label>
              <input type="date" id="dataAplicacao" name="data_aplicacao" value={formData.data_aplicacao || ""} onChange={handleChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label htmlFor="valorAplicado" className="block text-sm font-medium text-gray-300 mb-1">Valor Aplicado (R$)</label>
              <input type="number" id="valorAplicado" name="valor_aplicado" value={formData.valor_aplicado || ""} onChange={handleChange} step="0.01" required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-gray-200 font-semibold rounded-md text-sm disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarAplicacaoModal;

