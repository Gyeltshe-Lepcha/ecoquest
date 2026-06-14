import { NextResponse } from 'next/server';
import { getWaitingMissionForUser } from '@/lib/iot-missions';
import {
  DEFAULT_LEGACY_USER_ID,
  markLegacyWasteDetected,
} from '@/lib/iot-legacy-devkit';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const userId = body.user_id ?? body.userId ?? DEFAULT_LEGACY_USER_ID;
  const mission = getWaitingMissionForUser(userId);
  const state = markLegacyWasteDetected(mission);

  return NextResponse.json({
    ok: true,
    status: 'detected',
    mission_id: mission?.mission_id ?? null,
    message: mission
      ? 'Waste signal received. Call /api/capture to fetch the ESP32-CAM image.'
      : 'Waste signal received without an active mission.',
    last_waste_detected_at: state.last_waste_detected_at,
  });
}
