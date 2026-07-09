# LedgerFlow — Frontend

Frontend do LedgerFlow (SPA). Consome a API do backend Spring Boot.

**Stack:** React + TypeScript (Vite), MUI, TanStack Query, React Router,
React Hook Form + Zod, Axios.

## Rodando localmente

Pré-requisito: backend rodando em `http://localhost:8080` (ver `../LedgerFlow/DEPLOY.md`).

```bash
npm install
npm run dev
```

App em http://localhost:5173. O `vite.config.ts` faz proxy de `/api` → `localhost:8080`,
então não há problema de CORS em desenvolvimento.

Primeiro acesso (admin criado pelo backend na 1ª subida):
`admin@ledgerflow.local` / `admin123`.

## Scripts

| Comando | O quê |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção (`dist/`) |
| `npm run preview` | serve o build localmente |
| `npm run typecheck` | checagem de tipos sem emitir |

## Variáveis de ambiente

| Var | Descrição |
|---|---|
| `VITE_API_BASE_URL` | URL base da API. Dev: `/api` (proxy). Prod: URL pública do backend. |

Copie `.env.example` para `.env` e ajuste conforme o ambiente.

## Estrutura

```
src/
  modules/<modulo>/   # pages, components, hooks (TanStack Query), types.ts, api.ts
  shared/             # AppLayout, DataTable, FileDropzone, lib (axios, theme...), hooks
  App.tsx             # rotas (públicas, portal do cliente, privadas por perfil)
  main.tsx            # bootstrap (tema, query client, router, auth, snackbar)
```

Cada épico (E0–E17) do documento `03-frontend.md` está mapeado em um módulo.

## Deploy

Duas opções (ambas cobertas em `../LedgerFlow/DEPLOY.md`):
- **Vercel/Netlify** (build estático, `vercel.json` já incluso).
- **Docker + nginx** (`Dockerfile` + `nginx.conf`), para Railway/Render.

Em produção, defina `VITE_API_BASE_URL` com a URL pública do backend e garanta que
o `CORS_ALLOWED_ORIGINS` do backend inclua o domínio do frontend.
