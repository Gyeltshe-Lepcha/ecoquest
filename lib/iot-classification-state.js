function store() {
  if (!globalThis.__eqClassStore) {
    globalThis.__eqClassStore = { section: null, prediction: null, missionId: null };
  }
  return globalThis.__eqClassStore;
}

export function storeClassification({ section, prediction, missionId }) {
  const s = store();
  s.section = section;
  s.prediction = prediction;
  s.missionId = missionId;
}

export function readClassification() {
  return store();
}

export function clearClassification() {
  const s = store();
  s.section = null;
  s.prediction = null;
  s.missionId = null;
}
