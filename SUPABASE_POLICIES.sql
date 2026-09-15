-- ===================================================================
-- Offer Intelligence — Políticas de RLS necessárias no Supabase
-- ===================================================================
--
-- O app usa a chave pública (anon) através de src/lib/supabaseClient.js
-- para: carregar ofertas, cadastrar ofertas + primeiro registro de
-- monitoramento, adicionar novos registros de monitoramento e excluir
-- ofertas (com cascade para offer_monitoring).
--
-- Este script é seguro para rodar mais de uma vez: cada policy é
-- recriada com DROP POLICY IF EXISTS + CREATE POLICY.
--
-- Rode isto no SQL Editor do Supabase. Não altera nenhuma credencial.
-- ===================================================================

-- Garante que RLS está ativo nas duas tabelas (idempotente).
alter table public.offers enable row level security;
alter table public.offer_monitoring enable row level security;

-- -------------------------------------------------------------------
-- Tabela: offers
-- -------------------------------------------------------------------

-- Leitura: necessária para carregar a lista de ofertas ao abrir o app.
drop policy if exists "offers_select_anon" on public.offers;
create policy "offers_select_anon"
  on public.offers
  for select
  to anon
  using (true);

-- Inserção: necessária para o cadastro de nova oferta.
drop policy if exists "offers_insert_anon" on public.offers;
create policy "offers_insert_anon"
  on public.offers
  for insert
  to anon
  with check (true);

-- Atualização: não é usada por nenhuma tela hoje, mas deixamos criada
-- para não travar uma futura edição de oferta.
drop policy if exists "offers_update_anon" on public.offers;
create policy "offers_update_anon"
  on public.offers
  for update
  to anon
  using (true)
  with check (true);

-- Exclusão: o enunciado indica que esta policy já existe no projeto.
-- Deixamos aqui apenas como referência/backup — descomente se precisar
-- recriá-la.
-- drop policy if exists "offers_delete_anon" on public.offers;
-- create policy "offers_delete_anon"
--   on public.offers
--   for delete
--   to anon
--   using (true);

-- -------------------------------------------------------------------
-- Tabela: offer_monitoring
-- -------------------------------------------------------------------

-- Leitura: necessária para montar o histórico de cada oferta.
drop policy if exists "offer_monitoring_select_anon" on public.offer_monitoring;
create policy "offer_monitoring_select_anon"
  on public.offer_monitoring
  for select
  to anon
  using (true);

-- Inserção: necessária tanto para o primeiro registro criado junto
-- com a oferta quanto para o botão "+ Registrar atualização".
drop policy if exists "offer_monitoring_insert_anon" on public.offer_monitoring;
create policy "offer_monitoring_insert_anon"
  on public.offer_monitoring
  for insert
  to anon
  with check (true);

-- Exclusão: precisa existir para que o ON DELETE CASCADE consiga
-- remover os registros de offer_monitoring quando uma oferta é
-- excluída em offers (o cascade ainda respeita RLS).
drop policy if exists "offer_monitoring_delete_anon" on public.offer_monitoring;
create policy "offer_monitoring_delete_anon"
  on public.offer_monitoring
  for delete
  to anon
  using (true);
