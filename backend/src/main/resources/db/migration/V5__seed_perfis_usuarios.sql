-- Perfis minimos exigidos: ADMIN e USER
INSERT INTO perfil (nome) VALUES ('ADMIN'), ('USER');

-- Usuarios de exemplo, um por perfil (credenciais documentadas no README)
-- admin@alfa.com / Admin@123
INSERT INTO usuario (email, senha_hash, nome, ativo) VALUES
    ('admin@alfa.com', '$2b$10$TY.nGnWLLc2CCWLwbV6/YO8nYHOkibojX7KXwfZOg9JW.MumbstTy', 'Administradora ALFA', TRUE);

-- user@alfa.com / User@123
INSERT INTO usuario (email, senha_hash, nome, ativo) VALUES
    ('user@alfa.com', '$2b$10$gZ2ntUp4ArS8t.vX7RjKjeM4pNWEpO87HSoTqkSi1Vgq.K./KyPxS', 'Usuario Padrao', TRUE);

INSERT INTO usuario_perfil (fk_usuario, fk_perfil)
SELECT u.id, p.id FROM usuario u, perfil p WHERE u.email = 'admin@alfa.com' AND p.nome = 'ADMIN';

INSERT INTO usuario_perfil (fk_usuario, fk_perfil)
SELECT u.id, p.id FROM usuario u, perfil p WHERE u.email = 'user@alfa.com' AND p.nome = 'USER';
