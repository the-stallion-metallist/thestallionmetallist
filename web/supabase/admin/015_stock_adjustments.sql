-- Plastic taken off (or added to) the godown without a sale or a pickup, e.g. water weight that was counted when weighing.
-- kg is signed: negative = removed from the godown. Collected kg and venue payouts are not changed by these rows.
create table public.stock_adjustments (
  id bigint generated always as identity primary key,
  d date not null,
  kg numeric(10,2) not null check (kg <> 0),
  note text not null default '',
  deleted boolean not null default false,
  created_at timestamptz not null default now(), created_by text not null default 'System',
  updated_at timestamptz, updated_by text
);
create trigger stock_adjustments_stamp before insert or update on public.stock_adjustments for each row execute function public.stamp_row();
alter table public.stock_adjustments enable row level security;
revoke all on public.stock_adjustments from anon;
create policy stock_adjustments_read on public.stock_adjustments for select to authenticated using (public.is_team());
create policy stock_adjustments_add on public.stock_adjustments for insert to authenticated with check (public.is_team());
create policy stock_adjustments_edit on public.stock_adjustments for update to authenticated using (public.is_team()) with check (public.is_team());
grant select, insert, update on public.stock_adjustments to authenticated;
