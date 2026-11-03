-- Stallion team panel · 013: multi-step saves as ONE database step.
-- Each function does everything a save needs (the rows, the spare count, the bin log, the history line) inside one transaction:
-- either all of it happens or none of it does, and a second call on the same thing (a double tap, another phone) finds it already done.
-- Rows are locked while a function runs, so two people can't change the same venue's bins or finish the same route at once.
-- Only the team can run them (same rule as adjust_spare). Additive: nothing existing is changed.

-- "2 steel + 1 plastic bins" (the same wording the panel uses)
create or replace function public.bins_txt(p_steel int, p_pb int) returns text
language sql immutable as $$
  select case when p_steel > 0 and p_pb > 0 then p_steel || ' steel + ' || p_pb || ' plastic'
              when p_steel > 0 then p_steel || ' steel'
              else p_pb || ' plastic' end
         || ' bin' || case when p_steel + p_pb = 1 then '' else 's' end;
$$;

-- ---------- Mark done on a bin move ----------
create or replace function public.do_bin_move(p_move bigint, p_d date) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  m public.bin_moves; v public.venues; nv public.venues; sp public.spare_bins; bl public.bin_log; lg public.change_log; nm public.bin_moves;
  st int; pb int; remaining int := 0; pull boolean;
begin
  if not public.is_team() then raise exception 'Only the team can move bins'; end if;
  select * into m from public.bin_moves where id = p_move for update;
  if not found or m.status <> 'planned' then return jsonb_build_object('result', 'gone'); end if;
  pull := m.kind = 'pull';
  select * into v from public.venues where id = m.venue_id for update;
  select * into sp from public.spare_bins where id = 1 for update;
  if pull then
    pb := least(m.plastic, v.plastic_bins); st := least(m.steel, v.steel);
    remaining := (v.steel - st) + (v.plastic_bins - pb);
    update public.venues set steel = v.steel - st, plastic_bins = v.plastic_bins - pb,
      status = case when remaining = 0 then 'Paused' else status end,
      cut_on = case when remaining = 0 then cut_on else p_d end
      where id = v.id returning * into nv;
    update public.spare_bins set steel = steel + st, plastic = plastic + pb where id = 1 returning * into sp;
  else
    if sp.steel + sp.plastic < m.n then return jsonb_build_object('result', 'nospare', 'have', sp.steel + sp.plastic); end if;
    st := least(sp.steel, m.n); pb := m.n - st;
    update public.venues set steel = v.steel + st, plastic_bins = v.plastic_bins + pb,
      status = case when v.status = 'Waiting' then 'Active' else status end,
      bin_since = case when v.status = 'Waiting' then p_d else bin_since end,
      bin_est = case when v.status = 'Waiting' then false else bin_est end,
      promised = case when v.status = 'Waiting' then 0 else promised end
      where id = v.id returning * into nv;
    update public.spare_bins set steel = steel - st, plastic = plastic - pb where id = 1 returning * into sp;
  end if;
  insert into public.bin_log (d, venue_id, change, steel, plastic, note)
    values (p_d, v.id, case when pull then -1 else 1 end, st, pb, 'Bin move') returning * into bl;
  update public.bin_moves set status = 'done', done_on = p_d, done_by = coalesce(public.me(), 'System') where id = m.id returning * into nm;
  insert into public.change_log (action, what, label, changes, ref_table, ref_id)
    values (case when pull then 'Took back' else 'Placed' end, 'Bins',
            v.name || ' · ' || public.bins_txt(st, pb) || case when pull and remaining = 0 then ' · venue paused' else '' end, '', 'venues', v.id)
    returning * into lg;
  return jsonb_build_object('result', 'ok', 'move', to_jsonb(nm), 'venue', to_jsonb(nv), 'spare', to_jsonb(sp), 'binlog', to_jsonb(bl), 'log', to_jsonb(lg));
end $$;

-- ---------- Record bin change (placed / taken back) ----------
-- p_exp_* = the bins the screen showed; if the venue's bins are different now, nothing is changed.
create or replace function public.record_bin_change(p_venue bigint, p_sign int, p_steel int, p_pb int, p_d date, p_exp_steel int, p_exp_pb int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v public.venues; nv public.venues; sp public.spare_bins; bl public.bin_log; lg public.change_log; st int; pb int; first_bins boolean;
begin
  if not public.is_team() then raise exception 'Only the team can change bins'; end if;
  if p_sign not in (-1, 1) then raise exception 'Bad bin change'; end if;
  select * into v from public.venues where id = p_venue for update;
  if not found then raise exception 'Venue not found'; end if;
  if v.steel <> p_exp_steel or v.plastic_bins <> p_exp_pb then return jsonb_build_object('result', 'changed'); end if;
  st := case when p_sign < 0 then least(p_steel, v.steel) else p_steel end;
  pb := case when p_sign < 0 then least(p_pb, v.plastic_bins) else p_pb end;
  first_bins := p_sign > 0 and (v.bin_since is null or v.steel + v.plastic_bins = 0);
  update public.venues set steel = v.steel + p_sign * st, plastic_bins = v.plastic_bins + p_sign * pb,
    bin_since = case when first_bins then p_d else bin_since end,
    bin_est = case when first_bins then false else bin_est end,
    status = case when p_sign > 0 and v.status = 'Waiting' then 'Active' else status end,
    promised = case when p_sign > 0 and v.status = 'Waiting' then 0 else promised end
    where id = v.id returning * into nv;
  -- bins taken back go to the spare count at the godown; bins placed come out of it
  update public.spare_bins set steel = greatest(0, steel - p_sign * st), plastic = greatest(0, plastic - p_sign * pb) where id = 1 returning * into sp;
  insert into public.bin_log (d, venue_id, change, steel, plastic) values (p_d, v.id, p_sign, st, pb) returning * into bl;
  insert into public.change_log (action, what, label, changes, ref_table, ref_id)
    values (case when p_sign > 0 then 'Placed' else 'Took back' end, 'Bins', v.name || ' · ' || st || ' steel, ' || pb || ' plastic', '', 'venues', v.id)
    returning * into lg;
  return jsonb_build_object('result', 'ok', 'venue', to_jsonb(nv), 'spare', to_jsonb(sp), 'binlog', to_jsonb(bl), 'log', to_jsonb(lg));
end $$;

-- ---------- Finish route ----------
-- The route is finished once: the trip, the pickup tags, the link and both history lines happen together, or not at all.
create or replace function public.finish_route(p_run bigint, p_trip jsonb, p_pids bigint[], p_label text, p_trip_label text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r public.route_runs; t public.trips; l1 public.change_log; l2 public.change_log;
begin
  if not public.is_team() then raise exception 'Only the team can finish a route'; end if;
  select * into r from public.route_runs where id = p_run for update;
  if not found then raise exception 'Route not found'; end if;
  if r.finished_at is not null then return jsonb_build_object('result', 'gone'); end if;
  begin
    insert into public.trips (code, d, vehicle, driver, km_start, km_end, stops, fuel_l, fuel_cost, cans, route, plan_min, act_min)
    values (p_trip->>'code', (p_trip->>'d')::date, p_trip->>'vehicle', coalesce(p_trip->>'driver', ''), (p_trip->>'km_start')::int, (p_trip->>'km_end')::int,
            coalesce((p_trip->>'stops')::int, 0), coalesce((p_trip->>'fuel_l')::numeric, 0), coalesce((p_trip->>'fuel_cost')::numeric, 0), coalesce((p_trip->>'cans')::int, 0),
            p_trip->>'route', (p_trip->>'plan_min')::int, (p_trip->>'act_min')::int)
    returning * into t;
  exception when unique_violation then
    return jsonb_build_object('result', 'code_taken');
  end;
  if coalesce(array_length(p_pids, 1), 0) > 0 then update public.pickups set trip = t.code where id = any(p_pids); end if;
  update public.route_runs set finished_at = now(), trip_id = t.id where id = p_run returning * into r;
  insert into public.change_log (action, what, label, changes) values ('Finished', 'Route', p_label, '') returning * into l1;
  insert into public.change_log (action, what, label, changes, ref_table, ref_id) values ('Added', 'Trip', p_trip_label, 'From the route', 'trips', t.id) returning * into l2;
  return jsonb_build_object('result', 'ok', 'trip', to_jsonb(t), 'run', to_jsonb(r), 'logs', jsonb_build_array(to_jsonb(l1), to_jsonb(l2)));
end $$;

-- ---------- Log / edit a pickup (and the payment made at it) ----------
-- p_id null = new pickup (paid on the spot when p_pay_amount > 0); otherwise an edit, where p_pay_amount is the amount the
-- pickup's existing payment should now have (0 = remove it, null = leave it). p_changes empty = no history line (nothing changed).
create or replace function public.save_pickup(p_id bigint, p_vals jsonb, p_pay_amount numeric, p_pay_mode text, p_label text, p_changes text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare p public.pickups; pay public.payments; lg public.change_log; made boolean := false;
begin
  if not public.is_team() then raise exception 'Only the team can save pickups'; end if;
  if p_id is null then
    insert into public.pickups (d, venue_id, cans, plastic_kg, src, staff, fill)
    values ((p_vals->>'d')::date, (p_vals->>'venue_id')::bigint, coalesce((p_vals->>'cans')::int, 0), coalesce((p_vals->>'plastic_kg')::numeric, 0),
            coalesce(p_vals->>'src', 'Bin'), coalesce(p_vals->>'staff', ''), coalesce(p_vals->>'fill', ''))
    returning * into p;
    if p.venue_id is not null and coalesce(p_pay_amount, 0) > 0 then
      insert into public.payments (d, venue_id, amount, mode, note, pickup_id)
      values (p.d, p.venue_id, p_pay_amount, coalesce(p_pay_mode, 'Cash'), 'Paid on the spot', p.id) returning * into pay;
    end if;
    insert into public.change_log (action, what, label, changes, ref_table, ref_id) values ('Added', 'Pickup', p_label, p_changes, 'pickups', p.id) returning * into lg;
  else
    select * into p from public.pickups where id = p_id for update;
    if not found then raise exception 'Pickup not found'; end if;
    update public.pickups set d = (p_vals->>'d')::date, venue_id = (p_vals->>'venue_id')::bigint, cans = coalesce((p_vals->>'cans')::int, 0),
      plastic_kg = coalesce((p_vals->>'plastic_kg')::numeric, 0), src = coalesce(p_vals->>'src', 'Bin'), staff = coalesce(p_vals->>'staff', ''), fill = coalesce(p_vals->>'fill', '')
      where id = p_id returning * into p;
    select * into pay from public.payments where pickup_id = p_id and not deleted order by id limit 1 for update;
    if found and p_pay_amount is not null and p.venue_id is not null and p_pay_amount <> pay.amount then
      if p_pay_amount > 0 then update public.payments set amount = p_pay_amount, venue_id = p.venue_id where id = pay.id returning * into pay;
      else update public.payments set deleted = true where id = pay.id returning * into pay; end if;
    elsif not found then pay := null; end if;
    if coalesce(p_changes, '') <> '' then
      insert into public.change_log (action, what, label, changes, ref_table, ref_id) values ('Edited', 'Pickup', p_label, p_changes, 'pickups', p.id) returning * into lg;
    end if;
  end if;
  return jsonb_build_object('result', 'ok', 'pickup', to_jsonb(p), 'payment', case when pay.id is null then null else to_jsonb(pay) end, 'log', case when lg.id is null then null else to_jsonb(lg) end);
end $$;

-- ---------- Delete / restore a pickup (its payments go with it) ----------
-- Restoring brings back only the payments that were removed together with the pickup, not one removed on purpose earlier.
create or replace function public.delete_pickup(p_id bigint, p_deleted boolean, p_label text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare p public.pickups; was timestamptz; lg public.change_log; pays jsonb;
begin
  if not public.is_team() then raise exception 'Only the team can delete pickups'; end if;
  select * into p from public.pickups where id = p_id for update;
  if not found then raise exception 'Pickup not found'; end if;
  was := coalesce(p.updated_at, p.created_at);
  update public.pickups set deleted = p_deleted where id = p_id returning * into p;
  if p_deleted then update public.payments set deleted = true where pickup_id = p_id and not deleted;
  else update public.payments set deleted = false where pickup_id = p_id and deleted and updated_at between was - interval '5 seconds' and was + interval '5 seconds'; end if;
  insert into public.change_log (action, what, label, changes, ref_table, ref_id)
    values (case when p_deleted then 'Deleted' else 'Restored' end, 'Pickup', p_label, '', 'pickups', p_id) returning * into lg;
  select coalesce(jsonb_agg(to_jsonb(x) order by x.id), '[]'::jsonb) into pays from public.payments x where x.pickup_id = p_id;
  return jsonb_build_object('result', 'ok', 'pickup', to_jsonb(p), 'payments', pays, 'log', to_jsonb(lg));
end $$;

-- ---------- Save a stop on a route ----------
-- The pickup, its payment and the stop's place on the checklist are saved together. p_stop is the stop as it should now read
-- (pid / payId are filled in here). p_has_pickup false = nothing collected (a stop saved with no cans and no plastic).
create or replace function public.save_route_stop(p_run bigint, p_idx int, p_stop jsonb, p_has_pickup boolean, p_pid bigint, p_vals jsonb, p_cost numeric,
                                                  p_paid boolean, p_mode text, p_pay_id bigint, p_pick_label text, p_pay_label text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r public.route_runs; p public.pickups; pay public.payments; stop jsonb := p_stop; l1 public.change_log; l2 public.change_log; had boolean := false;
begin
  if not public.is_team() then raise exception 'Only the team can save a stop'; end if;
  select * into r from public.route_runs where id = p_run for update;
  if not found or r.finished_at is not null then return jsonb_build_object('result', 'gone'); end if;
  if p_has_pickup then
    if p_pid is not null then select * into p from public.pickups where id = p_pid for update; had := found; end if;
    if had then
      update public.pickups set d = (p_vals->>'d')::date, venue_id = (p_vals->>'venue_id')::bigint, cans = coalesce((p_vals->>'cans')::int, 0),
        plastic_kg = coalesce((p_vals->>'plastic_kg')::numeric, 0), src = coalesce(p_vals->>'src', 'Bin'), staff = coalesce(p_vals->>'staff', ''), fill = coalesce(p_vals->>'fill', '')
        where id = p.id returning * into p;
      insert into public.change_log (action, what, label, changes, ref_table, ref_id) values ('Edited', 'Pickup', p_pick_label, 'On the route', 'pickups', p.id) returning * into l1;
    else
      insert into public.pickups (d, venue_id, cans, plastic_kg, src, staff, fill, trip)
      values ((p_vals->>'d')::date, (p_vals->>'venue_id')::bigint, coalesce((p_vals->>'cans')::int, 0), coalesce((p_vals->>'plastic_kg')::numeric, 0),
              coalesce(p_vals->>'src', 'Bin'), coalesce(p_vals->>'staff', ''), coalesce(p_vals->>'fill', ''), 'On route') returning * into p;
      insert into public.change_log (action, what, label, changes, ref_table, ref_id) values ('Added', 'Pickup', p_pick_label, 'On the route', 'pickups', p.id) returning * into l1;
    end if;
    stop := stop || jsonb_build_object('pid', p.id);
    if p_pay_id is not null then select * into pay from public.payments where id = p_pay_id for update; end if;
    if pay.id is null then
      if p_paid and p_cost > 0 then
        insert into public.payments (d, venue_id, amount, mode, note, pickup_id) values (p.d, p.venue_id, p_cost, coalesce(p_mode, 'Cash'), 'Paid on the route', p.id) returning * into pay;
        stop := stop || jsonb_build_object('payId', pay.id);
        insert into public.change_log (action, what, label, changes, ref_table, ref_id) values ('Added', 'Payment', p_pay_label, 'On the route', 'payments', pay.id) returning * into l2;
      end if;
    else
      update public.payments set amount = greatest(p_cost, 1), mode = coalesce(p_mode, mode), deleted = (not p_paid) or p_cost <= 0 where id = pay.id returning * into pay;
    end if;
  end if;
  update public.route_runs set stops = jsonb_set(stops, array[p_idx::text], stop) where id = p_run returning * into r;
  return jsonb_build_object('result', 'ok', 'run', to_jsonb(r), 'pickup', case when p.id is null then null else to_jsonb(p) end,
    'payment', case when pay.id is null then null else to_jsonb(pay) end, 'logs', jsonb_build_array(case when l1.id is null then null else to_jsonb(l1) end, case when l2.id is null then null else to_jsonb(l2) end));
end $$;

-- only the team (logged in) can run them
revoke execute on function public.do_bin_move(bigint, date), public.record_bin_change(bigint, int, int, int, date, int, int), public.finish_route(bigint, jsonb, bigint[], text, text),
  public.save_pickup(bigint, jsonb, numeric, text, text, text), public.delete_pickup(bigint, boolean, text),
  public.save_route_stop(bigint, int, jsonb, boolean, bigint, jsonb, numeric, boolean, text, bigint, text, text) from anon, public;
grant execute on function public.do_bin_move(bigint, date), public.record_bin_change(bigint, int, int, int, date, int, int), public.finish_route(bigint, jsonb, bigint[], text, text),
  public.save_pickup(bigint, jsonb, numeric, text, text, text), public.delete_pickup(bigint, boolean, text),
  public.save_route_stop(bigint, int, jsonb, boolean, bigint, jsonb, numeric, boolean, text, bigint, text, text) to authenticated;
