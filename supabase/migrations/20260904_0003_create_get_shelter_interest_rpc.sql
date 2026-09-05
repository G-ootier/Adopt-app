-- Phase 1: per-animal interest for the calling shelter. Aggregated server-side so
-- individual crushers stay anonymous and raw swipe rows never reach the client.
-- Applied to project gvquhciebjaasmshdjxn on 2026-09-04.
-- Rollback: drop function public.get_shelter_interest(); drop index swipes_pet_dir_created_idx;

create index if not exists swipes_pet_dir_created_idx
  on public.swipes (pet_id, direction, created_at desc);

create or replace function public.get_shelter_interest()
returns table (
  pet_id uuid,
  name text,
  status text,
  photos text[],
  crush_total bigint,
  crush_7d bigint,
  days_listed int
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.name,
    p.status::text,
    p.photos,
    count(s.id) filter (where s.direction = 'right') as crush_total,
    count(s.id) filter (where s.direction = 'right'
                          and s.created_at > now() - interval '7 days') as crush_7d,
    greatest(0, extract(day from now() - p.created_at))::int as days_listed
  from public.pets p
  left join public.swipes s on s.pet_id = p.id
  where p.shelter_id = auth.uid()
  group by p.id, p.name, p.status, p.photos, p.created_at
  order by crush_7d desc, crush_total desc, p.created_at desc;
$$;

revoke all on function public.get_shelter_interest() from anon;
grant execute on function public.get_shelter_interest() to authenticated;
