-- "by" is an SQL keyword and breaks the history trigger; the column is called "who" instead.
alter table public.change_log rename column by to who;

create or replace function public.stamp_log() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.at := now();
  new.who := coalesce(public.me(), new.who, 'System');
  return new;
end $$;
