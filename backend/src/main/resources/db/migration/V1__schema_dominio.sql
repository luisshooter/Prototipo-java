-- Modelo de dominio: cliente, modulo e ticket (CLIENTE 1:N TICKET N:1 MODULO)

CREATE TABLE cliente (
    id   BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL
);

CREATE TABLE modulo (
    id   BIGSERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL
);

CREATE TABLE ticket (
    id                 BIGSERIAL PRIMARY KEY,
    titulo             VARCHAR(200) NOT NULL,
    cod_cliente        BIGINT NOT NULL REFERENCES cliente (id),
    cod_modulo         BIGINT NOT NULL REFERENCES modulo (id),
    data_abertura      DATE NOT NULL,
    data_encerramento  DATE
);

CREATE INDEX idx_ticket_data_abertura ON ticket (data_abertura);
CREATE INDEX idx_ticket_cod_cliente ON ticket (cod_cliente);
CREATE INDEX idx_ticket_cod_modulo ON ticket (cod_modulo);
