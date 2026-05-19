ALTER TABLE inventory_lots
  ADD COLUMN IF NOT EXISTS lot_subtype text;
