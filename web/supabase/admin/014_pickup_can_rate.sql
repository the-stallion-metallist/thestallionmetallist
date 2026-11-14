-- Each pickup keeps the payout per can it was paid at, so changing a venue's rate (or the default) later
-- never rewrites past payouts: October stays at its rate, a new rate starts with the pickups it applies to.
-- Same idea as 012 for plastic. Past pickups get the rate their venue has today (the rates are changed AFTER this runs).
alter table public.pickups add column if not exists can_rate numeric;

-- fill past pickups without marking them as edited
alter table public.pickups disable trigger pickups_stamp;
update public.pickups p
   set can_rate = v.can_rate
  from public.venues v
 where v.id = p.venue_id and p.can_rate is null;
alter table public.pickups enable trigger pickups_stamp;

-- new pickups take the venue's rate when they are logged; a pickup moved to another venue takes that venue's rate.
-- (Household pickups from the app have no venue: they keep the payout the app paid.)
create or replace function public.pickup_can_rate() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' and new.venue_id is distinct from old.venue_id then new.can_rate := null; end if;
  if new.can_rate is null and new.venue_id is not null then
    new.can_rate := (select can_rate from public.venues where id = new.venue_id);
  end if;
  return new;
end $$;
drop trigger if exists pickup_can_rate on public.pickups;
create trigger pickup_can_rate before insert or update on public.pickups for each row execute function public.pickup_can_rate();
