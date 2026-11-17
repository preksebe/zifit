-- Bucket pentru coperte: citire publica, scriere doar admin.
insert into storage.buckets (id, name, public)
values ('zifit-covers', 'zifit-covers', true)
on conflict (id) do update set public = true;

drop policy if exists zifit_covers_read on storage.objects;
create policy zifit_covers_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'zifit-covers');

drop policy if exists zifit_covers_admin_insert on storage.objects;
create policy zifit_covers_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'zifit-covers' and public.zifit_is_admin());

drop policy if exists zifit_covers_admin_update on storage.objects;
create policy zifit_covers_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'zifit-covers' and public.zifit_is_admin())
  with check (bucket_id = 'zifit-covers' and public.zifit_is_admin());

drop policy if exists zifit_covers_admin_delete on storage.objects;
create policy zifit_covers_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'zifit-covers' and public.zifit_is_admin());
