-- How often a venue is visited. Null = the planner decides (weekly, or every 2 weeks when a day is too long);
-- 'fortnight' = the team chose every 2 weeks (from Venue profit or the venue panel).
alter table public.venues add column if not exists visit text;
