-- ZiFit: tabele, functii si reguli RLS (doar obiecte cu prefix zifit_).
-- Reluabila: poate fi rulata de mai multe ori fara sa strice datele.

-- ===== Tabele =====
create table if not exists public.zifit_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'client' check (role in ('client', 'admin')),
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.zifit_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  category text not null check (category in ('sport', 'nutritie')),
  type text,
  difficulty text check (difficulty in ('usor', 'mediu', 'avansat')),
  equipment text,
  days_count integer not null default 1 check (days_count > 0),
  description text,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'RON',
  cover_url text,
  published boolean not null default false,
  is_test boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.zifit_plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.zifit_plans (id) on delete cascade,
  day_number integer not null check (day_number > 0),
  title text,
  notes text,
  unique (plan_id, day_number)
);

create table if not exists public.zifit_day_items (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.zifit_plan_days (id) on delete cascade,
  position integer not null default 0,
  kind text not null check (kind in ('exercitiu', 'masa')),
  name text not null,
  sets integer,
  reps text,
  rest_seconds integer,
  details text
);
create index if not exists zifit_day_items_day_idx on public.zifit_day_items (day_id, position);

create table if not exists public.zifit_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid not null references public.zifit_plans (id) on delete restrict,
  amount_cents integer not null check (amount_cents >= 0),
  status text not null default 'in_asteptare' check (status in ('in_asteptare', 'platita', 'esuata')),
  provider text not null default 'mock' check (provider in ('mock', 'stripe')),
  provider_ref text,
  created_at timestamptz not null default now()
);
create index if not exists zifit_orders_user_idx on public.zifit_orders (user_id);

create table if not exists public.zifit_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid not null references public.zifit_plans (id) on delete cascade,
  day_number integer not null check (day_number > 0),
  completed_at timestamptz not null default now(),
  primary key (user_id, plan_id, day_number)
);

-- ===== Functii ajutatoare (security definer, ca sa nu intre in bucla cu RLS) =====
create or replace function public.zifit_is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.zifit_profiles
    where id = auth.uid() and role = 'admin' and not blocked
  );
$$;

create or replace function public.zifit_has_plan(p_plan_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.zifit_orders
    where user_id = auth.uid() and plan_id = p_plan_id and status = 'platita'
  );
$$;

-- Poate citi ziua? Ziua 1 a unui plan publicat: oricine. Restul: cine a cumparat planul sau adminul.
create or replace function public.zifit_can_read_day(p_day_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.zifit_plan_days d
    join public.zifit_plans p on p.id = d.plan_id
    where d.id = p_day_id
      and (
        public.zifit_is_admin()
        or (p.published and d.day_number = 1)
        or public.zifit_has_plan(p.id)
      )
  );
$$;

revoke all on function public.zifit_is_admin() from public;
revoke all on function public.zifit_has_plan(uuid) from public;
revoke all on function public.zifit_can_read_day(uuid) from public;
grant execute on function public.zifit_is_admin() to anon, authenticated, service_role;
grant execute on function public.zifit_has_plan(uuid) to anon, authenticated, service_role;
grant execute on function public.zifit_can_read_day(uuid) to anon, authenticated, service_role;

-- ===== Trigger: profil automat la inregistrare (mereu client) =====
create or replace function public.zifit_handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.zifit_profiles (id, email, role)
  values (new.id, new.email, 'client')
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.zifit_handle_new_user() from public;

drop trigger if exists zifit_on_auth_user_created on auth.users;
create trigger zifit_on_auth_user_created
  after insert on auth.users
  for each row execute function public.zifit_handle_new_user();

-- ===== Drepturi pe tabele (RLS le restrange si mai mult) =====
revoke all on public.zifit_profiles, public.zifit_plans, public.zifit_plan_days,
  public.zifit_day_items, public.zifit_orders, public.zifit_progress from anon, authenticated;

grant select on public.zifit_plans, public.zifit_plan_days, public.zifit_day_items to anon, authenticated;
grant insert, update, delete on public.zifit_plans, public.zifit_plan_days, public.zifit_day_items to authenticated;
grant select, update on public.zifit_profiles to authenticated;
grant select on public.zifit_orders to authenticated;
grant select, insert, update, delete on public.zifit_progress to authenticated;

-- ===== RLS =====
alter table public.zifit_profiles enable row level security;
alter table public.zifit_plans enable row level security;
alter table public.zifit_plan_days enable row level security;
alter table public.zifit_day_items enable row level security;
alter table public.zifit_orders enable row level security;
alter table public.zifit_progress enable row level security;

-- Profiluri: fiecare isi vede profilul; adminul le vede si le modifica pe toate.
-- Un user obisnuit nu are nicio politica de update, deci nu-si poate schimba rolul.
drop policy if exists zifit_profiles_select on public.zifit_profiles;
create policy zifit_profiles_select on public.zifit_profiles
  for select to authenticated
  using (id = auth.uid() or public.zifit_is_admin());

drop policy if exists zifit_profiles_admin_update on public.zifit_profiles;
create policy zifit_profiles_admin_update on public.zifit_profiles
  for update to authenticated
  using (public.zifit_is_admin())
  with check (public.zifit_is_admin());

-- Planuri: publicate = oricine; adminul vede tot si scrie.
drop policy if exists zifit_plans_select on public.zifit_plans;
create policy zifit_plans_select on public.zifit_plans
  for select to anon, authenticated
  using (published or public.zifit_is_admin());

drop policy if exists zifit_plans_admin_write on public.zifit_plans;
create policy zifit_plans_admin_write on public.zifit_plans
  for all to authenticated
  using (public.zifit_is_admin())
  with check (public.zifit_is_admin());

-- Zile si elemente: ziua 1 publica (previzualizare), restul doar cumparatorii si adminul.
drop policy if exists zifit_days_select on public.zifit_plan_days;
create policy zifit_days_select on public.zifit_plan_days
  for select to anon, authenticated
  using (public.zifit_can_read_day(id));

drop policy if exists zifit_days_admin_write on public.zifit_plan_days;
create policy zifit_days_admin_write on public.zifit_plan_days
  for all to authenticated
  using (public.zifit_is_admin())
  with check (public.zifit_is_admin());

drop policy if exists zifit_items_select on public.zifit_day_items;
create policy zifit_items_select on public.zifit_day_items
  for select to anon, authenticated
  using (public.zifit_can_read_day(day_id));

drop policy if exists zifit_items_admin_write on public.zifit_day_items;
create policy zifit_items_admin_write on public.zifit_day_items
  for all to authenticated
  using (public.zifit_is_admin())
  with check (public.zifit_is_admin());

-- Comenzi: clientul le vede pe ale lui, adminul pe toate. Nicio politica de scriere:
-- comenzile si statusul "platita" le scrie doar serverul (service role).
drop policy if exists zifit_orders_select on public.zifit_orders;
create policy zifit_orders_select on public.zifit_orders
  for select to authenticated
  using (user_id = auth.uid() or public.zifit_is_admin());

-- Progres: fiecare doar pe al lui, si doar pentru planuri cumparate.
drop policy if exists zifit_progress_select on public.zifit_progress;
create policy zifit_progress_select on public.zifit_progress
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists zifit_progress_insert on public.zifit_progress;
create policy zifit_progress_insert on public.zifit_progress
  for insert to authenticated
  with check (user_id = auth.uid() and public.zifit_has_plan(plan_id));

drop policy if exists zifit_progress_update on public.zifit_progress;
create policy zifit_progress_update on public.zifit_progress
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.zifit_has_plan(plan_id));

drop policy if exists zifit_progress_delete on public.zifit_progress;
create policy zifit_progress_delete on public.zifit_progress
  for delete to authenticated
  using (user_id = auth.uid());
