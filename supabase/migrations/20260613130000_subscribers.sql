-- Mailing-list subscribers (double opt-in). Source of truth in Postgres; active
-- subscribers are mirrored to a Resend Audience for future broadcasts.
-- See docs/plans/email-system.md P6.

create table if not exists public."Subscribers" (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'active', 'unsubscribed')),
  source text,
  confirm_token uuid not null default gen_random_uuid(),
  confirmed_at timestamp with time zone,
  unsubscribe_token uuid not null default gen_random_uuid(),
  resend_contact_id text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- RLS on, no policies → anon/authenticated have no direct access. All access is
-- via the SECURITY DEFINER functions below, called by server code as service_role.
alter table public."Subscribers" enable row level security;

-- Upsert a subscriber as pending and (re)issue a confirm token. Returns the
-- token to email, or {status:'active'} if they're already subscribed.
create or replace function public.subscribe_newsletter(p_email text, p_source text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(trim(p_email));
  v_status text;
  v_token uuid;
begin
  if v_email = '' or position('@' in v_email) = 0 then
    return jsonb_build_object('status', 'invalid');
  end if;

  insert into public."Subscribers" (email, source, status, confirm_token)
  values (v_email, p_source, 'pending', gen_random_uuid())
  on conflict (email) do update set
    status = case when public."Subscribers".status = 'active' then 'active' else 'pending' end,
    confirm_token = case when public."Subscribers".status = 'active'
                         then public."Subscribers".confirm_token else gen_random_uuid() end,
    source = coalesce(excluded.source, public."Subscribers".source),
    updated_at = now()
  returning status, confirm_token into v_status, v_token;

  if v_status = 'active' then
    return jsonb_build_object('status', 'active');
  end if;
  return jsonb_build_object('status', 'pending', 'confirm_token', v_token);
end;
$$;

-- Activate a pending subscriber by confirm token. Returns the email so the
-- caller can sync it to the Resend Audience.
create or replace function public.confirm_newsletter(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_email text;
begin
  update public."Subscribers"
     set status = 'active', confirmed_at = coalesce(confirmed_at, now()), updated_at = now()
   where confirm_token = p_token and status <> 'unsubscribed'
  returning email into v_email;
  if v_email is null then return jsonb_build_object('status', 'invalid'); end if;
  return jsonb_build_object('status', 'ok', 'email', v_email);
end;
$$;

-- Unsubscribe by token. Returns the email + any stored Resend contact id so the
-- caller can remove it from the Audience.
create or replace function public.unsubscribe_newsletter(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_email text; v_contact text;
begin
  update public."Subscribers"
     set status = 'unsubscribed', updated_at = now()
   where unsubscribe_token = p_token
  returning email, resend_contact_id into v_email, v_contact;
  if v_email is null then return jsonb_build_object('status', 'invalid'); end if;
  return jsonb_build_object('status', 'ok', 'email', v_email, 'resend_contact_id', v_contact);
end;
$$;

-- Store the Resend contact id after a successful Audience add.
create or replace function public.set_subscriber_resend_contact(p_email text, p_contact_id text)
returns void language sql security definer set search_path = public as $$
  update public."Subscribers" set resend_contact_id = p_contact_id, updated_at = now()
   where email = lower(trim(p_email));
$$;

revoke all on function public.subscribe_newsletter(text, text) from public, anon, authenticated;
revoke all on function public.confirm_newsletter(uuid) from public, anon, authenticated;
revoke all on function public.unsubscribe_newsletter(uuid) from public, anon, authenticated;
revoke all on function public.set_subscriber_resend_contact(text, text) from public, anon, authenticated;
grant execute on function public.subscribe_newsletter(text, text) to service_role;
grant execute on function public.confirm_newsletter(uuid) to service_role;
grant execute on function public.unsubscribe_newsletter(uuid) to service_role;
grant execute on function public.set_subscriber_resend_contact(text, text) to service_role;
