-- Order confirmation email: idempotent one-time send tracking.
-- See docs/plans/email-system.md P4.

alter table public."Orders"
  add column if not exists confirmation_email_sent_at timestamp with time zone;

-- Atomically claim the right to send the confirmation email for a paid order.
-- Returns true only on the transition (paid AND not yet claimed), so concurrent
-- webhook replays / 0-balance settles can't double-send.
create or replace function public.claim_order_confirmation_email(p_order_id integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  update public."Orders"
     set confirmation_email_sent_at = now()
   where id = p_order_id
     and status = 'paid'
     and confirmation_email_sent_at is null;
  get diagnostics v_rows = row_count;
  return v_rows > 0;
end;
$$;

-- Release a claim (used if the actual email send fails, so a replay can retry).
create or replace function public.release_order_confirmation_email(p_order_id integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public."Orders" set confirmation_email_sent_at = null where id = p_order_id;
$$;

revoke all on function public.claim_order_confirmation_email(integer) from public, anon, authenticated;
revoke all on function public.release_order_confirmation_email(integer) from public, anon, authenticated;
grant execute on function public.claim_order_confirmation_email(integer) to service_role;
grant execute on function public.release_order_confirmation_email(integer) to service_role;
