-- Phase 1: minimal, self-hosted, GDPR-clean analytics.
-- Applied to project gvquhciebjaasmshdjxn on 2026-09-04.
-- Rollback: drop view public.daily_metrics; drop table public.analytics_events;

create table public.analytics_events (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete set null,
  session_id text,
  name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index analytics_events_name_created_idx on public.analytics_events (name, created_at desc);

alter table public.analytics_events enable row level security;

-- INSERT allowed for everyone (guests are real users); NO select/update/delete policy,
-- so RLS denies reads to anon + authenticated. Read via service role / SQL editor only.
create policy "Anyone can insert analytics events"
  on public.analytics_events for insert to public with check (true);

grant insert on public.analytics_events to anon, authenticated;
grant usage, select on sequence public.analytics_events_id_seq to anon, authenticated;
revoke select, update, delete on public.analytics_events from anon, authenticated;

-- Funnel by day. security_invoker => the view respects the caller's RLS, so
-- anon/authenticated get nothing; service_role (SQL editor) sees everything.
create view public.daily_metrics
with (security_invoker = on) as
select
  date_trunc('day', created_at)::date as day,
  count(*) filter (where name = 'deck_viewed')            as deck_viewed,
  count(*) filter (where name = 'swipe_right')            as swipe_right,
  count(*) filter (where name = 'swipe_left')             as swipe_left,
  count(*) filter (where name = 'pet_detail_viewed')      as pet_detail_viewed,
  count(*) filter (where name = 'contact_action_tapped')  as contact_action_tapped,
  count(*) filter (where name = 'conversation_started')   as conversation_started,
  count(*) filter (where name = 'message_sent')           as message_sent,
  count(*) filter (where name = 'adoption_marked')        as adoption_marked,
  count(*) filter (where name = 'adoption_confirmed')     as adoption_confirmed,
  count(distinct session_id) as sessions,
  count(distinct user_id)    as signed_in_users
from public.analytics_events
group by 1
order by 1 desc;

revoke all on public.daily_metrics from anon, authenticated;
