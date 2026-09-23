begin;
create table public.inquiries (
  id uuid primary key,
  kind text not null check (kind in ('lead','contact','quote')),
  fingerprint text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  notification_status text not null default 'pending' check (notification_status in ('pending','failed','sent')),
  notification_started_at timestamptz,
  resend_id text
);
create index inquiries_notifications_idx on public.inquiries(created_at) where notification_status in ('pending','failed');
alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;
grant select, insert, update on public.inquiries to service_role;
create table public.submission_limits (key text primary key, window_start timestamptz not null, count integer not null);
create index submission_limits_window_idx on public.submission_limits(window_start);
alter table public.submission_limits enable row level security;
revoke all on public.submission_limits from anon, authenticated;
-- Only backend service_role can execute these functions. No direct browser writes.
create function public.consume_submission_limit(p_key text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare hits integer;
begin
  delete from public.submission_limits where window_start < now() - interval '20 minutes';
  insert into public.submission_limits as limits (key,window_start,count) values(p_key,now(),1)
  on conflict (key) do update set
    count = case when limits.window_start < now() - interval '10 minutes' then 1 else limits.count+1 end,
    window_start = case when limits.window_start < now() - interval '10 minutes' then now() else limits.window_start end
  returning count into hits;
  return hits <= 5;
end;
$$;
create function public.start_inquiry_notification(p_id uuid) returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare started timestamptz;
begin
  update public.inquiries set notification_started_at=coalesce(notification_started_at,now()) where id=p_id
  returning notification_started_at into started;
  if started is null then raise exception 'Unknown inquiry'; end if;
  return started;
end;
$$;
revoke all on function public.consume_submission_limit(text) from public, anon, authenticated;
revoke all on function public.start_inquiry_notification(uuid) from public, anon, authenticated;
grant execute on function public.consume_submission_limit(text) to service_role;
grant execute on function public.start_inquiry_notification(uuid) to service_role;
commit;
