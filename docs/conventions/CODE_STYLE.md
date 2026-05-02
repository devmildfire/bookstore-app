# Code Style

## Formatting

- Single quotes, no semicolons, print width 120, trailing commas `es5`
- These are enforced by Prettier — do not manually reformat files without a functional reason
- ESLint config is the authority; if this doc conflicts with it, ESLint wins

## Naming

| Kind | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `BookCard.tsx`, `CheckoutForm.tsx` |
| Hooks | camelCase + `use` prefix | `useCart.ts`, `useSupabaseUser.ts` |
| Utilities / helpers | camelCase | `formatPrice.ts`, `normalizeBook.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_CART_ITEMS`, `DEFAULT_PAGE_SIZE` |
| Booleans | verb prefix | `isLoading`, `hasError`, `canSubmit`, `isVisible` |
| Server Actions | camelCase + `Action` suffix | `loginAction.ts`, `checkoutAction.ts` |

## Imports

- Use the `@/*` alias (maps to `src/*`) for all internal imports — avoid deep relative paths
- Use `import type` when importing types only
- Remove unused imports — linting enforces this

```ts
import type { Book } from '@/entities/book/client'
import { normalizeBook } from '@/entities/book/normalize'
```

## React and Next.js

- Functional components only — no class components
- Keep rendering logic readable; extract helpers when JSX exceeds ~200 lines
- Side effects belong in hooks, not in render bodies
- Use early returns / guard clauses instead of deeply nested conditionals
- Prefer a single `variant` prop over multiple boolean flags:
  ```tsx
  // good
  <Button variant="primary" />
  // bad
  <Button isPrimary isLarge />
  ```
- Use `next/image` instead of `<img>` for all images
- Never use `dangerouslySetInnerHTML` unless the content is from a trusted source and explicitly sanitized
- Do not spread `{...props}` onto DOM elements — whitelist props explicitly
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`); add ARIA attributes only when native semantics are insufficient
- Do not add `useMemo` / `useCallback` / `React.memo` without profiling — premature memoization adds noise

## Server vs Client Components

The default in App Router is Server Components. Mark a file `'use client'` only when it actually needs it.

**Needs `'use client'`:**
- Uses `useState`, `useEffect`, `useReducer`, or any React hook
- Uses browser APIs (`window`, `document`, `localStorage`)
- Attaches event handlers (`onClick`, `onChange`, etc.)
- Uses a context that depends on client state
- Uses TanStack Query hooks

**Does not need `'use client'`:**
- Fetches data from Supabase directly (do it in the Server Component)
- Renders static or async-loaded content
- Passes data down to Client Component children

Keep `'use client'` boundaries as deep in the tree as possible — push them to leaf components, not layouts.

## General Reliability

- Do not swallow errors silently — always propagate or log them
- Prefer explicit fallbacks over relying on implicit `undefined` behavior
- Remove temporary debug logs (`console.log`) before committing
- Never commit secrets or values from `.env*` files

## Dependency Management

- **All dependencies must be pinned to exact versions** — no `^`, `~`, or `latest` in `package.json`
- `.npmrc` contains `save-exact=true` so `npm install <pkg>` defaults to exact pinning
- Reason: range specifiers allow automatic minor/patch upgrades that can introduce supply chain compromises
- When adding a new package: install it (`npm install <pkg>`), verify the exact version landed in `package.json`, commit both `package.json` and `package-lock.json`

## Commit Messages

- Short imperative slug: `add book detail page`, `fix cart cookie on SSR`
- No AI attribution in commit messages (do not add `Co-Authored-By: Claude`)
- No ticket prefixes required for this project
