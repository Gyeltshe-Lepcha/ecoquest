-- Optional demo seed data for EcoQuest Bhutan.
-- Run after supabase/schema.sql.

insert into public.teams (name, campus, level, eco_points, rank) values
  ('Hostel A', 'CST Campus', 5, 1250, 1),
  ('Team Green', 'CST Campus', 4, 1040, 2),
  ('Class 2B', 'CST Campus', 3, 880, 3)
on conflict (name) do update set
  campus = excluded.campus,
  level = excluded.level,
  eco_points = excluded.eco_points,
  rank = excluded.rank;

insert into public.profiles (user_id, team_id, name, email, phone, campus, role, level, eco_points, streak_days, current_rank, avatar)
select 'USR-0042', teams.id, 'Tshering Dorji', 'tshering@cst.edu.bt', '+975 17 234 567', 'College of Science and Technology', 'user', 4, 320, 6, 2, 'TD'
from public.teams where teams.name = 'Team Green'
on conflict (user_id) do update set
  team_id = excluded.team_id,
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  campus = excluded.campus,
  role = excluded.role,
  level = excluded.level,
  eco_points = excluded.eco_points,
  streak_days = excluded.streak_days,
  current_rank = excluded.current_rank,
  avatar = excluded.avatar;

insert into public.profiles (user_id, name, email, phone, campus, role, level, eco_points, streak_days, current_rank, avatar)
values ('ADM-0001', 'EcoQuest Admin', 'admin@ecoquest.bt', '+975 02 123 456', 'National Pilot', 'admin', 1, 0, 0, null, 'AD')
on conflict (user_id) do update set
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  campus = excluded.campus,
  role = excluded.role,
  avatar = excluded.avatar;

insert into public.challenges
  (challenge_id, title, description, proof_type, points_value, difficulty, cadence, category, status, deadline, created_by)
values
  ('CH-001', 'Plastic SmartBin mission', 'Place one plastic item into the physical SmartBin and wait for AI verification.', 'smart_bin', 5, 'easy', 'daily', 'plastic', 'active', now() + interval '1 day', 'ADM-0001'),
  ('CH-002', 'Paper SmartBin mission', 'Place one paper item into the physical SmartBin and wait for AI verification.', 'smart_bin', 5, 'easy', 'daily', 'paper', 'active', now() + interval '1 day', 'ADM-0001'),
  ('CH-003', 'Bottle SmartBin mission', 'Place one bottle into the physical SmartBin and wait for AI verification.', 'smart_bin', 5, 'easy', 'daily', 'bottle', 'active', now() + interval '1 day', 'ADM-0001'),
  ('CH-004', 'Unknown object check', 'Place one non-trained or unclear object into the SmartBin and let AI classify it as unknown.', 'smart_bin', 5, 'easy', 'daily', 'unknown', 'active', now() + interval '1 day', 'ADM-0001'),
  ('CH-005', 'Final SmartBin accuracy check', 'Run one more unknown-object verification to test the fallback class before demo time.', 'smart_bin', 5, 'easy', 'daily', 'unknown', 'active', now() + interval '1 day', 'ADM-0001')
on conflict (challenge_id) do update set
  title = excluded.title,
  description = excluded.description,
  proof_type = excluded.proof_type,
  points_value = excluded.points_value,
  difficulty = excluded.difficulty,
  cadence = excluded.cadence,
  category = excluded.category,
  status = excluded.status,
  deadline = excluded.deadline,
  created_by = excluded.created_by;

insert into public.smart_bins
  (bin_id, location_name, fill_level_pct, battery_level_pct, is_full, online, total_deposits, user_id_last, last_deposit_at, last_synced_at)
values
  ('BIN-001', 'CST Canteen', 62, 91, false, true, 124, 'USR-0042', now() - interval '7 minutes', now()),
  ('BIN-002', 'Library Entrance', 38, 87, false, true, 88, null, now() - interval '22 minutes', now()),
  ('BIN-003', 'Hostel A Gate', 78, 74, false, true, 156, 'USR-0042', now() - interval '13 minutes', now())
on conflict (bin_id) do update set
  location_name = excluded.location_name,
  fill_level_pct = excluded.fill_level_pct,
  battery_level_pct = excluded.battery_level_pct,
  is_full = excluded.is_full,
  online = excluded.online,
  total_deposits = excluded.total_deposits,
  user_id_last = excluded.user_id_last,
  last_deposit_at = excluded.last_deposit_at,
  last_synced_at = excluded.last_synced_at;

insert into public.badges (badge_id, name, description, category, points_required, icon)
values
  ('BADGE-PLASTIC', 'Plastic Saver', 'Logged verified plastic sorting actions.', 'plastic', 100, 'recycle'),
  ('BADGE-PAPER', 'Paper Hero', 'Kept paper waste in the correct stream.', 'paper', 100, 'file-text'),
  ('BADGE-COMPOST', 'Compost Starter', 'Completed an organic waste quest.', 'organic', 75, 'sprout'),
  ('BADGE-STREAK', 'Streak Master', 'Maintained a strong daily sorting streak.', 'streak', 150, 'flame')
on conflict (badge_id) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  points_required = excluded.points_required,
  icon = excluded.icon;

insert into public.rewards (reward_id, title, description, cost_points, stock, active)
values
  ('REWARD-CANTEEN', 'Canteen Coupon', 'Redeem EcoPoints for a campus canteen reward.', 250, 20, true),
  ('REWARD-CERT', 'Eco Certificate', 'Downloadable sustainability participation certificate.', 500, null, true),
  ('REWARD-RECOG', 'Campus Recognition', 'Feature the winning team on the campus leaderboard board.', 800, 3, true)
on conflict (reward_id) do update set
  title = excluded.title,
  description = excluded.description,
  cost_points = excluded.cost_points,
  stock = excluded.stock,
  active = excluded.active;

insert into public.campus_insights (title, body, severity)
values
  ('Canteen peak waste time', 'Canteen peak waste time: 1-2 PM', 'info'),
  ('Plastic hotspot', 'Hostel A produces the most plastic waste', 'warning'),
  ('Exam paper trend', 'Paper waste increases before exams', 'info');
