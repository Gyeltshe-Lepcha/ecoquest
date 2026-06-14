import { getWaitingMissionForUser } from '@/lib/iot-missions';
import {
  DEFAULT_LEGACY_USER_ID,
  getLegacyDevkitState,
  setLegacySessionEnabled,
} from '@/lib/iot-legacy-devkit';

export const runtime = 'nodejs';

export async function GET() {
  const state = getLegacyDevkitState();
  const mission = state.active_mission_id
    ? null
    : getWaitingMissionForUser(DEFAULT_LEGACY_USER_ID);
  const activeMission = mission ?? getWaitingMissionForUser(DEFAULT_LEGACY_USER_ID);
  const enabled = Boolean(activeMission);

  if (!enabled && state.enabled) {
    setLegacySessionEnabled(false);
  }

  return new Response(enabled ? 'ENABLE' : 'DISABLE', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
