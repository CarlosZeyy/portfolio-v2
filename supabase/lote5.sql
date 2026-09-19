-- Lote 5 — migração para um banco que JÁ existe. Rode no SQL Editor do Supabase.
-- É idempotente: pode rodar de novo sem erro nem efeito colateral.

-- 1) Projetos bilíngues --------------------------------------------------------
-- Colunas de texto em inglês. Todas NULLABLE de propósito: null = "sem
-- tradução", e o site mostra o português no lugar (src/lib/projectLocale.ts).
alter table public.projects
  add column if not exists title_en text,
  add column if not exists description_en text,
  add column if not exists problem_description_en text,
  add column if not exists solution_description_en text,
  add column if not exists technical_challenges_en text;

-- 2) Inbox: lida / não lida ----------------------------------------------------
-- NOT NULL + default false: as mensagens que já existem entram como não lidas.
alter table public.messages
  add column if not exists is_read boolean not null default false;

-- A Inbox lista "não lidas primeiro, mais recentes no topo".
create index if not exists messages_inbox_idx
  on public.messages (is_read, created_at desc);

-- 3) RLS para marcar como lida e deletar -----------------------------------------
-- Até aqui a tabela só tinha policy de INSERT (visitantes) e SELECT (você).
-- Sem policy de UPDATE/DELETE o Postgres NÃO devolve erro: ele simplesmente
-- afeta 0 linhas — os botões da Inbox "funcionariam" sem fazer nada.
-- Mesma regra da leitura: só a SUA conta. "authenticated" sozinho seria
-- qualquer pessoa com login Google/GitHub.
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

-- 4) Conferência (opcional) ------------------------------------------------------
-- Deve listar as 4 policies de messages: insert, select, update, delete.
-- select policyname, cmd, roles from pg_policies where tablename = 'messages';
--
-- E vale conferir a tabela PROJECTS: se ela permitir insert/update/delete para
-- "authenticated" com using (true), qualquer conta logada edita seus projetos
-- direto pela API. O ideal é a mesma condição de e-mail usada acima.
-- select policyname, cmd, roles, qual from pg_policies where tablename = 'projects';
