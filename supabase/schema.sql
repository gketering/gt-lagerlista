-- ============================================
-- TABELA: categories (kategorije artikala)
-- ============================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamptz default now()
);

alter table categories enable row level security;
create policy "user_own" on categories
  for all using (auth.uid() = user_id);

-- ============================================
-- TABELA: inventory_items (lager)
-- ============================================
create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  category_id uuid references categories(id) on delete set null,
  supplier text,
  qty numeric not null default 0,
  unit text not null default 'kg', -- kg, g, l, ml, kom, pak
  min_qty numeric not null default 0,
  price_per_unit numeric,          -- cijena u KM
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table inventory_items enable row level security;
create policy "user_own" on inventory_items
  for all using (auth.uid() = user_id);

-- ============================================
-- TABELA: recipes (jela / normativi)
-- ============================================
create table recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  category text,                   -- npr. "Topla jela", "Salate"...
  portions_default numeric not null default 10,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table recipes enable row level security;
create policy "user_own" on recipes
  for all using (auth.uid() = user_id);

-- ============================================
-- TABELA: recipe_ingredients (normativ)
-- ============================================
create table recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade not null,
  inventory_item_id uuid references inventory_items(id) on delete set null,
  free_name text,                  -- ako nije vezan za lager
  qty_per_portion numeric not null,
  unit text not null default 'kg',
  created_at timestamptz default now()
);

alter table recipe_ingredients enable row level security;
create policy "user_own" on recipe_ingredients
  for all using (
    exists (
      select 1 from recipes r
      where r.id = recipe_id and r.user_id = auth.uid()
    )
  );

-- ============================================
-- TABELA: events (ketering eventi)
-- ============================================
create table events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  event_date date not null,
  guest_count integer,
  location text,
  notes text,
  cooked boolean not null default false,
  cooked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table events enable row level security;
create policy "user_own" on events
  for all using (auth.uid() = user_id);

-- ============================================
-- TABELA: event_dishes (jela na eventu)
-- ============================================
create table event_dishes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  recipe_id uuid references recipes(id) on delete set null,
  portions integer not null default 10,
  created_at timestamptz default now()
);

alter table event_dishes enable row level security;
create policy "user_own" on event_dishes
  for all using (
    exists (
      select 1 from events e
      where e.id = event_id and e.user_id = auth.uid()
    )
  );

-- ============================================
-- TABELA: production_log (istorija kuhanja)
-- ============================================
create table production_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  recipe_id uuid references recipes(id) on delete set null,
  recipe_name text not null,       -- snapshot naziva
  portions numeric not null,
  event_id uuid references events(id) on delete set null,
  event_name text,                 -- snapshot naziva eventa
  notes text,
  cooked_at timestamptz default now(),
  inventory_changes jsonb          -- JSON snapshot oduzimanja (za undo)
);

alter table production_log enable row level security;
create policy "user_own" on production_log
  for all using (auth.uid() = user_id);

-- ============================================
-- TRIGGER: auto-update updated_at
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_inventory_updated_at
  before update on inventory_items
  for each row execute function update_updated_at();

create trigger trg_recipes_updated_at
  before update on recipes
  for each row execute function update_updated_at();

create trigger trg_events_updated_at
  before update on events
  for each row execute function update_updated_at();
