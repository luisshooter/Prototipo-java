-- Modelo de identidade: perfil, usuario, usuario_perfil e sessao (credencial de refresh)

CREATE TABLE perfil (
    id   BIGSERIAL PRIMARY KEY,
    nome VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE usuario (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(150) NOT NULL UNIQUE,
    senha_hash    VARCHAR(100) NOT NULL,
    nome          VARCHAR(120) NOT NULL,
    ativo         BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE usuario_perfil (
    fk_usuario BIGINT NOT NULL REFERENCES usuario (id),
    fk_perfil  BIGINT NOT NULL REFERENCES perfil (id),
    PRIMARY KEY (fk_usuario, fk_perfil)
);

-- Credencial de sessao (refresh token). Apenas o hash e armazenado; nunca o token em claro.
CREATE TABLE sessao (
    id                  BIGSERIAL PRIMARY KEY,
    fk_usuario          BIGINT NOT NULL REFERENCES usuario (id),
    identificador_hash  VARCHAR(200) NOT NULL UNIQUE,
    expira_em           TIMESTAMP NOT NULL,
    revogado_em         TIMESTAMP,
    criado_em           TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessao_fk_usuario ON sessao (fk_usuario);
