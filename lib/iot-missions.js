function missionStore() {
  if (!globalThis.__ecoquestMissionStore) {
    globalThis.__ecoquestMissionStore = new Map();
  }

  return globalThis.__ecoquestMissionStore;
}

export function startMission({ userId, challengeId, challengeTitle, expectedLabel, binId = 'BIN-001', pointsAwarded = 5 }) {
  const store = missionStore();
  const now = new Date().toISOString();
  const mission = {
    mission_id: `MISSION-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    user_id: userId,
    challenge_id: challengeId,
    challenge_title: challengeTitle,
    expected_label: expectedLabel,
    bin_id: binId,
    status: 'waiting',
    points_awarded: pointsAwarded,
    started_at: now,
    updated_at: now,
    devkit: {
      status: 'pending',
      message: 'Preparing ESP32 DevKit command.',
    },
    result: null,
  };

  for (const existing of store.values()) {
    if (existing.user_id === userId && existing.status === 'waiting') {
      existing.status = 'cancelled';
      existing.updated_at = now;
    }
  }

  store.set(mission.mission_id, mission);
  return mission;
}

export function getMission(missionId) {
  return missionStore().get(missionId) ?? null;
}

export function getWaitingMissionForUser(userId) {
  const missions = Array.from(missionStore().values())
    .filter((mission) => mission.user_id === userId && mission.status === 'waiting')
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

  return missions[0] ?? null;
}

export function updateMission(missionId, updates) {
  const store = missionStore();
  const mission = store.get(missionId);

  if (!mission) {
    return null;
  }

  const updatedMission = {
    ...mission,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  store.set(missionId, updatedMission);
  return updatedMission;
}

export function completeMission(missionId, result) {
  const store = missionStore();
  const mission = store.get(missionId);

  if (!mission) {
    return null;
  }

  const status = result.correct ? 'correct' : 'try_again';
  const updatedMission = {
    ...mission,
    status,
    points_awarded: result.points_awarded ?? 0,
    updated_at: new Date().toISOString(),
    result,
  };

  store.set(missionId, updatedMission);
  return updatedMission;
}
