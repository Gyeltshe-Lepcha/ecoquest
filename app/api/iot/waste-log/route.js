import { NextResponse } from 'next/server';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';
import { challengeById } from '@/lib/ecoquest-data';
import { completeMission, getMission, getWaitingMissionForUser } from '@/lib/iot-missions';
import {
  createVerificationDecision,
  expectedLabelFromChallenge,
  predictImageBlob,
  uploadProofBlob,
} from '@/lib/waste-ai';

export const runtime = 'nodejs';

function errorFeedback(message, mission = null) {
  return {
    mission_id: mission?.mission_id ?? null,
    status: 'error',
    beep: false,
    points_awarded: 0,
    expected_label: mission?.expected_label ?? null,
    detected_label: null,
    confidence_pct: 0,
    message,
  };
}

function getAuthToken(request, body = {}) {
  const authorization = request.headers.get('authorization') ?? '';
  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }

  const headerToken = request.headers.get('x-device-token');
  if (headerToken) return headerToken;

  const bodyToken = body.device_token ?? body.deviceToken ?? body.iot_device_token ?? body.iotDeviceToken;
  if (bodyToken) return String(bodyToken);

  const { searchParams } = new URL(request.url);
  return searchParams.get('device_token') ?? searchParams.get('iot_device_token') ?? '';
}

function assertDeviceAuthorized(request, body = {}) {
  const expectedToken = process.env.IOT_DEVICE_TOKEN;
  if (!expectedToken) {
    return;
  }

  const providedToken = getAuthToken(request, body);
  if (providedToken === expectedToken) {
    return;
  }

  const missionId = body.mission_id ?? body.missionId;
  const mission = missionId ? getMission(missionId) : null;
  if (mission?.status === 'waiting') {
    return;
  }

  throw new Error('Invalid IoT device token.');
}

function resolveCameraUrl(body) {
  return (
    body.esp32CamCaptureUrl ||
    body.esp32_cam_capture_url ||
    body.cameraCaptureUrl ||
    body.camera_url ||
    process.env.ESP32_CAM_CAPTURE_URL ||
    ''
  );
}

async function fetchCameraCapture(captureUrl) {
  if (!captureUrl) {
    throw new Error('Missing ESP32-CAM capture URL. Send esp32CamCaptureUrl or set ESP32_CAM_CAPTURE_URL.');
  }

  console.log('[waste-log] fetching image from CAM:', captureUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(captureUrl, {
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`ESP32-CAM capture failed with HTTP ${response.status}.`);
    }

    const bytes = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return {
      blob: new Blob([bytes], { type: contentType }),
      bytes: bytes.byteLength,
      contentType,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`ESP32-CAM capture timed out at ${captureUrl}.`);
    }
    throw new Error(`ESP32-CAM capture failed at ${captureUrl}: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }
}

function fillLevelFromPayload(body) {
  if (body.fill_level_pct != null) {
    return Math.min(100, Math.max(0, Number(body.fill_level_pct)));
  }

  const wasteCount = Number(body.wasteCount ?? body.waste_count ?? 0);
  const fullWasteLimit = Number(body.fullWasteLimit ?? body.full_waste_limit ?? 20);

  if (!Number.isFinite(wasteCount) || !Number.isFinite(fullWasteLimit) || fullWasteLimit <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((wasteCount / fullWasteLimit) * 100));
}

async function saveIotEvent({
  supabase,
  body,
  prediction,
  decision,
  pointsAwarded,
  proofUrl,
  userId,
  challengeId,
  binId,
  fillLevelPct,
  challenge,
}) {
  const awardedPoints = decision.status === 'approved' ? Number(pointsAwarded ?? 0) : 0;

  if (!supabase) {
    return { persisted: false, pointsAwarded: awardedPoints };
  }

  const submissionId = `SUB-IOT-${Date.now()}`;

  if (challenge) {
    const { error: challengeError } = await supabase.from('challenges').upsert({
      challenge_id: challenge.challenge_id,
      title: challenge.title,
      description: challenge.description,
      proof_type: challenge.proof_type,
      points_value: challenge.points_value,
      difficulty: challenge.difficulty,
      cadence: challenge.cadence,
      category: challenge.category,
      status: challenge.status,
      deadline: challenge.deadline,
      created_by: challenge.created_by,
    }, { onConflict: 'challenge_id' });

    if (challengeError) {
      throw new Error(`Challenge sync failed: ${challengeError.message}`);
    }
  }

  const { error: submissionError } = await supabase.from('submissions').insert({
    submission_id: submissionId,
    user_id: userId,
    challenge_id: challengeId,
    proof_url: proofUrl,
    ai_label: prediction.label,
    ai_confidence: prediction.confidence_pct / 100,
    status: decision.status,
    reviewed_by: decision.status === 'approved' ? 'AI Auto-Approval' : null,
    rejection_reason: decision.status === 'rejected' ? decision.message : null,
  });

  if (submissionError) {
    throw new Error(`Submission save failed: ${submissionError.message}`);
  }

  const { error: detectionError } = await supabase.from('detections').insert({
    bin_id: binId,
    user_id: userId,
    submission_id: submissionId,
    image_url: proofUrl,
    waste_label: prediction.label,
    confidence: prediction.confidence_pct / 100,
    fill_level_pct: fillLevelPct,
    status: decision.status === 'pending' ? 'review_needed' : fillLevelPct >= 80 ? 'full' : 'not_full',
  });

  if (detectionError) {
    throw new Error(`Detection save failed: ${detectionError.message}`);
  }

  const { data: existingBin } = await supabase
    .from('smart_bins')
    .select('total_deposits')
    .eq('bin_id', binId)
    .maybeSingle();

  if (existingBin) {
    const { error: updateBinError } = await supabase
      .from('smart_bins')
      .update({
        fill_level_pct: fillLevelPct,
        is_full: fillLevelPct >= 80,
        last_deposit_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
        online: true,
        user_id_last: userId,
        total_deposits: Number(existingBin.total_deposits ?? 0) + 1,
      })
      .eq('bin_id', binId);

    if (updateBinError) {
      throw new Error(`Smart bin update failed: ${updateBinError.message}`);
    }
  } else {
    const { error: insertBinError } = await supabase.from('smart_bins').insert({
      bin_id: binId,
      location_name: body.location_name ?? body.device ?? binId,
      fill_level_pct: fillLevelPct,
      is_full: fillLevelPct >= 80,
      online: true,
      total_deposits: 1,
      user_id_last: userId,
      last_deposit_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
    });

    if (insertBinError) {
      throw new Error(`Smart bin insert failed: ${insertBinError.message}`);
    }
  }

  if (awardedPoints > 0) {
    await supabase.rpc('increment_eco_points', {
      p_user_id: userId,
      p_amount: awardedPoints,
    });
  }

  return {
    persisted: true,
    pointsAwarded: awardedPoints,
    submissionId,
  };
}

export async function POST(request) {
  let activeMissionForError = null;

  try {
    const body = await request.json().catch(() => ({}));
    console.log('[waste-log] POST received:', JSON.stringify(body, null, 2));
    assertDeviceAuthorized(request, body);

    const event = body.event ?? 'waste_detected';
    const device = body.device ?? 'smart_dustbin_01';
    const binId = body.bin_id ?? body.binId ?? 'BIN-001';
    const userId = body.user_id ?? body.user_qr_code ?? body.userQrCode ?? 'USR-0042';
    const requestedMission = body.mission_id || body.missionId ? getMission(body.mission_id ?? body.missionId) : null;
    const waitingMission = requestedMission?.status === 'waiting' ? requestedMission : getWaitingMissionForUser(userId);
    activeMissionForError = waitingMission;
    const challengeId = waitingMission?.challenge_id ?? body.challenge_id ?? body.challengeId ?? 'CH-001';
    const challenge = challengeById(challengeId);
    const expectedLabel =
      waitingMission?.expected_label ??
      body.expected_label ??
      body.expectedLabel ??
      expectedLabelFromChallenge(challenge);
    const fillLevelPct = fillLevelFromPayload(body);
    const captureUrl = resolveCameraUrl(body);

    if (event !== 'waste_detected') {
      return NextResponse.json({ ok: false, error: `Unsupported event: ${event}` }, { status: 400 });
    }

    console.log('[waste-log] mission found:', waitingMission?.mission_id ?? 'NONE');
    console.log('[waste-log] captureUrl:', captureUrl);
    const supabase = maybeCreateServerSupabaseClient();
    const capture = await fetchCameraCapture(captureUrl);
    const filename = `${binId}-${Date.now()}-capture.jpg`;
    const proofUrl = await uploadProofBlob(supabase, capture.blob, userId, filename);
    const prediction = await predictImageBlob(capture.blob, filename);

    const {
      normalizedExpected,
      labelMatches,
      decision,
      confidence,
      confidence_pct: confidencePct,
      points_awarded: pointsAwarded,
    } = createVerificationDecision(prediction, expectedLabel);
    const saveResult = await saveIotEvent({
      supabase,
      body,
      prediction,
      decision,
      pointsAwarded,
      proofUrl,
      userId,
      challengeId,
      binId,
      fillLevelPct,
      challenge,
    });
    const mission = waitingMission
      ? completeMission(waitingMission.mission_id, {
          correct: decision.status === 'approved',
          detected_label: prediction.label,
          confidence,
          confidence_pct: confidencePct,
          expected_label: normalizedExpected,
          label_matches: labelMatches,
          decision,
          points_awarded: saveResult.pointsAwarded,
          submission_id: saveResult.submissionId ?? null,
          bin_id: binId,
          proof_url: proofUrl,
        })
      : null;
    const correct = decision.status === 'approved';
    const esp32Feedback = {
      mission_id: mission?.mission_id ?? waitingMission?.mission_id ?? null,
      status: correct ? 'correct' : 'try_again',
      beep: correct,
      points_awarded: saveResult.pointsAwarded,
      expected_label: normalizedExpected,
      detected_label: prediction.label,
      confidence,
      confidence_pct: confidencePct,
      message: correct
        ? decision.message
        : `${decision.message} No EcoPoints awarded.`,
    };

    return NextResponse.json({
      ok: true,
      device,
      event,
      bin_id: binId,
      user_id: userId,
      challenge_id: challengeId,
      camera: {
        captured: true,
        url: captureUrl,
        bytes: capture.bytes,
        content_type: capture.contentType,
      },
      prediction,
      decision,
      expected_label: normalizedExpected,
      label_matches: labelMatches,
      confidence,
      confidence_pct: confidencePct,
      fill_level_pct: fillLevelPct,
      points_awarded: saveResult.pointsAwarded,
      beep: esp32Feedback.beep,
      esp32_feedback: esp32Feedback,
      persisted: saveResult.persisted,
      mission,
      submission_id: saveResult.submissionId ?? null,
      proof_url: proofUrl,
      dashboard: saveResult.persisted ? 'updated' : 'not_persisted',
    });
  } catch (error) {
    const failedMission = activeMissionForError
      ? completeMission(activeMissionForError.mission_id, {
          correct: false,
          detected_label: 'camera_error',
          confidence_pct: 0,
          expected_label: activeMissionForError.expected_label,
          label_matches: false,
          decision: {
            status: 'rejected',
            message: error.message,
          },
          points_awarded: 0,
          submission_id: null,
          bin_id: activeMissionForError.bin_id,
          proof_url: null,
        })
      : null;

    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        beep: false,
        esp32_feedback: errorFeedback(error.message, failedMission ?? activeMissionForError),
        mission: failedMission,
      },
      { status: error.message === 'Invalid IoT device token.' ? 401 : 500 },
    );
  }
}
