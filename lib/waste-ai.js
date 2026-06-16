export const defaultPrediction = {
  label: 'plastic',
  confidence_pct: 91,
  probabilities: null,
  source: 'demo-fallback',
};

export const CONFIDENCE_THRESHOLD = 0.70;

export const POINTS_BY_LABEL = {
  bottle: 25,
  paper: 20,
  plastic: 15,
};

export const SUPPORTED_WASTE_LABELS = Object.keys(POINTS_BY_LABEL);

export function normalizePrediction(payload) {
  const label = String(payload?.label ?? payload?.class ?? defaultPrediction.label).toLowerCase();
  const confidence = Number(payload?.confidence_pct ?? payload?.confidence ?? defaultPrediction.confidence_pct);
  const confidencePct = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);

  return {
    label,
    confidence_pct: Math.min(100, Math.max(0, confidencePct)),
    probabilities: payload?.probabilities ?? null,
    source: payload?.source ?? 'model-service',
  };
}

export async function predictImageBlob(imageBlob, filename = 'waste_capture.jpg') {
  const inferenceUrl = process.env.AI_INFERENCE_URL;

  if (!imageBlob) {
    throw new Error('Upload or capture an image before running AI verification.');
  }

  if (!inferenceUrl) {
    throw new Error('AI_INFERENCE_URL is missing. Start the model service or add it to your env file.');
  }

  const formData = new FormData();
  formData.append('image', imageBlob, filename);

  let response;
  try {
    response = await fetch(`${inferenceUrl.replace(/\/$/, '')}/predict`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new Error('AI model service is not running. Start it with: python ai/inference_service.py');
  }

  if (!response.ok) {
    throw new Error(`AI service returned ${response.status}.`);
  }

  return normalizePrediction(await response.json());
}

export async function predictImageFile(imageFile) {
  if (!imageFile || typeof imageFile.arrayBuffer !== 'function') {
    throw new Error('Upload an image file before running AI verification.');
  }

  return predictImageBlob(imageFile, imageFile.name || 'proof-image.jpg');
}

export async function uploadProofBlob(supabase, imageBlob, userId, filename = 'waste_capture.jpg') {
  if (!supabase || !imageBlob) {
    return null;
  }

  const bucket = process.env.SUPABASE_PROOF_BUCKET ?? 'proof-images';
  const extension = filename.split('.').pop() || 'jpg';
  const storagePath = `${userId || 'anonymous'}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const bytes = await imageBlob.arrayBuffer();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, bytes, {
      contentType: imageBlob.type || 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw new Error(`Proof upload failed: ${error.message}`);
  }

  return `${bucket}/${storagePath}`;
}

export async function uploadProofFile(supabase, imageFile, userId) {
  return uploadProofBlob(supabase, imageFile, userId, imageFile?.name || 'proof-image.jpg');
}

export function createVerificationDecision(prediction, expectedLabel) {
  const normalizedExpected = expectedLabel ? String(expectedLabel).trim().toLowerCase() : null;
  const detectedLabel = String(prediction?.label ?? 'unknown').trim().toLowerCase();
  const confidencePct = Math.min(100, Math.max(0, Number(prediction?.confidence_pct ?? 0)));
  const confidence = confidencePct / 100;
  const pointsAwarded = POINTS_BY_LABEL[detectedLabel] ?? 0;

  if (!SUPPORTED_WASTE_LABELS.includes(detectedLabel)) {
    return {
      normalizedExpected,
      labelMatches: false,
      detected_label: detectedLabel,
      confidence,
      confidence_pct: confidencePct,
      points_awarded: 0,
      decision: {
        status: 'rejected',
        message: 'Unsupported item detected.',
      },
    };
  }

  if (confidence < CONFIDENCE_THRESHOLD) {
    return {
      normalizedExpected,
      labelMatches: false,
      detected_label: detectedLabel,
      confidence,
      confidence_pct: confidencePct,
      points_awarded: 0,
      decision: {
        status: 'rejected',
        message: 'Confidence too low. Try again.',
      },
    };
  }

  return {
    normalizedExpected,
    labelMatches: true,
    detected_label: detectedLabel,
    confidence,
    confidence_pct: confidencePct,
    points_awarded: pointsAwarded,
    decision: {
      status: 'approved',
      message: `${detectedLabel.charAt(0).toUpperCase() + detectedLabel.slice(1)} detected. +${pointsAwarded} EcoPoints.`,
    },
  };
}

export function expectedLabelFromText(text) {
  const value = String(text ?? '').toLowerCase();

  if (value.includes('bottle')) return 'bottle';
  if (value.includes('plastic')) return 'plastic';
  if (value.includes('paper')) return 'paper';
  if (value.includes('unknown')) return 'unknown';

  return null;
}

export function expectedLabelFromChallenge(challenge) {
  if (!challenge) return null;

  if (challenge.target_label) return String(challenge.target_label).toLowerCase();
  if (challenge.expected_label) return String(challenge.expected_label).toLowerCase();

  return expectedLabelFromText(`${challenge.title ?? ''} ${challenge.description ?? ''} ${challenge.category ?? ''}`);
}
