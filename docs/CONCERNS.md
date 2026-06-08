# Open Concerns

Tracked issues that are not part of an active plan but haven't been resolved.

**Last reviewed:** 2026-06-06.

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