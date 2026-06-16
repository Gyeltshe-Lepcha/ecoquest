import { NextResponse } from 'next/server';
import { challengeById } from '@/lib/ecoquest-data';
import { getDevkitMode, sendMissionToDevkit } from '@/lib/iot-devkit';
import { setLegacySessionEnabled } from '@/lib/iot-legacy-devkit';
import { expectedLabelFromChallenge } from '@/lib/waste-ai';
import { getMission, startMission, updateMission } from '@/lib/iot-missions';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const missionId = searchParams.get('mission_id');

  if (!missionId) {
    return NextResponse.json({ error: 'mission_id is required.' }, { status: 400 });
  }

  const mission = getMission(missionId);

  if (!mission) {
    return NextResponse.json({ error: 'Mission not found.' }, { status: 404 });
  }

  return NextResponse.json({ mission });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const challengeId = body.challenge_id;
  const userId = body.user_id ?? 'USR-0042';
  const binId = body.bin_id ?? 'BIN-001';
  const challenge = challengeById(challengeId);
  const expectedLabel = body.expected_label ?? expectedLabelFromChallenge(challenge);

  if (!challenge) {
    return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 });
  }

  const mission = startMission({
    userId,
    challengeId,
    challengeTitle: challenge.title,
    expectedLabel,
    binId,
    pointsAwarded: 0,
  });
  const devkitMode = getDevkitMode(body);
  const devkit = devkitMode === 'command'
    ? await sendMissionToDevkit({ mission, body })
    : {
        status: 'polling',
        mode: 'polling',
        message: 'Polling DevKit session enabled. Firmware should read ENABLE from /api/session, then call /api/wasteDetected, /api/capture, and /api/classification.',
        session_url: '/api/session',
      };
  setLegacySessionEnabled(true, mission);
  const updatedMission = updateMission(mission.mission_id, { devkit }) ?? mission;

  return NextResponse.json({
    mission: updatedMission,
    devkit,
    message: devkit.status === 'commanded'
      ? 'Mission generated. Waiting for the SmartBin ultrasonic and IR sensors.'
      : devkit.status === 'polling'
        ? 'Mission generated. Polling DevKit can now read ENABLE from /api/session.'
      : 'Mission generated. Sort one supported item through the SmartBin.',
  });
}
