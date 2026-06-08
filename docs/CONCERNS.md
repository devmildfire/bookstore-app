# Open Concerns

Tracked issues that are not part of an active plan but haven't been resolved.

**Last reviewed:** 2026-06-08.

---

## D1 🔴 Repo cannot rebuild the database — no authoritative schema source of truth

`supabase/seed.sql` + `supabase/migrations/` **cannot reconstruct the database from
scratch.** Several core tables have **no `CREATE TABLE` anywhere in the repo** — they
were only ever hand-applied to the live instance:

- `Ebooks`, `Audiobooks`, `PrintedBooks`, `Orders`, `OrderItems`, `Cart` are **not
  created** by any migration; `seed.sql` only creates 6 tables (Authors, Titles,
  Titles_Authors, Awards, Titles_Awards, CardBooks).
- Migrations like `cart_user_isolation` *ALTER* `Cart` assuming it already exists.
- `seed.sql` is a partial/older snapshot (e.g. it lacks columns added later such as
  `Titles.status`, `cover_blur`, `book_photos_blurs`, `demo_path`).
- A `supabase db reset` therefore **fails** (migrations run before seed, and the
  earliest migration references tables seed never creates). The DB has only ever
  been maintained via incremental `supabase migration up` on a long-lived instance.

This bit hard on **2026-06-06** when an agent wiped the local DB/storage and there was
no clean way to rebuild — recovery had to reconstruct `OrderItems`/`Cart` DDL from
`src/types/supabase.ts` + RPC column lists (see migration
`20260608150000_rebuild_cart_orderitems.sql`).

**Action (make the repo the source of truth):**
1. Generate a complete schema dump of the live DB
   (`pg_dump --schema-only`) and fold the missing `CREATE TABLE`s (Ebooks,
   Audiobooks, PrintedBooks, Orders, OrderItems, Cart, …) into either an initial
   migration or a regenerated `seed.sql` so `seed.sql + migrations` reproduces the
   live schema exactly.
2. Decide the bootstrap order and make `supabase db reset` actually work (or
   document the real bootstrap: load schema, then `migration up`).
3. Keep `seed.sql` regenerated whenever the base schema changes; treat
   `src/types/supabase.ts` and the live DB as needing to agree.
4. Known still-divergent bits to fold in while doing this: `Orders.delivery_method`
   (referenced by the fulfillment `mark_order_paid` but missing), and confirm every
   table's RLS read policy exists (the storefront broke twice from missing
   public-read policies — see `20260608140000_edition_tables_public_read.sql`).

See also [docs/DATABASE_BACKUP.md](DATABASE_BACKUP.md) (backup-before-destructive rule).

---

## S1 🔴 Production credentials in `.env` git history

`.env` is gitignored, but credentials may have been committed before it was added.
Check `git log --all -- .env` to confirm.

**Keys that may need rotation:**

| Variable | Sensitivity |
|----------|------------|
| `SUPABASE_SERVICE_ROLE_KEY` | **Maximum** — bypasses all RLS |
| `BREVO_APIKEY` | High — email delivery service |
| `TELEGRAM_BOT_APIKEY` | High — Telegram bot token |
| `ROBOPASS_ONE` / `ROBOPASS_TWO` | High — Robokassa payment passwords |

**Action:** Rotate all credentials in their respective dashboards if any were ever
committed to git.

---

## G2 — Email delivery not implemented

`resend` and `@react-email/components` are installed but no templates or sending
logic exist. Order confirmation, password reset, and admin notification emails
are all stubbed.

**Dependencies:** Brevo API key (see S1).

---

## Unused Radix packages

The following Radix packages are installed but have no component consuming them.
They were pre-installed for future use — keep or remove as needed:

- `@radix-ui/react-accordion`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-label`

---

*Migrated from `docs/AUDIT.md` (historical audit snapshot, deleted 2026-06-06).*