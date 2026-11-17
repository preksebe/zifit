-- Mesaje din formularul de contact.
-- Insert doar prin server (service role). Citire, actualizare si stergere doar admin.

create table if not exists public.zifit_mesaje (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200),
  message text not null check (char_length(message) between 1 and 2000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

revoke all on public.zifit_mesaje from anon, authenticated;
grant select, update, delete on public.zifit_mesaje to authenticated;

alter table public.zifit_mesaje enable row level security;

drop policy if exists zifit_mesaje_admin_select on public.zifit_mesaje;
create policy zifit_mesaje_admin_select on public.zifit_mesaje
  for select to authenticated
  using (public.zifit_is_admin());

drop policy if exists zifit_mesaje_admin_update on public.zifit_mesaje;
create policy zifit_mesaje_admin_update on public.zifit_mesaje
  for update to authenticated
  using (public.zifit_is_admin())
  with check (public.zifit_is_admin());

drop policy if exists zifit_mesaje_admin_delete on public.zifit_mesaje;
create policy zifit_mesaje_admin_delete on public.zifit_mesaje
  for delete to authenticated
  using (public.zifit_is_admin());
