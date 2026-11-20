create table public.character_overrides (
  id uuid primary key default gen_random_uuid(),
  character_id text not null,
  request_id uuid references public.level_up_requests(id) on delete set null,
  summary_patch jsonb not null default '{}'::jsonb,
  sheet_patch jsonb not null default '{}'::jsonb,
  applied_at timestamptz not null default now(),
  applied_by_email text
);

create index idx_character_overrides_character on public.character_overrides (character_id, applied_at desc);
create index idx_character_overrides_request on public.character_overrides (request_id);

alter table public.character_overrides enable row level security;

create policy "Public read character_overrides"
  on public.character_overrides for select using (true);

create policy "Public insert character_overrides"
  on public.character_overrides for insert with check (true);

create policy "Public delete character_overrides"
  on public.character_overrides for delete using (true);