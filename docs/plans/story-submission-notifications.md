# Plan — Admin email notification for story submissions

Status: **planned (not implemented)**. Email/SMTP is still stubbed across the
app (see CLAUDE.md → Checkout flow "real SMTP … out of scope"), and
`src/lib/email/` is currently empty. This document is the design to wire a real
notification when an author submits a story through the
`/suggest-story-to-rd` modal.

## Goal

When a manuscript is uploaded via `submitStorySubmission`, send an email to the
editorial inbox describing **what** was submitted and **from whom**, so an
editor can review the file and contact the author.

## What the email must contain

- **Author name** — the `Авторское имя` field.
- **Who** — the submitter's `user.id`, and whether they are **registered or
  anonymous** (`is_anonymous`).
- **Known contact channel** — for a registered user, their account email (and
  provider); for an anonymous user, an explicit "unregistered — reachable only
  via the site session" note.
- **Author-provided feedback channel** — the `Сопроводительное письмо` textarea
  (now repurposed as the free-form contact/feedback field — see
  `StorySubmitModal`). This is the only way to reach an anonymous author after
  their cookies expire, so it must be surfaced prominently.
- **The file** — bucket object key plus a short-lived **signed download URL**
  (the bucket is private; never expose a public link).
- Submission timestamp.

## Where it fires

The upload happens **client-side**, straight to Storage, so the notification
cannot be sent from the browser (admin address + SMTP creds must stay
server-only). Two viable triggers:

1. **Server Action invoked after a successful upload (recommended).**
   - Add `notifyStorySubmission()` as a server action in
     `src/lib/stories/actions.ts` (or `src/api/stories/`), called by the modal
     immediately after `submitStorySubmission` returns `ok`.
   - The action re-reads the user from the **server** session (never trust the
     client for identity/contact), re-derives `is_anonymous` + email the same
     way `app/profile/layout.tsx` does, generates the signed URL with the
     service role, and sends the email.
   - Input from the client is only the **object path**, author name, and
     feedback text; everything identity-related is re-derived server-side.
   - Pro: simple, no extra infra. Con: a failed email won't block the (already
     succeeded) upload — log it; consider a lightweight retry/queue later.

2. **Storage webhook / Supabase Edge Function on object create** (alternative).
   - Fires on `INSERT` into `storage.objects` for `bucket_id =
     'story-submissions'`. Fully decoupled from the request, survives client
     disconnects. Con: more infra, and author name/feedback aren't in the
     object row, so we'd need to also persist a `StorySubmissions` table (see
     below) and key the email off that.

Recommendation: ship **(1)** now; revisit **(2)** if delivery reliability
becomes important.

## Email transport

`src/lib/email/` is empty — pick a transport and add a thin `sendEmail()`:

- **Resend** (HTTP API, no SMTP infra) or **nodemailer + SMTP** (matches the
  self-hosted VPS direction). Either way wrap it so the rest of the app calls
  one `sendEmail({ to, subject, html, text })`.
- New env vars: `STORY_SUBMISSIONS_EMAIL` (recipient), plus transport creds
  (`RESEND_API_KEY` **or** `SMTP_HOST/PORT/USER/PASS`). Document in `.env`.

## Suggested message

- Subject: `Новая заявка в журнал: рассказ от {authorName}`
- Body (text + html): author name; registered/anonymous; known contact
  (email + provider, or "не зарегистрирован"); the author's feedback text
  verbatim; file name + signed URL (1 h TTL); submission time.

## Optional: persist submissions

The notification carries everything an editor needs, but a `StorySubmissions`
table (`id, user_id, author_name, feedback, object_path, created_at`) would give
a durable record, an admin list view, and a clean source for option (2). Out of
scope for the first cut; add when a review workflow is built.

## Security / correctness notes

- Re-derive identity and contact from the **server session**, not client input.
- Generate the signed URL server-side with the service role; keep the bucket
  private (RLS already restricts reads to the owner).
- Don't fail the user's submission if the email send fails — the file is already
  safely stored; surface success to the user and log the email error.
- Escape author/feedback text in the HTML body (untrusted user input).

## Touch points

- `src/api/stories/submitStorySubmission.ts` — returns the object `path` already.
- New: `src/lib/email/sendEmail.ts`, `src/lib/stories/actions.ts`
  (`notifyStorySubmission`).
- `src/components/authors/StorySubmit/StorySubmitModal.tsx` — call the action
  after a successful upload.
