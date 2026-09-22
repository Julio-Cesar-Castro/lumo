# Lumo

Site da Lumo para apresentar serviços de landing pages e automação de processos e captar interessados.

## Stack

- React 19 + TypeScript
- Vinext/Vite, com estrutura de rotas compatível com Next.js App Router
- Tailwind CSS e componentes Radix/Shadcn
- API `POST /api/leads` com validação Zod
- Cloudflare D1 (SQLite), com schema e migrations Drizzle

## Rodar localmente

Requisitos: Node.js 22.13 ou superior e pnpm.

```bash
pnpm install --frozen-lockfile
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_redundant_wendell_rand.sql
pnpm dev
```

Aplique a migration uma única vez em um banco local novo. Abra o endereço informado pelo servidor. O comando de desenvolvimento usa a porta 5173 por padrão. Os dados locais ficam em `.wrangler/`, fora do Git.

## Estrutura

- `app/page.tsx`: página e formulário
- `app/globals.css`: identidade visual e responsividade
- `app/api/leads/route.ts`: validação e gravação de contatos
- `lib/leads-db.ts`: acesso ao banco
- `db/schema.ts` e `drizzle/`: schema e migrations
- `public/`: imagens e favicon
- `.openai/hosting.json`: identificação do Site e binding lógico do banco

## Captação de leads

O formulário salva nome, e-mail, telefone, empresa, serviço de interesse, mensagem, consentimento e data. A API não oferece leitura pública de contatos. O projeto ainda não inclui painel administrativo nem notificações por e-mail ou WhatsApp.

## Hospedagem

Esta versão está preparada para o ambiente Sites/Cloudflare Workers com D1. O frontend é React, mas a API depende do binding `DB` de Cloudflare. Para migrar para Vercel + Supabase, será necessário adaptar a camada de persistência e a configuração de build/deploy; não basta importar o repositório.

O repositório contém apenas código e recursos visuais. Credenciais, dependências instaladas, builds e dados de leads não fazem parte do envio. Este envio ao GitHub é uma cópia da versão criada no Sites; não configura sincronização automática ou deploy pelo GitHub.
