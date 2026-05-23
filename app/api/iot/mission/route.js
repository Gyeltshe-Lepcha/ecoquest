import { NextResponse } from 'next/server';
import { challengeById } from '@/lib/ecoquest-data';
import { sendMissionToDevkit } from '@/lib/iot-devkit';
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

  if (!expectedLabel) {
    return NextResponse.json({ error: 'This challenge does not have a paper/plastic/bottle/unknown target.' }, { status: 400 });
  }

  const mission = startMission({
    userId,
    challengeId,
    challengeTitle: challenge.title,
    expectedLabel,
    binId,
    pointsAwarded: Number(challenge.points_value ?? 5),
  });
  const devkit = await sendMissionToDevkit({ mission, body });
  const updatedMission = updateMission(mission.mission_id, { devkit }) ?? mission;

  return NextResponse.json({
    mission: updatedMission,
    devkit,
    message: devkit.status === 'commanded'
      ? `Mission generated for one ${expectedLabel} item. Waiting for the SmartBin ultrasonic and IR sensors.`
      : `Mission generated. Sort one ${expectedLabel} item through the SmartBin.`,
  });
}
