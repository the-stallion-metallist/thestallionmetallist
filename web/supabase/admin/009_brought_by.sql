-- Who brought each venue in (a staff member or an owner), for the People screen. Null = not set yet.
alter table public.venues add column if not exists brought_by text;
