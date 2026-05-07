# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (localhost:3000)
npm run build        # production build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
```

There is no test suite. Lint runs automatically on staged `.ts/.tsx/.js/.jsx` files via pre-commit hook.

### Regenerate Supabase types (run from repo root)

Local (Docker):
```bash
supabase gen types typescript --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres" 2>/dev/null > "./src/types/supabase.ts"
```

Production (once VPS is live):
```bash
supabase gen types typescript --db-url "postgresql://postgres:<password>@<vps-ip>:5432/postgres" 2>/dev/null > "./src/types/supabase.ts"
```

This overwrites `src/types/supabase.ts` (generated — do not edit manually).

## Architecture

### Stack

- **Next.js 16.2.4** (App Router, Russian content — no i18n framework, locale is handled by content only)
- **Supabase** for database + auth (anonymous login on first visit, promoting to real user on account creation)
- **TanStack Query v5** for server-state caching and client-side data fetching
- **SCSS Modules** for all styling; **Radix UI** primitives for accessible components
- No MobX, no Tailwind, no styled-components, no Redux in the codebase

### Directory layout

```
src/
  app/          Next.js App Router routes (layout.tsx, page.tsx, error.tsx per segment)
    account/    User account page
    auth/       login/ and register/ routes
    books/      Catalog ([slug]/ for book detail)
    cart/       Cart page
    checkout/   Checkout and success/
    subscription/ Subscription plans page
  api/          Supabase API modules — one directory per domain (books/, cart/, orders/, subscriptions/)
  assets/       SVGs, images (SVGs imported via @svgr/webpack)
  components/   UI components, grouped by domain; common/ for shared; subscriptions/ for subscription UI
  consts/       Named constant exports, one file per domain
  contexts/     React contexts — context.ts + provider.ts + index.ts per context
  entities/     Domain types split into client.ts / server.ts / normalize.ts / validation.ts
  hooks/        Custom hooks, one per file, default export
  lib/          Helpers: auth/actions.ts, supabase/client.ts + server.ts, storage.ts, etc.
  styles/       globals.scss and shared style tokens
  types/        Shared TypeScript types; supabase.ts is generated — do not edit manually
  utils/        Utility functions, default exports (currently empty placeholder)
```

### Import alias

`@/*` maps to `src/*`. API modules live in `src/api/` and are imported as `@/api/...`.

### State management pattern

There is no global client-side state library. Server state is managed by TanStack Query (cache keys, mutations, invalidation). Local UI state uses `useState`/`useReducer` in components or React context for cross-component sharing (see `src/contexts/`). There is no MobX, Redux, or Zustand.

### Entity / data layer pattern

Each domain entity in `src/entities/<name>/` has:
- `server.ts` — Supabase query definitions and server-side types (use `QueryData<typeof query>` for inferred types)
- `client.ts` — normalized TypeScript interfaces used in the frontend
- `normalize.ts` — transforms server shape → client shape via `normalizeObject`
- `validation.ts` — Zod schemas

API calls go through `src/api/<domain>/` modules that import the Supabase client from `@/lib/supabase/client` (browser) or `@/lib/supabase/server` (RSC / Server Actions) and call Supabase directly (no REST wrapper layer).

### Layout system

Layouts use the App Router convention: each route segment can have a `layout.tsx` that wraps its children. The root layout (`src/app/layout.tsx`) sets the HTML shell, loads fonts, and renders `<Header>` and the `Providers` wrapper. There is no `getLayout` pattern — that was a Pages Router convention.

### Auth flow

On app load, `src/app/providers.tsx` checks for an existing Supabase session client-side. If none exists it calls `supabase.auth.signInAnonymously()`. `src/proxy.ts` (the Next.js 16 proxy file) refreshes sessions on every request and sets the `bookstore_cart_id` cookie for anonymous users. Real accounts are created via `/auth/register`; login via `/auth/login`.

## Storage & Images

### Cover images

Book covers are stored in a **Supabase Storage bucket called `covers`** (public, 20 MB file limit).

**How it works:**
- The `Titles.cover` column stores **bare filenames only** (e.g., `murlo.jpg`, `povelitel-bloh.png`).
- The `getCoverUrl()` function in `src/lib/storage.ts` converts filenames to full URLs at runtime using `NEXT_PUBLIC_SUPABASE_URL`.
- All code paths (`getBooks`, `getBook`, `searchBooks`) go through `normalizeBook()` → `getCoverUrl()`.
- `next/image` handles optimization and resizing — no separate thumbnails needed.

**Adding new covers:**
1. Upload the image to the `covers` bucket (via Supabase Dashboard, CLI, or `scripts/upload-covers-to-supabase.mjs`)
2. Set `Titles.cover = 'filename.jpg'` in the database (bare filename, no path prefix)

**Self-hosted Supabase (same VPS):**
- `NEXT_PUBLIC_SUPABASE_URL` must be the **public-facing** URL (e.g., `https://api.example.com`), not an internal Docker hostname, because it's used in browser-side image URLs.
- Add the hostname to `remotePatterns` in `next.config.ts` so `next/image` can optimize the images.
- The Supabase Storage API serves images at `{NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/{filename}`.
- If using a reverse proxy (nginx/caddy), ensure it proxies `/storage/v1/object/public/` requests to the Supabase Storage container.

**Scripts:**
- `scripts/scrape-books.mjs` — Scrapes book data from the old chtivo.spb.ru site
- `scripts/generate-seed-sql.mjs` — Generates `supabase/seed-books.sql` from scraped JSON (stores bare filenames for covers)
- `scripts/download-covers.mjs` — Downloads cover images locally (to `public/covers/`)
- `scripts/upload-covers-to-supabase.mjs` — Creates the `covers` bucket and uploads images
- `scripts/retry-covers.mjs` — Retries failed uploads
- `scripts/update-cover-urls-supabase.mjs` — Generates SQL to update cover URLs in the database

## Conventions and Code Culture

**Read these before writing any code.** They define the standards all agents must follow.

| Document | Covers |
|----------|--------|
| [docs/conventions/CODE_STYLE.md](docs/conventions/CODE_STYLE.md) | Formatting, naming, React/Next.js rules, Server vs Client |
| [docs/conventions/SCSS.md](docs/conventions/SCSS.md) | SCSS Modules, tokens, breakpoints, responsive strategy |
| [docs/conventions/TYPESCRIPT.md](docs/conventions/TYPESCRIPT.md) | Strict TypeScript, type design, `any` policy |
| [docs/conventions/COMPONENTS.md](docs/conventions/COMPONENTS.md) | Component structure, Radix UI, forms, layouts |
| [docs/conventions/DATA.md](docs/conventions/DATA.md) | TanStack Query, Supabase, Server Actions, entity layer |
| [docs/conventions/PERFORMANCE.md](docs/conventions/PERFORMANCE.md) | Core Web Vitals, dynamic imports, images, fonts, Suspense |
| [docs/conventions/SEO.md](docs/conventions/SEO.md) | Metadata API, accessibility (WCAG 2.1 AA), security |
| [docs/conventions/ERROR_HANDLING.md](docs/conventions/ERROR_HANDLING.md) | Error boundaries, Server Actions, loading/not-found patterns |

Key rules at a glance:
- **No Tailwind. No styled-components.** SCSS Modules only.
- **No class components.** Functional components with hooks only.
- **No `any`.** Use `unknown` at unsafe boundaries, then narrow.
- **Server Components by default.** Add `'use client'` only when required.
- **All Supabase calls go through `src/api/<domain>/`.** Never call Supabase directly from components.
- **Commit messages**: short imperative slug, no AI attribution.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
