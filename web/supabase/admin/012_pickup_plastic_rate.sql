-- Each pickup keeps the plastic rate (₹ per kg) the venue was paid at, so changing a venue's rate later
-- doesn't rewrite past payouts. Past pickups get the rate their venue has today (or the Settings default).
alter table public.pickups add column if not exists plastic_rate numeric;

-- fill past pickups without marking them as edited
alter table public.pickups disable trigger pickups_stamp;
update public.pickups p
   set plastic_rate = coalesce(nullif(v.plastic_rate, 0), (select (data->>'plasticBuy')::numeric from public.settings where id = 1))
  from public.venues v
 where v.id = p.venue_id and coalesce(p.plastic_kg, 0) > 0 and p.plastic_rate is null;
update public.pickups
   set plastic_rate = (select (data->>'plasticBuy')::numeric from public.settings where id = 1)
 where venue_id is null and coalesce(plastic_kg, 0) > 0 and plastic_rate is null;
alter table public.pickups enable trigger pickups_stamp;

-- new pickups (and pickups that get plastic added later) take the venue's rate, else the Settings default
create or replace function public.pickup_plastic_rate() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.plastic_rate is null and coalesce(new.plastic_kg, 0) > 0 then
    new.plastic_rate := coalesce((select nullif(plastic_rate, 0) from public.venues where id = new.venue_id),
                                 (select (data->>'plasticBuy')::numeric from public.settings where id = 1));
  end if;
  return new;
end $$;
drop trigger if exists pickup_plastic_rate on public.pickups;
create trigger pickup_plastic_rate before insert or update on public.pickups for each row execute function public.pickup_plastic_rate();
