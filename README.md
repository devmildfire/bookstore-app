# Chtivo

Новый сайт Чтива — книжный магазин на **Next.js 16 (App Router)** + **Supabase**, со SCSS
Modules и TanStack Query. Контент русскоязычный.

## Getting Started

```bash
npm run dev   # dev-сервер на http://localhost:3000
```

## Документация

Вся актуальная документация — архитектура, стек, команды, соглашения и инварианты — живёт в
**[AGENTS.md](AGENTS.md)** (единый источник правды) и каталоге [`docs/`](docs/):

- [docs/conventions/](docs/conventions/) — стиль кода, SCSS, TypeScript, компоненты, данные, перф, SEO.
- [docs/testing/STRATEGY.md](docs/testing/STRATEGY.md) — стратегия тестов (Vitest unit/integration + Playwright e2e).
- [docs/deployment/](docs/deployment/) — деплой на VPS (Cloudflare Tunnel + Supabase self-host).
- [docs/CONCERNS.md](docs/CONCERNS.md) — открытые вопросы и отложенные задачи.

> Старое описание Pages-Router/MobX-архитектуры удалено — оно больше не соответствует коду.
