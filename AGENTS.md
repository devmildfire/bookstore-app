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

```bash
supabase gen types typescript --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres" > "./api/books/types.ts"; node --env-file .env ./src/utils/createEnumsFile.cjs
```

This overwrites `api/books/types.ts` (generated — do not edit manually) and regenerates enum files from the database schema.

## Architecture

### Stack

- **Next.js 14** (Pages Router, Russian locale only: `i18n.locales: ['ru']`)
- **Supabase** for database + auth (anonymous login on first visit, promoting to real user on account creation)
- **MobX** (`makeAutoObservable`) for client state; **React Query** for server-state caching
- **Tailwind CSS** + **shadcn/ui** (Radix primitives) + **styled-components** (legacy, being phased out)
- **Redux Toolkit** present as a dependency but not actively used

Root redirects `/` → `/books` (configured in `next.config.js`).

### Directory layout

```
pages/          Next.js routes (Pages Router)
api/            Supabase client + typed API modules (NOT Next.js API routes — those live in pages/api/)
src/
  assets/       SVGs, images (SVGs imported via @svgr/webpack)
  components/   UI components, grouped by page; Common/ for shared; Popups/ for modals
  consts/       Named constant exports, one file per domain
  contexts/     React contexts — context.ts + provider.ts + index.ts per context
  entities/     Domain types split into client.ts / server.ts / normalize.ts / validation.ts
  hooks/        Custom hooks, one per file, default export
  layouts/      Page layout wrappers; pages declare getLayout on the component
  lib/          Small utilities (getLocalBase64, Supabase helpers)
  models/       Enums and model types (books, etc.) — some auto-generated
  mocks/        Static mock data
  store/
    globals/    RootStore singleton (LoadingStageModel for app-level loading state)
    locals/     Feature stores (dashboard: TitlesStore, FiltersStore, AdminStore, etc.)
    models/     MobX model classes (TitleModel, AuthorModel, LoadingStageModel)
    interfaces/ ILocalStore — every local store must implement destroy()
  styles/       globals.css and shared style tokens
  types/        Shared TypeScript types; page.ts exports NextPageWithLayout
  utils/        Utility functions, default exports
```

### Import alias

`@/*` maps to `src/*`. External API modules are imported as `api/...` (no alias).

### State management pattern

Local stores live under `src/store/locals/` and implement `ILocalStore` (requires `destroy()`). They use `makeAutoObservable` and are typically instantiated as module-level singletons (e.g. `titlesStore`, `filtersStore`) or provided via React context. `_app.tsx` bootstraps `titlesStore.load()` on mount and gates rendering behind `titlesStore.isLoaded`.

### Entity / data layer pattern

Each domain entity in `src/entities/<name>/` has:
- `server.ts` — Supabase query definitions and server-side types (use `QueryData<typeof query>` for inferred types)
- `client.ts` — normalized TypeScript interfaces used in the frontend
- `normalize.ts` — transforms server shape → client shape via `normalizeObject`
- `validation.ts` — Zod schemas

API calls go through `api/<domain>/` modules that import `supabase` from `api/supabase-client` and call Supabase directly (no REST wrapper layer).

### Layout system

Pages that need a shell declare `getLayout` on the page component:
```ts
MyPage.getLayout = (page) => <PageLayout>{page}</PageLayout>;
```
`_app.tsx` calls `Component.getLayout ?? ((page) => page)` to apply it.

### Auth flow

On app load, `_app.tsx` checks for an existing Supabase session. If none exists it calls `supabase.auth.signInAnonymously()`, attaching the cart cookie UUID to `user.user_metadata.cartID`. Real accounts are created via `/createaccount`.

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
