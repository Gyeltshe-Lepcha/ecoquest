import { NextResponse } from 'next/server';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';
import {
  createVerificationDecision,
  predictImageFile,
  uploadProofFile,
} from '@/lib/waste-ai';

export async function POST(request) {
  const contentType = request.headers.get('content-type') ?? '';
  const supabase = maybeCreateServerSupabaseClient();

  let imageFile = null;
  let userId = 'USR-0042';
  let challengeId = 'CH-001';
  let binId = 'BIN-001';
  let fillLevelPct = 62;
  let expectedLabel = null;

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    imageFile = formData.get('image');
    userId = formData.get('user_id') || userId;
    challengeId = formData.get('challenge_id') || challengeId;
    binId = formData.get('bin_id') || binId;
    fillLevelPct = Number(formData.get('fill_level_pct') || fillLevelPct);
    expectedLabel = formData.get('expected_label') || null;
  } else {
    const body = await request.json().catch(() => ({}));
    userId = body.user_id || userId;
    challengeId = body.challenge_id || challengeId;
    binId = body.bin_id || binId;
    fillLevelPct = Number(body.fill_level_pct ?? fillLevelPct);
    expectedLabel = body.expected_label || null;
  }

  try {
    const [prediction, proofUrl] = await Promise.all([
      predictImageFile(imageFile),
      uploadProofFile(supabase, imageFile, userId),
    ]);

    const { normalizedExpected, labelMatches, decision } = createVerificationDecision(prediction, expectedLabel);
    const submissionId = `SUB-${Date.now()}`;
    let persisted = false;

    if (supabase) {
      const { error: submissionError } = await supabase.from('submissions').insert({
        submission_id: submissionId,
        user_id: userId,
        challenge_id: challengeId,
        proof_url: proofUrl,
        ai_label: prediction.label,
        ai_confidence: prediction.confidence_pct / 100,
        status: decision.status,
        reviewed_by: decision.status === 'approved' ? 'AI Auto-Approval' : null,
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

      persisted = true;
    }

    return NextResponse.json({
      prediction,
      decision,
      expected_label: normalizedExpected,
      label_matches: labelMatches,
      submission_id: submissionId,
      proof_url: proofUrl,
      persisted,
      message: persisted
        ? 'AI verification saved to Supabase.'
        : 'AI verification ran in demo mode. Add Supabase keys to persist it.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }
}
