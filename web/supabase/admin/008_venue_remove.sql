-- A venue can be removed from the panel. Its row stays (so its past pickups and payments keep their name and still count),
-- it just drops out of lists, routes and bin plans. Restorable from the venue's page or Change history.
alter table public.venues add column if not exists deleted boolean not null default false;
