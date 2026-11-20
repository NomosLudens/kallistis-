-- Tabela de personagens criados pelos jogadores via IA
create table public.created_characters (
  id uuid primary key default gen_random_uuid(),
  created_by_email text,
  name text not null default 'Novo Personagem',
  target_level integer not null default 1,
  status text not null default 'in_progress',
  draft_data jsonb not null default '{}'::jsonb,
  published_summary jsonb,
  published_sheet jsonb,
  published_quickref jsonb,
  published_character_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  approved_at timestamptz,
  approved_by_email text
);
create index created_characters_status_updated_idx on public.created_characters (status, updated_at desc);
alter table public.created_characters enable row level security;
create policy "Public read created_characters" on public.created_characters for select using (true);
create policy "Public insert created_characters" on public.created_characters for insert with check (true);
create policy "Public update created_characters" on public.created_characters for update using (true);
create policy "Public delete created_characters" on public.created_characters for delete using (true);

-- Histórico de mensagens de chat para criação de personagens
create table public.character_creation_messages (
  id uuid primary key default gen_random_uuid(),
  creation_id uuid not null references public.created_characters(id) on delete cascade,
  role text not null,
  content text not null,
  step text,
  created_at timestamptz not null default now()
);
create index character_creation_messages_creation_idx on public.character_creation_messages (creation_id, created_at);
alter table public.character_creation_messages enable row level security;
create policy "Public all character_creation_messages" on public.character_creation_messages for all using (true) with check (true);

-- Trigger para atualizar updated_at em created_characters
create or replace function public.update_created_characters_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger created_characters_updated_at
before update on public.created_characters
for each row
execute function public.update_created_characters_updated_at();