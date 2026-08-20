# Central de Suporte ALFA — TST-FS-004

Projeto feito para o teste técnico **TST-FS-004**: um painel de chamados de suporte, busca de receitas usando uma API externa (forkify) e login com controle de acesso.

## Sumário

- [Stack e por que escolhi cada uma](#stack-e-por-que-escolhi-cada-uma)
- [Como o projeto tá organizado](#como-o-projeto-tá-organizado)
- [Tela de login e página 404](#tela-de-login-e-página-404)
- [Login — como funciona e por quê](#login--como-funciona-e-por-quê)
- [Como rodar](#como-rodar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Credenciais de teste](#credenciais-de-teste)
- [Exemplos de requisição autenticada](#exemplos-de-requisição-autenticada)
- [Documentação da API](#documentação-da-api)
- [Testes automatizados](#testes-automatizados)
- [Modelo de dados](#modelo-de-dados)
- [Algumas decisões que tomei](#algumas-decisões-que-tomei)

## Stack e por que escolhi cada uma

| Camada | Tecnologia | Por quê |
|---|---|---|
| Back-end | Java 21 + Spring Boot 3 | É a combinação mais usada no mercado pra API Java, então o ecossistema (Security, JPA, Validation) já resolve boa parte do trabalho |
| Banco | PostgreSQL + Flyway | Banco robusto e gratuito; o Flyway guarda o histórico de mudanças do schema junto com o código |
| ORM | Spring Data JPA / Hibernate | Agiliza o CRUD e o relacionamento entre cliente, módulo e ticket |
| Login | Spring Security + JJWT | Combinação padrão pra JWT em Spring, permite checar a autenticação num lugar só |
| Documentação | springdoc-openapi (Swagger UI) | O contrato da API é gerado a partir do próprio código, então nunca fica desatualizado |
| Front-end | React 18 + TypeScript + Vite | Tipagem ajuda a pegar erro de contrato com a API antes de rodar; Vite deixa o dev bem rápido |
| Estilo | TailwindCSS | Mantém a aparência consistente sem CSS espalhado pelo projeto |
| Dados do servidor | TanStack Query | Cuida de cache, loading e erro sem precisar escrever isso na mão toda hora |
| Gráficos | Recharts | Biblioteca simples o suficiente pra dois gráficos de pizza |

## Como o projeto tá organizado

**Back-end** — dividido em camadas, a regra de negócio não fica no controller:

```
controller/  → recebe a requisição HTTP, valida entrada, devolve status certo
service/     → onde a lógica de fato acontece (agrupamento em memória, login)
repository/  → acesso ao banco (Spring Data JPA)
client/      → chamada pro serviço externo (forkify), separado do controller
security/    → filtro do JWT, emissão e validação do token
exception/   → um lugar só cuidando de todo erro, resposta padronizada
```

**Front-end** — separa quem busca dado de quem mostra na tela:

```
api/         → cada chamada HTTP fica isolada no seu próprio arquivo
auth/        → sessão do usuário, contexto de login, proteção de rota
components/  → pedaços de tela reutilizáveis
pages/       → as telas em si, juntando components + api
```

## Tela de login e página 404

Duas telas ganharam um cuidado visual extra, pra fugir da cara padrão de formulário/erro genérico:

- **Login**: o painel escuro do lado esquerdo mostra um "log de chamados" que rola em loop contínuo (com fade nas bordas pra não cortar feio) e um brilho sutil que segue o cursor do mouse pela tela.
- **Página 404**: em vez de uma mensagem seca de erro, virou um "chamado #404" com efeito de inclinação 3D que reage à posição do mouse, e uns fragmentos de ticket flutuando ao redor com profundidades diferentes (parallax).

As duas respeitam `prefers-reduced-motion` — quem desativa animação no sistema operacional não vê nenhum desses efeitos, só a versão estática.

## Login — como funciona e por quê

Escolhi **JWT (token de acesso) + um refresh token guardado no banco**.

- **Token de acesso**: um JWT assinado que dura só 15 minutos. Ele é conferido em um único filtro (`JwtAuthenticationFilter`), sem precisar consultar o banco a cada requisição — fica leve e escala bem.
- **Refresh token**: uma string aleatória de alta entropia. Eu não guardo ela em texto puro no banco — só o **hash SHA-256** dela fica salvo. Com isso dá pra:
  - **Derrubar a sessão de verdade no logout** (marco como revogado e ele para de funcionar na hora).
  - **Trocar o token a cada renovação** (`POST /api/auth/refresh` invalida o antigo e cria um novo — se alguém roubar um refresh token usado, ele já não serve mais).
  - Cobrir o ciclo que o enunciado pediu: `EMITIDA → VÁLIDA → EXPIRADA → RENOVADA → REVOGADA`.

Um detalhe que assumi como troca consciente: o token de acesso em si não dá pra revogar antes de expirar (é assim que token stateless funciona). Por isso ele dura só 15 minutos — se vazar, a janela de uso indevido é pequena, e quem realmente protege a sessão a longo prazo é o refresh token, que sim pode ser revogado.

Senha: uso **BCrypt** com salt por usuário — nunca texto puro nem hash rápido tipo MD5/SHA-1.

Permissão: dois perfis (`ADMIN` e `USER`), checados num lugar só (`SecurityConfig`) — criar chamado exige `ADMIN` por padrão, o resto só pede estar logado.

### Permissões finas, por usuário

Em cima do perfil, existe uma camada extra: o ADMIN pode entrar em **Meu perfil → Permissões** e ligar ou desligar, usuário por usuário, o acesso ao dashboard e a permissão de criar chamado. ADMIN sempre tem acesso total, isso não muda.

Os valores padrão (quando um usuário é criado) reproduzem exatamente o que o enunciado pede: qualquer autenticado vê o dashboard, só ADMIN cria chamado. Então as credenciais de teste (`admin@alfa.com` / `user@alfa.com`) se comportam do jeito documentado acima até alguém mexer nos toggles.

A checagem é real no back-end (`PermissaoService`), não só esconde botão na tela — dá pra confirmar chamando a API direto com um token de usuário sem permissão e recebendo 403.

Um detalhe de UX: o botão de criar chamado mora dentro da tela de dashboard. Se um usuário tiver "criar chamado" ligado mas "ver dashboard" desligado, ele consegue criar chamado pela API mas não tem onde clicar na interface — é uma combinação possível, só não muito útil na prática.

## Como rodar

### Opção 1 — Docker Compose (mais fácil)

Precisa ter Docker instalado.

```bash
./scripts/setup-env.sh    # Windows (PowerShell): .\scripts\setup-env.ps1
docker compose up --build
```

O script gera um `.env` na raiz com um `JWT_SECRET` aleatório, só na primeira vez (não versionado, não sobrescreve se você já tiver um — assim ninguém perde a sessão trocando o segredo à toa). Sem isso, o `docker compose up` para com um erro claro — de propósito, pra nenhum segredo ficar versionado no repositório, nem um default de conveniência.

Isso sobe o Postgres, espera ele ficar pronto, sobe o back-end (que já roda as migrations e carrega os dados sozinho) e depois o front-end.

- Front-end: http://localhost:3000
- API: http://localhost:8080
- Swagger: http://localhost:8080/docs

### Opção 2 — Rodando na mão

**Banco** (via Docker, ou um Postgres que você já tenha):

```bash
docker compose up db
```

**Back-end** (precisa de JDK 21 e Maven):

```bash
./backend/run-local.sh    # Windows (PowerShell): .\backend\run-local.ps1
```

Esse script também gera o `.env` (se ainda não existir), carrega o `JWT_SECRET` de lá pro processo e sobe o Maven — não precisa exportar nada na mão. O schema e os dados (clientes, módulos, tickets de vários períodos entre 2021 e 2025, perfis e usuários de teste) são criados sozinhos assim que sobe, via Flyway.

**Front-end** (precisa de Node 18+):

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Acessa em http://localhost:5173.

### Problema conhecido — Windows com pasta acentuada

Se a pasta do projeto tiver acento no caminho (ex.: `Protótipo-java`), o `mvn spring-boot:run` pode falhar com `ClassNotFoundException: com.alfa.suporte.SuporteApiApplication` mesmo com o build ok — é um bug do plugin do Spring Boot ao montar o classpath num arquivo temporário em paths não-ASCII no Windows.

Contorno: rodar o jar/classpath direto com `java`, sem passar pelo plugin:

```bash
cd backend
mvn dependency:build-classpath -Dmdep.outputFile=cp.txt -q
java -cp "target/classes;$(cat cp.txt)" com.alfa.suporte.SuporteApiApplication
```

(no PowerShell, troque `;` por `;` mesmo — já é o separador do Windows — e use `Get-Content cp.txt -Raw` no lugar de `cat`). Lembre de exportar o `JWT_SECRET` do `.env` antes, ou o app não sobe.

## Variáveis de ambiente

**Back-end** (em `backend/src/main/resources/application.yml`):

| Variável | O que é | Padrão |
|---|---|---|
| `DB_URL` | Endereço do Postgres | `jdbc:postgresql://localhost:5432/suporte` |
| `DB_USER` / `DB_PASSWORD` | Login do banco | `suporte` / `suporte` |
| `JWT_SECRET` | Segredo que assina o token (mín. 32 caracteres) | **sem default — obrigatória**; `scripts/setup-env` gera um sozinho |
| `JWT_ACCESS_EXPIRATION_MS` | Quanto tempo o token de acesso dura | `900000` (15 min) |
| `JWT_REFRESH_EXPIRATION_MS` | Quanto tempo o refresh token dura | `604800000` (7 dias) |
| `CORS_ALLOWED_ORIGINS` | Quais origens podem chamar a API | `http://localhost:5173` |
| `FORKIFY_BASE_URL` | Endereço da forkify-api | `https://forkify-api.herokuapp.com/api/search` |
| `FORKIFY_TIMEOUT_MS` | Tempo limite pra essa chamada externa | `5000` |

**Front-end** (em `frontend/.env`, veja `.env.example`):

| Variável | O que é |
|---|---|
| `VITE_API_URL` | Endereço da API — nunca fica escrito direto no código |

## Credenciais de teste

Já vêm criadas quando o banco sobe:

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

# 2. Dashboard (qualquer usuário logado)
curl http://localhost:8080/api/tickets/dashboard?mes=3&ano=2021 \
  -H "Authorization: Bearer <accessToken>"

# 3. Criar chamado (só ADMIN)
curl -X POST http://localhost:8080/api/tickets \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Teste","codCliente":1,"codModulo":1,"dataAbertura":"2021-03-10"}'

# 4. Renovar sessão
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'

# 5. Logout (derruba o refresh token no servidor)
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

## Documentação da API

Swagger em http://localhost:8080/docs (o JSON cru fica em `/api-docs`). Tem o esquema de segurança configurado — usa o botão **Authorize** com o `accessToken` que você pegou no login.

## Testes automatizados

```bash
cd backend
mvn test
```

Cobrem as partes mais importantes: o agrupamento em memória do dashboard (`DashboardServiceTest`) e as regras de permissão — sem login dá 401, sem permissão dá 403, ADMIN criando ticket dá 201 (`AutorizacaoIntegrationTest`).

## Modelo de dados

```
CLIENTE (1) ──< TICKET >── (1) MODULO

USUARIO >──< PERFIL   (via usuario_perfil)
USUARIO (1) ──< SESSAO   (refresh tokens / sessões)
```

Os scripts ficam em `backend/src/main/resources/db/migration` (Flyway): schema de domínio, carga de clientes/módulos/tickets de março 2021, schema de login e carga de perfis/usuários de teste.

## Algumas decisões que tomei

- **Agrupamento por cliente/módulo em memória** (`DashboardService`): era uma exigência do enunciado — a busca no banco só traz a lista de tickets do período (sem `GROUP BY`/`COUNT`), e quem agrupa é o próprio código Java, usando Streams.
- **Refresh token com SHA-256 em vez de BCrypt**: o refresh token já nasce aleatório e difícil de adivinhar, então não precisa de um algoritmo lento de senha — precisa sim de um hash que dê pra buscar direto no banco (BCrypt gera um salt diferente toda vez, então não dá pra fazer essa busca). Senha de usuário continua sendo BCrypt, só o refresh token usa SHA-256.
- **`networkMode: "always"` no TanStack Query**: sem isso, se o navegador achar (errado) que tá offline — comum atrás de proxy ou VPN de empresa — a tela fica presa em "carregando" pra sempre. Com essa opção, o erro sempre aparece pro usuário, com botão de tentar de novo.
- **Busca de receitas usa `useMutation`, não `useQuery`**: a busca só acontece quando o usuário aperta o botão, não sozinha quando a tela abre.
