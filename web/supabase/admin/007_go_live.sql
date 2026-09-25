-- The panel went live on 25 Sep 2026: venue payouts count pickups from this day (earlier ones = opening balances).
update public.settings set data = data || '{"goLive": "2026-09-25"}';
