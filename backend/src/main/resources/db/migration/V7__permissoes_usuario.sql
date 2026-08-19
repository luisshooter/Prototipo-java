-- Permissoes finas por usuario, em cima do perfil. ADMIN sempre tem acesso total
-- independente destas flags (checado na camada de aplicacao). Defaults preservam
-- o comportamento padrao do enunciado: qualquer autenticado ve o dashboard,
-- só ADMIN cria chamado por padrao.
ALTER TABLE usuario ADD COLUMN pode_ver_dashboard BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE usuario ADD COLUMN pode_criar_chamado BOOLEAN NOT NULL DEFAULT FALSE;
