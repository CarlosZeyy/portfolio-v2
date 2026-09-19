-- Mensagens do formulário de contato (src/app/(public)/actions.ts -> sendEmail).
-- Rode no SQL Editor do Supabase.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) <= 160),
  message text not null check (char_length(message) between 10 and 2000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- O site grava com a anon key, então QUALQUER visitante pode inserir — e só
-- isso. Não existe policy de select/update/delete para anon: ninguém de fora
-- consegue ler as mensagens dos outros. Você lê pelo dashboard (service role)
-- ou logado no /admin/messages (policy de SELECT abaixo).
create policy "anon pode enviar mensagem"
  on public.messages for insert
  to anon, authenticated
  with check (true);

-- ATENÇÃO: "to authenticated using (true)" NÃO é "só o admin". O /login aceita
-- qualquer conta Google/GitHub, então "authenticated" é qualquer pessoa da
-- internet que fizer login — e ela leria nome, e-mail e mensagem de todos os
-- visitantes direto pela API REST, sem nem abrir o /admin. A leitura é presa
-- ao SEU e-mail (troque abaixo pelo e-mail da conta com que você loga):
drop policy if exists "admin le mensagens" on public.messages;

create policy "admin le mensagens"
  on public.messages for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'carlosmoisesdev@gmail.com');

-- Marcar como lida e deletar (Inbox do /admin/messages). Sem estas policies o
-- Postgres não devolve erro: o UPDATE/DELETE simplesmente afeta 0 linhas.
drop policy if exists "admin atualiza mensagens" on public.messages;
create policy "admin atualiza mensagens"
  on public.messages for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'carlosmoisesdev@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'carlosmoisesdev@gmail.com');

drop policy if exists "admin deleta mensagens" on public.messages;
create policy "admin deleta mensagens"
  on public.messages for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'carlosmoisesdev@gmail.com');

-- Banco que JÁ existe: use supabase/lote5.sql (ALTER TABLE idempotente).
