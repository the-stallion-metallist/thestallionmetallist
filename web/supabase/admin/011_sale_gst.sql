-- GST on sales. The rate each sale was recorded with (null = no GST, or an old sale that uses the current Settings rate).
alter table public.sales add column if not exists gst_rate numeric;
