// In-memory activity log used as demo fallback when Supabase is not configured.
// When Supabase IS configured, the API routes also write to the activity_logs table.

const MAX_ENTRIES = 200;

export const activityLog = [
  {
    id: 'ACT-SEED-001',
    event_type: 'submission_approved',
    actor_id: 'ADM-0001',
    target_id: 'SUB-1002',
    target_type: 'submission',
    metadata: { user_name: 'Karma Wangmo', points_awarded: 25, ai_label: 'bottle' },
    created_at: new Date(Date.now() - 5 * 60_000).toISOString(),
  },
  {
    id: 'ACT-SEED-002',
    event_type: 'bin_alert',
    actor_id: 'system',
    target_id: 'BIN-001',
    target_type: 'bin',
    metadata: { location: 'CST Block A', fill_level_pct: 92 },
    created_at: new Date(Date.now() - 15 * 60_000).toISOString(),
  },
  {
    id: 'ACT-SEED-003',
    event_type: 'submission_rejected',
    actor_id: 'ADM-0001',
    target_id: 'SUB-1003',
    target_type: 'submission',
    metadata: { user_name: 'Pema Gyalpo', reason: 'Proof unclear' },
    created_at: new Date(Date.now() - 45 * 60_000).toISOString(),
  },
];

export function logActivity({
  event_type,
  actor_id = 'ADM-0001',
  target_id = null,
  target_type = null,
  metadata = {},
}) {
  const entry = {
    id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    event_type,
    actor_id,
    target_id,
    target_type,
    metadata,
    created_at: new Date().toISOString(),
  };
  activityLog.unshift(entry);
  if (activityLog.length > MAX_ENTRIES) activityLog.length = MAX_ENTRIES;
  return entry;
}
