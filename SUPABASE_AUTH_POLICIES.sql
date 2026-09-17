-- ===================================================================
-- Offer Intelligence — RLS após a implementação do login
-- ===================================================================
--
-- CONTEXTO
-- As políticas atuais (SUPABASE_POLICIES.sql) liberam SELECT, INSERT,
-- UPDATE e DELETE para o papel `anon`, ou seja: qualquer pessoa com a
-- chave pública do projeto consegue ler e alterar os dados, mesmo sem
-- estar logada. Com o login implementado, isso deixa de fazer sentido.
--
-- O QUE ESTE SCRIPT FAZ
-- Troca o papel das políticas de `anon` para `authenticated`,
-- mantendo exatamente as mesmas operações permitidas. Nenhuma tabela,
-- coluna, dado ou relacionamento é alterado. O RLS continua ativo.
--
-- ⚠️ EXECUTE SOMENTE DEPOIS DE:
--   1. Criar o usuário no Supabase Auth (ver instruções na entrega);
--   2. Confirmar que o login está funcionando na aplicação.
--
-- Se você rodar isto ANTES de conseguir logar, a aplicação vai parar
-- de carregar as ofertas (a tela mostrará "Não foi possível carregar
-- as ofertas"), porque as requisições ainda estarão saindo como
-- `anon`. Para reverter, basta rodar novamente o SUPABASE_POLICIES.sql
-- original.
--
-- Script idempotente: pode ser executado mais de uma vez.
-- ===================================================================

-- RLS permanece ativo (idempotente).
alter table public.offers enable row level security;
alter table public.offer_monitoring enable row level security;

-- -------------------------------------------------------------------
-- Remove o acesso anônimo (o objetivo desta etapa)
-- -------------------------------------------------------------------
drop policy if exists "offers_select_anon" on public.offers;
drop policy if exists "offers_insert_anon" on public.offers;
drop policy if exists "offers_update_anon" on public.offers;
drop policy if exists "offers_delete_anon" on public.offers;

drop policy if exists "offer_monitoring_select_anon" on public.offer_monitoring;
drop policy if exists "offer_monitoring_insert_anon" on public.offer_monitoring;
drop policy if exists "offer_monitoring_delete_anon" on public.offer_monitoring;

-- -------------------------------------------------------------------
-- Tabela: offers — agora somente para usuários autenticados
-- -------------------------------------------------------------------
drop policy if exists "offers_select_authenticated" on public.offers;
create policy "offers_select_authenticated"
  on public.offers
  for select
  to authenticated
  using (true);

drop policy if exists "offers_insert_authenticated" on public.offers;
create policy "offers_insert_authenticated"
  on public.offers
  for insert
  to authenticated
  with check (true);

drop policy if exists "offers_update_authenticated" on public.offers;
create policy "offers_update_authenticated"
  on public.offers
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "offers_delete_authenticated" on public.offers;
create policy "offers_delete_authenticated"
  on public.offers
  for delete
  to authenticated
  using (true);

-- -------------------------------------------------------------------
-- Tabela: offer_monitoring — agora somente para usuários autenticados
-- -------------------------------------------------------------------
drop policy if exists "offer_monitoring_select_authenticated" on public.offer_monitoring;
create policy "offer_monitoring_select_authenticated"
  on public.offer_monitoring
  for select
  to authenticated
  using (true);

drop policy if exists "offer_monitoring_insert_authenticated" on public.offer_monitoring;
create policy "offer_monitoring_insert_authenticated"
  on public.offer_monitoring
  for insert
  to authenticated
  with check (true);

-- Necessária para que o ON DELETE CASCADE consiga remover o histórico
-- quando uma oferta é excluída (o cascade também respeita RLS).
drop policy if exists "offer_monitoring_delete_authenticated" on public.offer_monitoring;
create policy "offer_monitoring_delete_authenticated"
  on public.offer_monitoring
  for delete
  to authenticated
  using (true);

-- -------------------------------------------------------------------
-- Conferência: lista as políticas ativas nas duas tabelas.
-- O resultado esperado é apenas políticas com roles = {authenticated}.
-- -------------------------------------------------------------------
-- select tablename, policyname, roles, cmd
-- from pg_policies
-- where schemaname = 'public'
--   and tablename in ('offers', 'offer_monitoring')
-- order by tablename, policyname;
