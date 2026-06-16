-- ============================================================
-- EcoQuest Admin: new tables + missing columns
-- Run this once in the Supabase SQL editor
-- ============================================================

-- 1. submissions: add reviewed_at (used by admin review endpoint)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 2. challenges: add milestone_points + created_at if missing
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS milestone_points INTEGER;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS created_at  TIMESTAMPTZ DEFAULT now();

-- 3. smart_bins: add battery if missing
ALTER TABLE smart_bins ADD COLUMN IF NOT EXISTS battery_level_pct INTEGER DEFAULT 100;

-- 4. Activity log (audit trail for admin actions)
CREATE TABLE IF NOT EXISTS activity_logs (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type  TEXT        NOT NULL,
  actor_id    TEXT,
  target_id   TEXT,
  target_type TEXT,
  metadata    JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at  ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type  ON activity_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_target_id   ON activity_logs (target_id);

-- 5. Admin settings (key-value store)
CREATE TABLE IF NOT EXISTS admin_settings (
  key        TEXT        PRIMARY KEY,
  value      JSONB       NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO admin_settings (key, value) VALUES
  ('ai_confidence_threshold',   '70'),
  ('ai_review_threshold',       '70'),
  ('offline_retry_buffer',      'true'),
  ('bin_full_alert',            'true'),
  ('demo_mode_local_fallback',  'true'),
  ('demo_mode_simulate_latency','true')
ON CONFLICT (key) DO NOTHING;

-- 6. RLS: service-role key bypasses RLS, but enable it for consistency
ALTER TABLE activity_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY service_role_all ON activity_logs FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_settings' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY service_role_all ON admin_settings FOR ALL USING (true);
  END IF;
END $$;
