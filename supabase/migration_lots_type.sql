-- Adds lot_type ('in' / 'out') and source_note to inventory_lots.
-- Existing rows are treated as 'in' lots (the default).

ALTER TABLE inventory_lots
  ADD COLUMN IF NOT EXISTS lot_type    text NOT NULL DEFAULT 'in'
    CHECK (lot_type IN ('in', 'out')),
  ADD COLUMN IF NOT EXISTS source_note text;
