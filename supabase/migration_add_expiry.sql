-- Migracija: dodaj datum ulaza i rok trajanja na inventory_items
alter table inventory_items
  add column if not exists entry_date date,
  add column if not exists shelf_life_days integer;
