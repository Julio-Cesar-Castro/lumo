# lummoo

Site comercial da **lummoo**, com landing page React e API Node.js para captação de leads, mensagens de contato e pedidos de orçamento. O layout escuro em azul/violeta foi preservado; a estrutura antiga de Sites/Vinext/Cloudflare D1 foi substituída por um monorepo com Supabase e Resend.

## Organização

| Diretório                       | Responsabilidade                                     |
| ------------------------------- | ---------------------------------------------------- |
| `frontend/pages/`               | Composição das páginas                               |
| `frontend/components/layout/`   | Marca, cabeçalho e rodapé                            |
| `frontend/components/sections/` | Seções da página                                     |
| `frontend/components/forms/`    | Formulário de captação                               |
| `frontend/components/ui/`       | Apenas os cinco componentes de interface utilizados  |
| `frontend/src/`                 | Entrada React, estilos, hooks e cliente HTTP         |
| `frontend/public/`              | Imagens e favicon                                    |
| `api/leads/index.ts`            | Entrada de `POST /api/leads`                         |
| `api/contact/index.ts`          | Entrada de `POST /api/contact`                       |
| `api/quote/index.ts`            | Entrada de `POST /api/quote`                         |
| `api/src/http/`                 | Tratamento de requisições, CORS, limites e respostas |
| `api/src/services/`             | Fluxo de gravação e notificação                      |
| `api/src/repositories/`         | Persistência das solicitações                        |
| `api/src/integrations/`         | Clientes HTTP do Supabase e Resend                   |
| `api/src/emails/`               | Conteúdo das notificações                            |
| `api/src/config/`               | Validação das variáveis de ambiente                  |
| `api/tests/`                    | Testes com provedores simulados                      |
| `packages/contracts/`           | Tipos e validações Zod compartilhados                |
| `supabase/migrations/`          | Schema PostgreSQL, RLS e funções de controle         |
| `scripts/`                      | Empacotamento para Vercel                            |

Workspaces pnpm: `@lummoo/frontend`, `@lummoo/api` e `@lummoo/contracts`. React/Vite no frontend, Node.js/TypeScript na API. As integrações usam as APIs HTTP oficiais, sem acoplar os componentes React aos provedores. Segredos existem apenas no backend.

## Preparar o ambiente

Requisitos: Node.js **22.13+** e pnpm **11.25.0**. Instale a versão do pnpm indicada em `packageManager`.

```bash
pnpm install --frozen-lockfile
```

Copie `api/.env.example` para `api/.env`. O arquivo do frontend é opcional: copie `frontend/.env.example` para `frontend/.env` apenas se precisar definir uma URL de API diferente.

| Variável da API       | Valor                                                                       |
| --------------------- | --------------------------------------------------------------------------- |
| `SUPABASE_URL`        | URL do projeto Supabase                                                     |
| `SUPABASE_SECRET_KEY` | Chave secreta `sb_secret_...`, exclusiva do servidor                        |
| `RESEND_API_KEY`      | Chave de envio do Resend                                                    |
| `EMAIL_FROM`          | Remetente com domínio verificado, ex.: `lummoo <contato@seudominio.com.br>` |
| `LEADS_EMAIL_TO`      | Caixa de entrada que receberá as notificações                               |
| `ALLOWED_ORIGINS`     | Origens completas separadas por vírgula; local: `http://localhost:5173`     |
| `RATE_LIMIT_SALT`     | Segredo aleatório com pelo menos 32 caracteres                              |
| `PORT`                | Porta da API; padrão `3001`                                                 |

Gere o segredo do limite de requisições com:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Não coloque chaves Supabase ou Resend em variáveis `VITE_*`. Elas seriam incluídas no JavaScript público.

## Configurar o Supabase

1. Crie um projeto e copie a URL e a **secret key** para o ambiente do backend.
2. Execute uma única vez `supabase/migrations/202609220001_inquiries.sql` no SQL Editor do projeto. Em projetos gerenciados com Supabase CLI, aplique o mesmo arquivo pelo fluxo de migrations.
3. Mantenha a Data API habilitada para o schema `public`.
4. Confira as tabelas `inquiries` e `submission_limits`. As solicitações ficam em `inquiries`, com os campos de contato em `payload`.

A migration habilita RLS e revoga acesso de `anon` e `authenticated`; não há leitura ou gravação pública dessas tabelas. As operações passam pela API Node e sua chave secreta. As funções de limite e notificação só podem ser executadas por `service_role`.

O banco D1 da versão anterior não é migrado automaticamente. Se houver leads reais no site antigo, exporte-os e planeje a importação antes de desativá-lo; não publique esses dados no GitHub.

## Configurar o Resend

1. Verifique o domínio remetente no Resend e conclua os registros DNS indicados pelo serviço.
2. Crie uma chave de envio e configure `RESEND_API_KEY`.
3. Configure `EMAIL_FROM` e `LEADS_EMAIL_TO`.

A notificação é enviada para a equipe da lummoo, com o e-mail do interessado em `reply_to`. Não há resposta automática ao visitante ou inscrição em marketing. O template usa texto simples para evitar renderizar HTML informado no formulário.

## Desenvolvimento

```bash
pnpm dev
```

O comando compila os contratos e inicia o frontend em `http://localhost:5173` e a API na porta `3001`. O Vite encaminha `/api` para a API local. A API valida as configurações ao iniciar e não simula sucesso quando as credenciais estão ausentes.

Depois de mudar `packages/contracts/src/index.ts`, execute `pnpm --filter @lummoo/contracts build` para atualizar os contratos consumidos pelos dois aplicativos.

```bash
pnpm build          # Contratos, API e frontend
pnpm typecheck      # Validação de tipos
pnpm test           # Testes da API sem provedores reais
pnpm format         # Formata o código com Prettier
pnpm format:check   # Verifica a formatação
```

## Endpoints

Todos aceitam `POST` JSON e preflight `OPTIONS`. Não há endpoint público para listar contatos. O formulário visível utiliza `/api/leads`; contato e orçamento estão disponíveis para futuras interfaces, sem adicionar formulários extras ao site.

| Rota           | Campos específicos                                                               |
| -------------- | -------------------------------------------------------------------------------- |
| `/api/leads`   | `interest`: `Landing page`, `Automação` ou `Os dois`                             |
| `/api/contact` | `message` com 10 a 3.000 caracteres                                              |
| `/api/quote`   | `interest`, `message` com 10 a 3.000 caracteres; `budget` e `timeline` opcionais |

Campos comuns: `name`, `email`, `phone`, `consent: true`; `company` e `message` opcionais quando a rota não os exige. `website` é o campo honeypot e deve ficar vazio. O limite do corpo é 16 KB.

Exemplo de corpo para `/api/leads`:

```json
{
  "name": "Cliente Exemplo",
  "email": "cliente@example.com",
  "phone": "11999999999",
  "company": "Minha empresa",
  "interest": "Landing page",
  "message": "Gostaria de apresentar meus serviços.",
  "consent": true,
  "website": ""
}
```

Resposta de recebimento: `201 { "ok": true }`. Erros usam `{ "error": "mensagem" }`: `400` validação, `403` origem, `405` método, `409` conflito de idempotência, `413` tamanho, `415` tipo de conteúdo, `429` limite e `503` indisponibilidade.

O frontend envia `Idempotency-Key` como UUID e mantém a mesma chave para repetir os mesmos dados após uma falha. A API impede duplicidade e rejeita a reutilização da chave com dados diferentes. Clientes próprios também devem enviar uma chave estável por solicitação; sem ela, cada envio cria um novo registro.

## Gravação e falha de e-mail

1. A API valida origem, tamanho, limite e conteúdo.
2. Salva a solicitação no Supabase com estado `pending`.
3. Envia o e-mail pelo Resend usando uma chave de idempotência derivada do ID.
4. Atualiza a notificação para `sent` ou `failed`.

Uma falha de e-mail **não apaga o contato** e não transforma uma gravação bem-sucedida em erro para o visitante. O sucesso no formulário significa contato registrado, não entrega de e-mail confirmada. Falhas são registradas por ID, sem imprimir dados pessoais ou chaves.

Para reprocessar até 100 notificações pendentes/falhas:

```bash
pnpm --filter @lummoo/api retry-emails
```

O comando é manual; nenhum agendamento externo foi criado. Tentativas cujo primeiro envio começou há 23 horas ou mais ficam para revisão manual, evitando reenvio ambíguo após a janela de idempotência do Resend. Confira o estado no Resend antes de reenviar esses casos. Registros ainda sem tentativa não têm essa restrição.

O limite é persistido no Supabase: cinco tentativas por endereço de origem em dez minutos, compartilhadas entre as três rotas. O endereço é transformado em HMAC com o segredo configurado. Em Node standalone, usa-se o endereço do socket; atrás de proxy, clientes podem compartilhar esse limite. Na Vercel usa-se o cabeçalho de origem sobrescrito pela plataforma. CORS e honeypot são complementos, não autenticação ou proteção completa contra bots.

## Publicar na Vercel

Importe este repositório mantendo a **raiz do monorepo** como Root Directory e selecione **Other** como framework. `vercel.json` define instalação e build. Configure as variáveis da API no painel e inclua o domínio real em `ALLOWED_ORIGINS`.

```bash
pnpm build:vercel
```

O script gera `.vercel/output` com o frontend estático e apenas três funções Node: `/api/leads`, `/api/contact` e `/api/quote`. Módulos internos não são expostos como rotas. O diretório gerado não é versionado. Na mesma origem, deixe `VITE_API_URL` vazio. Para previews com domínio diferente, inclua a origem exata no ambiente correspondente.

A publicação depende da configuração dos provedores. O build não cria projeto Supabase, não aplica migrations remotas, não verifica DNS e não envia e-mails.

## Executar a API em servidor Node

Após `pnpm build`, use `pnpm --filter @lummoo/api start`. Sirva `frontend/dist` em um servidor estático e encaminhe `/api` para o backend, ou defina `VITE_API_URL` antes do build e ajuste `ALLOWED_ORIGINS`. Não exponha as pastas de código ou arquivos `.env` pelo servidor estático.

## Estado desta refatoração

- Layout e recursos visuais preservados; marca corrigida para **lummoo**.
- Build, tipos e oito testes locais verificados com integrações simuladas.
- Integração real depende de configurar as variáveis, aplicar a migration e validar o domínio remetente.
- Nenhuma credencial ou dado de lead está versionado.
- O endereço do repositório continua `Julio-Cesar-Castro/lumo`; a marca e os pacotes são `lummoo`.
- O site antigo no Sites não é atualizado automaticamente por este repositório. A nova arquitetura deve ser publicada no ambiente Node/Vercel após a configuração.
