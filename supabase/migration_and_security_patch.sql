-- =============================================================================
-- migration_and_security_patch.sql
-- Script ÚNICO e idempotente para `projects` e `messages`: estrutura + RLS.
-- Substitui messages.sql e lote5.sql. Pode ser executado quantas vezes quiser.
-- Cole inteiro no SQL Editor do Supabase e rode.
-- =============================================================================

-- Tudo ou nada: se qualquer passo falhar, nada é aplicado. Sem a transação, um
-- erro entre o DROP e o CREATE deixaria as tabelas com RLS ligado e NENHUMA
-- policy — o site inteiro pararia de ler os projetos.
begin;

-- -----------------------------------------------------------------------------
-- 1. ESTRUTURA
-- -----------------------------------------------------------------------------

-- Banco novo: cria a tabela. Banco existente: não faz nada.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) <= 160),
  message text not null check (char_length(message) between 10 and 2000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- NOT NULL + DEFAULT: as mensagens que já existem entram como não lidas.
alter table public.messages
  add column if not exists is_read boolean not null default false;

-- Textos em inglês. NULL = "sem tradução" (o site mostra o português no lugar).
alter table public.projects
  add column if not exists title_en text,
  add column if not exists description_en text,
  add column if not exists problem_description_en text,
  add column if not exists solution_description_en text,
  add column if not exists technical_challenges_en text,
  -- Gravação vertical (9:16) para o seletor Desktop / Mobile do case study.
  add column if not exists video_mobile_url text;

-- A Inbox lista "não lidas primeiro, mais recentes no topo".
create index if not exists messages_inbox_idx
  on public.messages (is_read, created_at desc);

-- -----------------------------------------------------------------------------
-- 2. LIMPEZA DE POLICIES
-- -----------------------------------------------------------------------------

-- Remove TODAS as policies das duas tabelas, seja qual for o nome. É isto que
-- mata o erro 42710 de vez: um DROP POLICY IF EXISTS por nome só alcança os
-- nomes que eu conheço, e as policies de `projects` foram criadas pelo
-- dashboard (nomes que não estão em nenhum arquivo do repositório). Se sobrasse
-- uma permissiva antiga, ela continuaria valendo — policies se somam com OR.
do $$
declare
  existing record;
begin
  for existing in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('messages', 'projects')
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      existing.policyname,
      existing.tablename
    );
  end loop;
end
$$;

-- -----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

-- Sem isto as policies abaixo são decorativas: com RLS desligado, qualquer
-- role com GRANT na tabela lê e escreve tudo. (Idempotente.)
alter table public.messages enable row level security;
alter table public.projects enable row level security;

-- "authenticated" NÃO significa "admin": o /login aceita qualquer conta Google
-- ou GitHub. Por isso toda regra de escrita compara o e-mail do token.
-- O (select ...) em volta faz o Postgres avaliar o JWT uma vez por consulta,
-- e não uma vez por linha.

-- ---- messages ----------------------------------------------------------------

-- Qualquer visitante envia mensagem. `authenticated` entra junto para o
-- formulário não quebrar quando VOCÊ o testa logado no /admin.
-- with check (is_read = false): ninguém insere uma mensagem já "lida", que
-- nasceria escondida do filtro de não lidas.
create policy "messages: visitante envia"
  on public.messages for insert
  to anon, authenticated
  with check (is_read = false);

create policy "messages: admin le"
  on public.messages for select
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'carlosmoisesdev@gmail.com');

create policy "messages: admin atualiza"
  on public.messages for update
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'carlosmoisesdev@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'carlosmoisesdev@gmail.com');

create policy "messages: admin deleta"
  on public.messages for delete
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'carlosmoisesdev@gmail.com');

-- ---- projects ----------------------------------------------------------------

-- O portfólio é público: todo mundo lê.
create policy "projects: todos leem"
  on public.projects for select
  to anon, authenticated
  using (true);

create policy "projects: admin insere"
  on public.projects for insert
  to authenticated
  with check ((select auth.jwt() ->> 'email') = 'carlosmoisesdev@gmail.com');

create policy "projects: admin atualiza"
  on public.projects for update
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'carlosmoisesdev@gmail.com')
  with check ((select auth.jwt() ->> 'email') = 'carlosmoisesdev@gmail.com');

create policy "projects: admin deleta"
  on public.projects for delete
  to authenticated
  using ((select auth.jwt() ->> 'email') = 'carlosmoisesdev@gmail.com');

commit;

-- -----------------------------------------------------------------------------
-- 4. CONFERÊNCIA — o resultado que o SQL Editor mostra ao final.
--    Esperado: exatamente 8 linhas (4 de messages, 4 de projects).
-- -----------------------------------------------------------------------------
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in ('messages', 'projects')
order by tablename, cmd;
