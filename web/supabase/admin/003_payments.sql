-- Venue payments. Venues are paid on the spot at each pickup, so this is recorded from day one;
-- the Venue payouts screen that reads it comes in a later stage.
create table public.payments (
  id         bigint generated always as identity primary key,
  d          date not null,
  venue_id   bigint not null references public.venues(id),
  amount     numeric(10,2) not null check (amount > 0),
  mode       text not null default 'Cash' check (mode in ('Cash','UPI','Bank')),
  note       text not null default '',
  pickup_id  bigint references public.pickups(id),
  deleted    boolean not null default false,
  created_at timestamptz not null default now(),
  created_by text not null default 'System',
  updated_at timestamptz,
  updated_by text
);
create index payments_venue_idx on public.payments (venue_id);
create trigger payments_stamp before insert or update on public.payments for each row execute function public.stamp_row();

alter table public.payments enable row level security;
revoke all on public.payments from anon;
grant select, insert, update on public.payments to authenticated;
create policy payments_read on public.payments for select to authenticated using (public.is_team());
create policy payments_add  on public.payments for insert to authenticated with check (public.is_team());
create policy payments_edit on public.payments for update to authenticated using (public.is_team()) with check (public.is_team());

-- the day the panel goes live: pickups before it are covered by each venue's opening balance
update public.settings set data = data || '{"goLive": null}';
