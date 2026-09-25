-- Stallion team panel (/admin) · stage 1: team, settings, venues, pickups, bins, change history.
-- Runs on the SEPARATE admin Supabase project (not the app's). Holds no data.
-- Every table is readable and writable only by people listed in public.team.

-- ---------- team ----------
create table public.team (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text not null,
  role       text not null,
  email      text not null unique,
  created_at timestamptz not null default now()
);

-- true when the logged-in user is on the team
create function public.is_team() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.team where user_id = auth.uid());
$$;

-- the logged-in team member's name, or null (imports and server jobs)
create function public.me() returns text
language sql stable security definer set search_path = public as $$
  select name from public.team where user_id = auth.uid();
$$;

-- who added or last changed a row always comes from the login, not from the browser
create function public.stamp_row() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.created_by := coalesce(public.me(), new.created_by, 'System');
  else
    new.created_at := old.created_at;
    new.created_by := old.created_by;
    new.updated_at := now();
    new.updated_by := coalesce(public.me(), new.updated_by, 'System');
  end if;
  return new;
end $$;

-- ---------- settings (one row) ----------
create table public.settings (
  id         smallint primary key default 1 check (id = 1),
  data       jsonb not null,
  created_at timestamptz not null default now(),
  created_by text not null default 'System',
  updated_at timestamptz,
  updated_by text
);
insert into public.settings (data) values ('{
  "ubcRate": 210, "cansPerKg": 66, "plasticSale": null, "canRate": 1.5, "plasticBuy": 15,
  "add": 310, "pull": 90, "grace": 14,
  "vehCap": null, "capSteel": 150, "capPl": 150, "routeHours": 4.5, "stopMin": 15, "traffic": 50, "depart": "11:00"
}');

-- ---------- venues ----------
create table public.venues (
  id           bigint generated always as identity primary key,
  name         text not null,
  type         text,
  status       text not null default 'Active' check (status in ('Active','Waiting','Paused','Pulled')),
  area         text,
  area_est     boolean not null default false,
  steel        int not null default 0 check (steel >= 0),
  plastic_bins int not null default 0 check (plastic_bins >= 0),
  bags         boolean not null default false,
  promised     int not null default 0 check (promised >= 0),
  can_rate     numeric(8,2) not null default 1.5,
  plastic_rate numeric(8,2),
  added        date,
  added_est    boolean not null default false,
  bin_since    date,
  bin_est      boolean not null default false,
  lat          double precision,
  lng          double precision,
  pin_src      text,            -- google | googleCheck | manual | null
  pin_by       text,
  g_name       text,            -- the name Google Maps showed for the pin
  contact      text,
  phone        text,
  terms        text not null default 'On the spot' check (terms in ('On the spot','Per pickup','Monthly')),
  upi          text,
  opening      numeric(10,2),   -- still owed on the go-live day
  keep_until   date,            -- "Keep for now" on a take-back
  skip_give    date,            -- "Not now" on a bin placement
  cut_on       date,            -- last time bins were taken back
  created_at   timestamptz not null default now(),
  created_by   text not null default 'System',
  updated_at   timestamptz,
  updated_by   text
);
create unique index venues_name_key on public.venues (lower(name));

-- ---------- pickups ----------
create table public.pickups (
  id         bigint generated always as identity primary key,
  d          date not null,
  venue_id   bigint references public.venues(id),   -- null = household pickup from the app
  cans       int not null default 0 check (cans >= 0),
  plastic_kg numeric(8,2) not null default 0 check (plastic_kg >= 0),
  src        text not null default 'Bin' check (src in ('Bin','App','Walk-in')),
  staff      text not null default '',
  fill       text not null default '',
  trip       text not null default '',
  deleted    boolean not null default false,        -- deleted pickups stay, so they can be restored
  created_at timestamptz not null default now(),
  created_by text not null default 'System',
  updated_at timestamptz,
  updated_by text
);
create index pickups_d_idx on public.pickups (d);
create index pickups_venue_idx on public.pickups (venue_id);

-- ---------- bin changes ----------
create table public.bin_log (
  id         bigint generated always as identity primary key,
  d          date not null,
  venue_id   bigint not null references public.venues(id),
  change     smallint not null check (change in (-1, 1)),   -- 1 placed, -1 taken back
  steel      int not null default 0 check (steel >= 0),
  plastic    int not null default 0 check (plastic >= 0),
  note       text not null default '',
  created_at timestamptz not null default now(),
  created_by text not null default 'System',
  updated_at timestamptz,
  updated_by text
);

-- ---------- change history (add-only) ----------
create table public.change_log (
  id         bigint generated always as identity primary key,
  at         timestamptz not null default now(),
  by         text not null default 'System',
  action     text not null,
  what       text not null,
  label      text not null default '',
  changes    text not null default '',
  ref_table  text,
  ref_id     bigint
);
create function public.stamp_log() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.at := now();
  new.by := coalesce(public.me(), new.by, 'System');
  return new;
end $$;

create trigger settings_stamp before insert or update on public.settings for each row execute function public.stamp_row();
create trigger venues_stamp   before insert or update on public.venues   for each row execute function public.stamp_row();
create trigger pickups_stamp  before insert or update on public.pickups  for each row execute function public.stamp_row();
create trigger bin_log_stamp  before insert or update on public.bin_log  for each row execute function public.stamp_row();
create trigger change_log_stamp before insert on public.change_log for each row execute function public.stamp_log();

-- ---------- access: team only ----------
alter table public.team       enable row level security;
alter table public.settings   enable row level security;
alter table public.venues     enable row level security;
alter table public.pickups    enable row level security;
alter table public.bin_log    enable row level security;
alter table public.change_log enable row level security;

revoke all on public.team, public.settings, public.venues, public.pickups, public.bin_log, public.change_log from anon;
grant select on public.team to authenticated;
grant select, update on public.settings to authenticated;
grant select, insert, update on public.venues, public.pickups to authenticated;
grant select, insert on public.bin_log, public.change_log to authenticated;

-- team rows are added by the owner through the server (secret key), never from the browser
create policy team_read     on public.team       for select to authenticated using (public.is_team());
create policy settings_read on public.settings   for select to authenticated using (public.is_team());
create policy settings_edit on public.settings   for update to authenticated using (public.is_team()) with check (public.is_team());
create policy venues_read   on public.venues     for select to authenticated using (public.is_team());
create policy venues_add    on public.venues     for insert to authenticated with check (public.is_team());
create policy venues_edit   on public.venues     for update to authenticated using (public.is_team()) with check (public.is_team());
create policy pickups_read  on public.pickups    for select to authenticated using (public.is_team());
create policy pickups_add   on public.pickups    for insert to authenticated with check (public.is_team());
create policy pickups_edit  on public.pickups    for update to authenticated using (public.is_team()) with check (public.is_team());
create policy bins_read     on public.bin_log    for select to authenticated using (public.is_team());
create policy bins_add      on public.bin_log    for insert to authenticated with check (public.is_team());
create policy log_read      on public.change_log for select to authenticated using (public.is_team());
create policy log_add       on public.change_log for insert to authenticated with check (public.is_team());
