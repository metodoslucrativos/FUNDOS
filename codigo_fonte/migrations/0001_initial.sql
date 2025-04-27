-- Define a tabela para armazenar as aplicações financeiras
DROP TABLE IF EXISTS Aplicacoes;

CREATE TABLE Aplicacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_empresa TEXT NOT NULL,
    nome_banco TEXT NOT NULL,
    codigo_conta TEXT NOT NULL,
    data_aplicacao TEXT NOT NULL, -- Formato YYYY-MM-DD
    valor_aplicado REAL NOT NULL,
    tipo_aplicacao TEXT NOT NULL CHECK(tipo_aplicacao IN (
        'CDB',
        'Fundo Bradesco Cred Priv',
        'Fundo Bradesco DI Max'
    )),
    percentual_cdi REAL, -- Apenas para CDB, pode ser NULL
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER IF NOT EXISTS update_aplicacoes_updated_at
AFTER UPDATE ON Aplicacoes
FOR EACH ROW
BEGIN
    UPDATE Aplicacoes SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

-- Adicionar índices para otimizar consultas comuns (opcional, mas recomendado)
CREATE INDEX IF NOT EXISTS idx_aplicacoes_banco ON Aplicacoes (nome_banco);
CREATE INDEX IF NOT EXISTS idx_aplicacoes_empresa ON Aplicacoes (nome_empresa);
CREATE INDEX IF NOT EXISTS idx_aplicacoes_tipo ON Aplicacoes (tipo_aplicacao);
CREATE INDEX IF NOT EXISTS idx_aplicacoes_data ON Aplicacoes (data_aplicacao);

-- Tabela para Resgates (será usada posteriormente)
DROP TABLE IF EXISTS Resgates;
CREATE TABLE Resgates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aplicacao_id INTEGER NOT NULL,
    data_resgate TEXT NOT NULL, -- Formato YYYY-MM-DD
    valor_resgatado REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aplicacao_id) REFERENCES Aplicacoes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_resgates_aplicacao_id ON Resgates (aplicacao_id);

