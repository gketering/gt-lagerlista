alter table inventory_lots
  add column if not exists supplier text,
  add column if not exists price_per_unit numeric;
