# Last Arc: Tactics Analogue — Digital Companion

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind + shadcn/ui
- **Deploy:** Cloudflare Pages
- **API/IA:** Cloudflare Workers → OpenRouter
- **Dados:** Supabase (Auth, PostgreSQL, Storage)
- **Runtime:** Bun

## Setup Local

```bash
bun install
cp .env.example .env
cp workers/.dev.vars.example workers/.dev.vars
# Preencha ambos os arquivos

# terminal 1
bun dev

# terminal 2
bun dev:worker
```

O frontend fica em `http://localhost:5173` e o Worker em `http://localhost:8787`.

## Deploy

```bash
bun deploy:worker
bun run build
bun deploy:pages
```

## OpenRouter

- `anthropic/claude-3.5-sonnet` — geração de NPCs e descrições
- `google/gemini-2.5-flash` — tarefas rápidas, resumo e parsing
- `deepseek/deepseek-chat` — coding assistant econômico

`OPENROUTER_API_KEY` é segredo do Worker e nunca deve ser exposto ao frontend.
Chaves Supabase expostas no histórico Git devem ser rotacionadas.

## Estrutura

- `/src` — Frontend React
- `/workers` — Cloudflare Worker (API, IA e cache)
- `/supabase` — Migrations e Edge Functions legado
