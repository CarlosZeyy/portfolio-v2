-- Mensagens do formulário de contato (src/app/(public)/actions.ts -> sendEmail).
-- Rode no SQL Editor do Supabase.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) <= 160),
  message text not null check (char_length(message) between 10 and 2000),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- O site grava com a anon key, então QUALQUER visitante pode inserir — e só
-- isso. Não existe policy de select/update/delete para anon: ninguém de fora
-- consegue ler as mensagens dos outros. Você lê pelo dashboard (service role)
-- ou logado no /admin (policy abaixo).
create policy "anon pode enviar mensagem"
  on public.messages for insert
  to anon, authenticated
  with check (true);

create policy "admin le mensagens"
  on public.messages for select
  to authenticated
  using (true);
