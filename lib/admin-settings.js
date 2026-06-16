// In-memory admin settings store — demo fallback when Supabase is not configured.
// When Supabase IS configured, settings are persisted to the admin_settings table.

const DEFAULT_SETTINGS = {
  ai_confidence_threshold: 70,
  ai_review_threshold: 70,
  offline_retry_buffer: true,
  bin_full_alert: true,
  demo_mode_local_fallback: true,
  demo_mode_simulate_latency: true,
};

let _settings = { ...DEFAULT_SETTINGS };

export function getSettings() {
  return { ..._settings };
}

export function patchSettings(updates) {
  _settings = { ..._settings, ...updates };
  return { ..._settings };
}

export function resetSettings() {
  _settings = { ...DEFAULT_SETTINGS };
  return { ..._settings };
}
