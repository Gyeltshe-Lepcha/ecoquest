export const DEFAULT_LEGACY_USER_ID = 'USR-0042';
export const DEFAULT_LEGACY_BIN_ID = 'BIN-001';

const FULL_DISTANCE_CM = 8;
const EMPTY_DISTANCE_CM = 30;

function legacyStore() {
  if (!globalThis.__ecoquestLegacyDevkitStore) {
    globalThis.__ecoquestLegacyDevkitStore = {
      enabled: false,
      active_mission_id: null,
      last_waste_detected_at: null,
      capture: null,
      classification: {
        section: 'UNKNOWN',
        label: 'unknown',
        confidence_pct: 0,
        status: 'idle',
        updated_at: null,
        message: 'No classification has run yet.',
      },
      bin_levels: {
        bin1: null,
        bin2: null,
        fill_level_pct: 0,
        updated_at: null,
      },
      dashboard: null,
      completed_missions: new Set(),
    };
  }

  return globalThis.__ecoquestLegacyDevkitStore;
}

export function getLegacyDevkitState() {
  return legacyStore();
}

export function setLegacySessionEnabled(enabled, mission = null) {
  const store = legacyStore();
  store.enabled = Boolean(enabled);
  store.active_mission_id = mission?.mission_id ?? null;

  if (enabled) {
    store.classification = {
      section: 'UNKNOWN',
      label: 'unknown',
      confidence_pct: 0,
      status: 'waiting',
      updated_at: new Date().toISOString(),
      message: 'Session enabled. Waiting for waste capture.',
    };
  }

  return store;
}

export function markLegacyWasteDetected(mission = null) {
  const store = legacyStore();
  store.enabled = true;
  store.active_mission_id = mission?.mission_id ?? store.active_mission_id;
  store.last_waste_detected_at = new Date().toISOString();
  store.classification = {
    section: 'UNKNOWN',
    label: 'unknown',
    confidence_pct: 0,
    status: 'capturing',
    updated_at: store.last_waste_detected_at,
    message: 'Waste detected. Camera capture requested.',
  };

  return store;
}

export function setLegacyCaptureResult(result) {
  const store = legacyStore();
  const now = new Date().toISOString();
  const section = result.section ?? sectionFromWasteLabel(result.label);

  store.capture = {
    ...result,
    captured_at: now,
  };
  store.classification = {
    section,
    label: result.label ?? 'unknown',
    confidence_pct: Number(result.confidence_pct ?? 0),
    status: result.status ?? (section === 'UNKNOWN' ? 'unknown' : 'ready'),
    updated_at: now,
    message: result.message ?? null,
    prediction: result.prediction ?? null,
    decision: result.decision ?? null,
    proof_url: result.proof_url ?? null,
    submission_id: result.submission_id ?? null,
  };

  return store.classification;
}

export function setLegacyBinLevels({ bin1, bin2 }) {
  const store = legacyStore();
  const fillLevelPct = fillLevelFromDistances(bin1, bin2);

  store.bin_levels = {
    bin1: normalizeDistance(bin1),
    bin2: normalizeDistance(bin2),
    fill_level_pct: fillLevelPct,
    updated_at: new Date().toISOString(),
  };

  return store.bin_levels;
}

export function setLegacyDashboardUpdate(update) {
  const store = legacyStore();
  store.dashboard = {
    ...update,
    updated_at: new Date().toISOString(),
  };

  return store.dashboard;
}

export function hasCompletedLegacyMission(missionId) {
  return Boolean(missionId && legacyStore().completed_missions.has(missionId));
}

export function markLegacyMissionCompleted(missionId) {
  if (missionId) {
    legacyStore().completed_missions.add(missionId);
  }
}

export function sectionFromWasteLabel(label) {
  const normalized = String(label ?? '').trim().toLowerCase();

  if (['plastic', 'bottle', 'dry', 'section1'].includes(normalized)) return 'SECTION1';
  if (['paper', 'can', 'cane', 'wet', 'section2'].includes(normalized)) return 'SECTION2';

  return 'UNKNOWN';
}

export function labelFromSection(section, expectedLabel = null) {
  const normalizedSection = String(section ?? '').trim().toUpperCase();
  const normalizedExpected = expectedLabel ? String(expectedLabel).trim().toLowerCase() : null;

  if (normalizedExpected && sectionFromWasteLabel(normalizedExpected) === normalizedSection) {
    return normalizedExpected;
  }

  if (normalizedSection === 'SECTION1') return 'plastic';
  if (normalizedSection === 'SECTION2') return 'paper';

  return 'unknown';
}

export function fillLevelFromDistances(bin1, bin2) {
  const distances = [normalizeDistance(bin1), normalizeDistance(bin2)]
    .filter((distance) => Number.isFinite(distance) && distance > 0);

  if (distances.length === 0) {
    return 0;
  }

  const closestWasteDistance = Math.min(...distances);
  const constrained = Math.min(EMPTY_DISTANCE_CM, Math.max(FULL_DISTANCE_CM, closestWasteDistance));
  const fillRatio = (EMPTY_DISTANCE_CM - constrained) / (EMPTY_DISTANCE_CM - FULL_DISTANCE_CM);

  return Math.min(100, Math.max(0, Math.round(fillRatio * 100)));
}

function normalizeDistance(value) {
  const distance = Number(value);
  return Number.isFinite(distance) ? distance : null;
}
