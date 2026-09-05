-- Phase 1: two-sided, forgiving adoption record. Every field optional.
-- conversation_id is nullable now; its FK to conversations is added in Phase 2.
-- Applied to project gvquhciebjaasmshdjxn on 2026-09-04.
-- Rollback: drop table public.adoptions;

create table public.adoptions (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  shelter_id uuid not null references public.shelters(id) on delete cascade,
  adopter_id uuid references public.profiles(id) on delete set null,
  conversation_id uuid,
  source_confirmed_by_shelter text check (source_confirmed_by_shelter in ('yes','no','unsure')),
  source_confirmed_by_adopter text check (source_confirmed_by_adopter in ('yes','no','undecided')),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create index adoptions_shelter_idx on public.adoptions (shelter_id);
create index adoptions_pet_idx on public.adoptions (pet_id);
create index adoptions_adopter_idx on public.adoptions (adopter_id);

alter table public.adoptions enable row level security;

create policy "Shelter can insert adoptions for own pets"
  on public.adoptions for insert to public
  with check (
    auth.uid() = shelter_id
    and exists (select 1 from public.pets p where p.id = pet_id and p.shelter_id = auth.uid())
  );

create policy "Shelter can read own adoptions"
  on public.adoptions for select to public
  using (auth.uid() = shelter_id);

create policy "Shelter can update own adoptions"
  on public.adoptions for update to public
  using (auth.uid() = shelter_id)
  with check (auth.uid() = shelter_id);

create policy "Adopter can read own adoptions"
  on public.adoptions for select to public
  using (auth.uid() = adopter_id);
