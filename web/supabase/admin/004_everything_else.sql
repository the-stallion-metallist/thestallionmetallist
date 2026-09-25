-- Stallion team panel · the rest of the approved mockup: trips, sales, expenses, staff, attendance,
-- advances, bin moves, spare bins, the route in progress, route zones and road data. Holds no data.

create table public.trips (
  id bigint generated always as identity primary key,
  code text not null unique,                 -- T-0925, T-0925b …
  d date not null,
  vehicle text not null,
  driver text not null default '',
  km_start int not null check (km_start >= 0),
  km_end int not null,
  stops int not null default 0,
  fuel_l numeric(8,2) not null default 0,
  fuel_cost numeric(10,2) not null default 0,
  other_cost numeric(10,2) not null default 0,
  cans int not null default 0,
  route text,                                -- "Mon" when saved from a route
  plan_min int, act_min int,
  deleted boolean not null default false,
  created_at timestamptz not null default now(), created_by text not null default 'System',
  updated_at timestamptz, updated_by text,
  check (km_end > km_start)
);

create table public.sales (
  id bigint generated always as identity primary key,
  code text not null unique,                 -- S-001 …
  d date not null,
  buyer text not null,
  material text not null default 'UBC' check (material in ('UBC','Plastic')),
  kg numeric(10,2) not null check (kg > 0),
  rate numeric(10,2) not null check (rate >= 0),
  transport numeric(10,2) not null default 0,
  paid_on date,                              -- empty while waiting for the buyer's payment
  deleted boolean not null default false,
  created_at timestamptz not null default now(), created_by text not null default 'System',
  updated_at timestamptz, updated_by text
);

create table public.staff (
  id bigint generated always as identity primary key,
  name text not null unique,
  salary numeric(10,2),                      -- monthly; null until set
  active boolean not null default true,
  created_at timestamptz not null default now(), created_by text not null default 'System',
  updated_at timestamptz, updated_by text
);
-- staff are added from the panel (Staff → + Add staff member); the private import script seeds the current team

create table public.expenses (
  id bigint generated always as identity primary key,
  d date not null,
  category text not null check (category in ('Salaries','Rent','Bins & bags','Vehicle','Phone & misc')),
  staff_id bigint references public.staff(id),   -- who was paid, for salaries
  amount numeric(10,2) not null check (amount > 0),
  note text not null default '',
  mode text not null default 'UPI' check (mode in ('Cash','UPI','Bank')),
  item text not null default '',             -- bins & bags: Steel bin | Plastic bin | Garbage bags | Other
  other text not null default '',
  qty int not null default 0,
  deleted boolean not null default false,
  created_at timestamptz not null default now(), created_by text not null default 'System',
  updated_at timestamptz, updated_by text,
  check (category <> 'Salaries' or staff_id is not null),
  check (category <> 'Bins & bags' or qty > 0)
);

create table public.attendance (
  d date not null,
  staff_id bigint not null references public.staff(id),
  mark text not null check (mark in ('P','H','A')),
  created_at timestamptz not null default now(), created_by text not null default 'System',
  updated_at timestamptz, updated_by text,
  primary key (d, staff_id)
);

create table public.advances (
  id bigint generated always as identity primary key,
  d date not null,
  staff_id bigint not null references public.staff(id),
  amount numeric(10,2) not null check (amount > 0),
  note text not null default '',
  deleted boolean not null default false,
  created_at timestamptz not null default now(), created_by text not null default 'System',
  updated_at timestamptz, updated_by text
);

create table public.bin_moves (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('pull','place')),
  venue_id bigint not null references public.venues(id),
  steel int not null default 0, plastic int not null default 0,   -- pull: which bins come back
  n int not null check (n > 0),
  last_bin boolean not null default false,  -- pull: the venue's last bin (venue pauses)
  after date,                               -- place: the day a bin is free for it
  source text not null default '',          -- place: where its bin comes from
  status text not null default 'planned' check (status in ('planned','done','cancelled')),
  done_on date, done_by text,
  created_at timestamptz not null default now(), created_by text not null default 'System',
  updated_at timestamptz, updated_by text
);

-- spare bins at the godown (one row); changed only through adjust_spare so two phones can't overwrite each other
create table public.spare_bins (
  id smallint primary key default 1 check (id = 1),
  steel int not null default 0 check (steel >= 0),
  plastic int not null default 0 check (plastic >= 0),
  counted boolean not null default false,
  created_at timestamptz not null default now(), created_by text not null default 'System',
  updated_at timestamptz, updated_by text
);
insert into public.spare_bins default values;

create function public.adjust_spare(d_steel int, d_plastic int, set_steel int default null, set_plastic int default null)
returns public.spare_bins language plpgsql security definer set search_path = public as $$
declare r public.spare_bins;
begin
  if not public.is_team() then raise exception 'Only the team can change spare bins'; end if;
  update public.spare_bins set
    steel = greatest(0, coalesce(set_steel, steel + d_steel)),
    plastic = greatest(0, coalesce(set_plastic, plastic + d_plastic)),
    counted = counted or set_steel is not null or set_plastic is not null
  where id = 1 returning * into r;
  return r;
end $$;

-- the route being run today (at most one at a time)
create table public.route_runs (
  id bigint generated always as identity primary key,
  day smallint not null check (day between 0 and 5),
  week text not null check (week in ('A','B')),
  label text not null,
  staff text not null default '',
  plan_min int,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  stops jsonb not null default '[]',
  trip_id bigint references public.trips(id),
  created_at timestamptz not null default now(), created_by text not null default 'System',
  updated_at timestamptz, updated_by text
);
create unique index route_runs_one_open on public.route_runs ((finished_at is null)) where finished_at is null;

-- route zones and area days (one row each, by key)
create table public.plan_state (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(), created_by text not null default 'System',
  updated_at timestamptz, updated_by text
);
insert into public.plan_state (key, value) values
  ('areaRule', '{"area":"rajpur","day":0}'),
  ('zones', 'null');

-- road times and distances between the godown and every venue (OpenRouteService)
create table public.road_matrix (
  id smallint primary key default 1 check (id = 1),
  pts jsonb not null default '[]',          -- [[lat,lng], …]; index 0 is the godown
  dur jsonb not null default '[]',          -- seconds
  dist jsonb not null default '[]',         -- metres
  fetched_at timestamptz,
  created_at timestamptz not null default now(), created_by text not null default 'System',
  updated_at timestamptz, updated_by text
);
insert into public.road_matrix default values;

-- stamps + access, same rules as stage 1
do $$
declare t text;
begin
  foreach t in array array['trips','sales','staff','expenses','attendance','advances','bin_moves','spare_bins','route_runs','plan_state','road_matrix'] loop
    execute format('create trigger %I before insert or update on public.%I for each row execute function public.stamp_row()', t || '_stamp', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('create policy %I on public.%I for select to authenticated using (public.is_team())', t || '_read', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_team())', t || '_add', t);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_team()) with check (public.is_team())', t || '_edit', t);
  end loop;
end $$;
grant select, insert, update on public.trips, public.sales, public.staff, public.expenses, public.advances,
  public.bin_moves, public.route_runs, public.plan_state to authenticated;
grant select, insert, update, delete on public.attendance to authenticated;   -- clearing a day's mark removes it
grant select on public.spare_bins, public.road_matrix to authenticated;       -- changed via adjust_spare / the server
create policy attendance_clear on public.attendance for delete to authenticated using (public.is_team());
revoke execute on function public.adjust_spare(int, int, int, int) from anon, public;
grant execute on function public.adjust_spare(int, int, int, int) to authenticated;
