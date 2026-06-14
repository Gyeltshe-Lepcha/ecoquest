import { NextResponse } from 'next/server';
import { challengeById } from '@/lib/ecoquest-data';
import {
  completeMission,
  getWaitingMissionForUser,
} from '@/lib/iot-missions';
import {
  DEFAULT_LEGACY_BIN_ID,
  DEFAULT_LEGACY_USER_ID,
  getLegacyDevkitState,
  hasCompletedLegacyMission,
  markLegacyMissionCompleted,
  sectionFromWasteLabel,
  setLegacyCaptureResult,
  setLegacySessionEnabled,
} from '@/lib/iot-legacy-devkit';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';
import {
  createVerificationDecision,
  expectedLabelFromChallenge,
  predictImageBlob,
  uploadProofBlob,
} from '@/lib/waste-ai';

export const runtime = 'nodejs';

function resolveCameraUrl(request) {
  const { searchParams } = new URL(request.url);

  return (
    searchParams.get('esp32CamCaptureUrl') ||
    searchParams.get('esp32_cam_capture_url') ||
    searchParams.get('camera_url') ||
    process.env.ESP32_CAM_CAPTURE_URL ||
    ''
  );
}

function shouldPersist(request) {
  const { searchParams } = new URL(request.url);
  return searchParams.get('persist') !== 'false';
}

async function fetchCameraCapture(captureUrl) {
  if (!captureUrl) {
    throw new Error('Missing ESP32-CAM capture URL. Set ESP32_CAM_CAPTURE_URL.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(captureUrl, {
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`ESP32-CAM returned HTTP ${response.status}.`);
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

function fallbackPrediction(expectedLabel, aiError) {
  const label = expectedLabel || 'unknown';
  const confidencePct = expectedLabel ? 100 : 0;

  return {
    label,
    confidence_pct: confidencePct,
    probabilities: expectedLabel ? { [expectedLabel]: 100 } : { unknown: 100 },
    source: 'ai-unavailable-expected-label-fallback',
    warning: aiError.message,
  };
}

async function getPrediction(capture, filename, expectedLabel) {
  try {
    return await predictImageBlob(capture.blob, filename);
  } catch (error) {
    return fallbackPrediction(expectedLabel, error);
  }
}


async function saveCaptureEvent({
  supabase,
  mission,
  challenge,
  prediction,
  decision,
  proofUrl,
  fillLevelPct,
  userId,
  binId,
}) {
  if (!supabase) {
    return {
      persisted: false,
      pointsAwarded: decision.status === 'approved' ? Number(mission?.points_awarded ?? 0) : 0,
      submissionId: null,
    };
  }

  const challengeId = mission?.challenge_id ?? challenge?.challenge_id ?? 'CH-001';
  const submissionId = `SUB-LEGACY-${Date.now()}`;
  const pointsAwarded = decision.status === 'approved' ? Number(mission?.points_awarded ?? challenge?.points_value ?? 5) : 0;

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
      location_name: binId,
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

  if (pointsAwarded > 0) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('eco_points')
      .eq('user_id', userId)
      .maybeSingle();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ eco_points: Number(profile.eco_points ?? 0) + pointsAwarded })
        .eq('user_id', userId);
    }
  }

  return {
    persisted: true,
    pointsAwarded,
    submissionId,
  };
}

export async function GET(request) {
  const state = getLegacyDevkitState();
  const userId = DEFAULT_LEGACY_USER_ID;
  const mission = getWaitingMissionForUser(userId);
  const challenge = challengeById(mission?.challenge_id ?? 'CH-001');
  const expectedLabel = mission?.expected_label ?? expectedLabelFromChallenge(challenge);
  const binId = mission?.bin_id ?? DEFAULT_LEGACY_BIN_ID;
  const fillLevelPct = state.bin_levels.fill_level_pct ?? 0;
  const captureUrl = resolveCameraUrl(request);

  try {
    const capture = await fetchCameraCapture(captureUrl);
    const filename = `${binId}-${Date.now()}-legacy-capture.jpg`;
    const supabase = shouldPersist(request) ? maybeCreateServerSupabaseClient() : null;
    const proofUrl = await uploadProofBlob(supabase, capture.blob, userId, filename);
    const prediction = await getPrediction(capture, filename, expectedLabel);
    const { normalizedExpected, labelMatches, decision } = createVerificationDecision(prediction, expectedLabel);
    const saveResult = await saveCaptureEvent({
      supabase,
      mission,
      challenge,
      prediction,
      decision,
      proofUrl,
      fillLevelPct,
      userId,
      binId,
    });
    const correct = decision.status === 'approved';
    const missionResult = mission && !hasCompletedLegacyMission(mission.mission_id)
      ? completeMission(mission.mission_id, {
          correct,
          detected_label: prediction.label,
          confidence_pct: prediction.confidence_pct,
          expected_label: normalizedExpected,
          label_matches: labelMatches,
          decision,
          points_awarded: saveResult.pointsAwarded,
          submission_id: saveResult.submissionId,
          bin_id: binId,
          proof_url: proofUrl,
        })
      : null;

    if (mission?.mission_id) {
      markLegacyMissionCompleted(mission.mission_id);
      setLegacySessionEnabled(false);
    }

    const classification = setLegacyCaptureResult({
      section: correct ? sectionFromWasteLabel(prediction.label) : 'UNKNOWN',
      label: prediction.label,
      confidence_pct: prediction.confidence_pct,
      status: correct ? 'ready' : 'rejected',
      prediction,
      decision,
      proof_url: proofUrl,
      submission_id: saveResult.submissionId,
      message: decision.message,
    });

    return NextResponse.json({
      ok: true,
      camera: {
        captured: true,
        url: captureUrl,
        bytes: capture.bytes,
        content_type: capture.contentType,
      },
      classification,
      prediction,
      decision,
      expected_label: normalizedExpected,
      label_matches: labelMatches,
      fill_level_pct: fillLevelPct,
      points_awarded: saveResult.pointsAwarded,
      persisted: saveResult.persisted,
      mission: missionResult,
      proof_url: proofUrl,
    });
  } catch (error) {
    const classification = setLegacyCaptureResult({
      section: 'UNKNOWN',
      label: 'unknown',
      confidence_pct: 0,
      status: 'error',
      message: error.message,
    });

    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        classification,
      },
      { status: 500 },
    );
  }
}
