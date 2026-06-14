-- Make subscribe_newsletter.p_source optional (DEFAULT NULL) so the generated
-- TypeScript type is `p_source?: string` and callers can omit it. The body already
-- tolerates NULL via coalesce(excluded.source, ...). Body unchanged — only the
-- parameter default is added. (data-architecture audit F4 — honest RPC types.)
create or replace function public.subscribe_newsletter(p_email text, p_source text default null)
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
