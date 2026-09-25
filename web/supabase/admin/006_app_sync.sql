-- One-way copy of household pickups from the customer app (a separate Supabase project).
-- Each copied pickup remembers the app's id so it is never copied twice, and the payout the app paid.
alter table public.pickups add column app_id uuid unique;
alter table public.pickups add column app_payout numeric(10,2);
insert into public.plan_state (key, value) values ('appSync', '{"at": null, "count": 0}');
