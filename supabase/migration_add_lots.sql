-- Migracija: inventory_lots (serije/lotovi robe po datumu ulaza)
create table if not exists inventory_lots (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid references inventory_items(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  qty numeric not null default 0,
  entry_date date not null default current_date,
  shelf_life_days integer,
  notes text,
  created_at timestamptz default now()
);

alter table inventory_lots enable row level security;

create policy "user_own" on inventory_lots
  for all using (auth.uid() = user_id);

-- Migracija postojećih stavki: prebaci qty u lot ako stavka ima qty > 0
-- Uncomment i pokreni nakon kreiranja tabele:
--
-- insert into inventory_lots (inventory_item_id, user_id, qty, entry_date, shelf_life_days)
-- select id, user_id, qty,
--   coalesce(entry_date, current_date),
--   shelf_life_days
-- from inventory_items
-- where qty > 0;
