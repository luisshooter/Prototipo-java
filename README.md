# Central de Suporte ALFA — TST-FS-004

Aplicação full stack para o teste técnico **TST-FS-004**: dashboard de chamados de suporte, busca de receitas via integração externa (forkify) e autenticação/autorização ponta a ponta.

## Sumário

- [Stack e justificativa](#stack-e-justificativa)
- [Arquitetura](#arquitetura)
- [Autenticação — método e justificativa](#autenticação--método-e-justificativa)
- [Como rodar](#como-rodar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Credenciais de teste](#credenciais-de-teste)
- [Exemplos de requisição autenticada](#exemplos-de-requisição-autenticada)
- [Documentação da API](#documentação-da-api)
- [Testes automatizados](#testes-automatizados)
- [Modelo de dados](#modelo-de-dados)
- [Decisões e trade-offs](#decisões-e-trade-offs)

## Stack e justificativa

| Camada | Tecnologia | Por quê |
|---|---|---|
| Back-end | Java 21 + Spring Boot 3 | Stack mais adotada no mercado Java para APIs REST corporativas; ecossistema maduro (Security, Data JPA, Validation) |
| Persistência | PostgreSQL + Flyway | SGBD robusto e gratuito; Flyway versiona o schema junto do código |
| ORM | Spring Data JPA / Hibernate | Produtividade em CRUD, mapeamento das FKs cliente/módulo |
| Autenticação | Spring Security + JJWT | Padrão de fato para JWT em Spring; permite validação centralizada via filtro |
| Documentação | springdoc-openapi (Swagger UI) | Gera o contrato a partir do próprio código, sem divergência |
| Front-end | React 18 + TypeScript + Vite | Tipagem forte reduz bugs de contrato com a API; Vite acelera o dev loop |
| Estilo | TailwindCSS | Consistência visual sem CSS solto pelo projeto |
| Estado de servidor | TanStack Query | Cache, deduplicação e estados de loading/erro sem boilerplate manual |
| Gráficos | Recharts | Biblioteca React-first, leve o suficiente para dois gráficos de pizza |

## Arquitetura

**Back-end** — três camadas, regra de negócio fora do controller:

```
controller/  → apresentação HTTP (validação de entrada, códigos de status)
service/     → regra de negócio e orquestração (agrupamento em memória, auth)
repository/  → acesso a dados (Spring Data JPA)
client/      → acesso a serviços externos (forkify), isolado do controller
security/    → filtro JWT, emissão/validação de token (ponto único de checagem)
exception/   → handler global único, corpo de erro padronizado
```

**Front-end** — separação entre acesso a dados e apresentação:

```
api/         → chamadas HTTP isoladas (um módulo por recurso)
auth/        → sessão, contexto de autenticação, proteção de rotas
components/  → blocos de UI reutilizáveis (dashboard, layout, comuns)
pages/       → telas, compõem components + api
```

## Autenticação — método e justificativa

Escolha: **JWT stateless (access token) + refresh token opaco persistido (tabela `sessao`)**.

- **Access token**: JWT assinado (HS256), validade curta (15 min). Validado em um único filtro (`JwtAuthenticationFilter`), sem consulta ao banco a cada requisição — barato e horizontalmente escalável.
- **Refresh token**: string aleatória de alta entropia (`SecureRandom`, 256 bits). Apenas o **hash SHA-256** dele é gravado em `sessao.identificador_hash` — o valor em claro nunca é persistido. Isso permite:
  - **Revogação real no logout** (`revogado_em` é marcado, o token para de funcionar imediatamente).
  - **Rotação a cada renovação** (`POST /api/auth/refresh` revoga a sessão usada e emite uma nova — mitiga replay de refresh token roubado).
  - Cobre o ciclo completo exigido: `EMITIDA → VÁLIDA → EXPIRADA → RENOVADA → REVOGADA`.

Trade-off assumido: o access token em si não é revogável antes de expirar (é stateless por design). Isso é mitigado pela validade curta (15 min) — o pior caso de uso indevido de um access token vazado é uma janela de 15 minutos, e o refresh token (a credencial de longa duração) é revogável de verdade.

Senhas: hash **BCrypt** (custo 10) com salt único por usuário — nunca texto claro ou hash rápido (MD5/SHA-1).

Autorização: dois perfis (`ADMIN`, `USER`) via `ROLE_*` do Spring Security, checados em um único ponto (`SecurityConfig`) — `POST /api/tickets` exige `ADMIN`, o restante exige apenas sessão válida.

## Como rodar

### Opção 1 — Docker Compose (recomendado)

Requer Docker e Docker Compose.

```bash
docker compose up --build
```

Isso sobe, nesta ordem: Postgres (com healthcheck) → back-end (roda as migrations Flyway e a carga de dados automaticamente ao iniciar) → front-end (Nginx servindo o build de produção).

- Front-end: http://localhost:3000
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/docs

### Opção 2 — Execução manual

**Banco de dados** (via Docker, ou um Postgres local seu):

```bash
docker compose up db
```

**Back-end** (requer JDK 21 e Maven):

```bash
cd backend
mvn spring-boot:run
```

O schema e a carga de dados (clientes, módulos, tickets de março/2021, perfis e usuários de teste) são aplicados automaticamente pelo Flyway na subida.

**Front-end** (requer Node 18+):

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Acesse http://localhost:5173.

## Variáveis de ambiente

**Back-end** (`backend/src/main/resources/application.yml`, todas com default de desenvolvimento — sobrescreva em produção):

| Variável | Descrição | Default (dev) |
|---|---|---|
| `DB_URL` | JDBC URL do Postgres | `jdbc:postgresql://localhost:5432/suporte` |
| `DB_USER` / `DB_PASSWORD` | Credenciais do banco | `suporte` / `suporte` |
| `JWT_SECRET` | Segredo de assinatura do JWT (mín. 32 caracteres) | valor de dev — **troque em produção** |
| `JWT_ACCESS_EXPIRATION_MS` | Validade do access token | `900000` (15 min) |
| `JWT_REFRESH_EXPIRATION_MS` | Validade do refresh token | `604800000` (7 dias) |
| `CORS_ALLOWED_ORIGINS` | Origens liberadas (separadas por vírgula) | `http://localhost:5173` |
| `FORKIFY_BASE_URL` | Endpoint da forkify-api | `https://forkify-api.herokuapp.com/api/search` |
| `FORKIFY_TIMEOUT_MS` | Timeout da chamada externa | `5000` |

**Front-end** (`frontend/.env`, ver `.env.example`):

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API (nunca fica fixa no código) |

## Credenciais de teste

Criadas automaticamente na carga inicial (Flyway):

| Perfil | E-mail | Senha |
|---|---|---|
| ADMIN | `admin@alfa.com` | `Admin@123` |
| USER | `user@alfa.com` | `User@123` |

## Exemplos de requisição autenticada

```bash
# 1. Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alfa.com","senha":"Admin@123"}'
# → { "accessToken": "...", "refreshToken": "...", "usuario": { ... } }

# 2. Dashboard (qualquer usuário autenticado)
curl http://localhost:8080/api/tickets/dashboard?mes=3&ano=2021 \
  -H "Authorization: Bearer <accessToken>"

# 3. Criar chamado (exige perfil ADMIN)
curl -X POST http://localhost:8080/api/tickets \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Teste","codCliente":1,"codModulo":1,"dataAbertura":"2021-03-10"}'

# 4. Renovar sessão
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'

# 5. Logout (revoga o refresh token no servidor)
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

## Documentação da API

Swagger UI em http://localhost:8080/docs (JSON em `/api-docs`). Inclui o esquema de segurança Bearer — use o botão **Authorize** com o `accessToken` obtido no login.

## Testes automatizados

```bash
cd backend
mvn test
```

Cobrem a lógica crítica: agrupamento em memória do dashboard (`DashboardServiceTest`) e as regras de autorização — 401 sem credencial, 403 sem permissão, 201 para ADMIN (`AutorizacaoIntegrationTest`).

## Modelo de dados

```
CLIENTE (1) ──< TICKET >── (1) MODULO

USUARIO >──< PERFIL   (via usuario_perfil)
USUARIO (1) ──< SESSAO   (refresh tokens / credenciais)
```

Scripts em `backend/src/main/resources/db/migration` (Flyway): schema de domínio, carga de clientes/módulos/tickets de março 2021, schema de identidade, carga de perfis e usuários de teste.

## Decisões e trade-offs

- **Agrupamento por cliente/módulo em memória** (`DashboardService`): exigência do enunciado — a consulta ao banco retorna a lista de tickets do período (sem `GROUP BY`/`COUNT`) e o agrupamento é feito com `Stream.collect(groupingBy(...))` na camada de aplicação.
- **Hash do refresh token com SHA-256** (não BCrypt): o refresh token já é um segredo de alta entropia gerado por `SecureRandom`, então não precisa de um algoritmo de derivação lento — precisa sim de um hash determinístico para permitir a busca por `identificador_hash` no `refresh`/`logout`. BCrypt (com salt aleatório) não permitiria essa busca direta. Senhas de usuário, essas sim, usam BCrypt.
- **`networkMode: "always"` no TanStack Query**: evita que uma falsa detecção de "offline" pelo navegador (comum atrás de proxies/VPNs corporativos) deixe a tela presa em "carregando" — o erro de rede sempre chega à UI, com opção de tentar novamente.
- **Front-end busca receitas via mutação (`useMutation`)**, não via `useQuery` automático: a busca é disparada pela ação do usuário (submeter o formulário), não por um efeito de montagem.
