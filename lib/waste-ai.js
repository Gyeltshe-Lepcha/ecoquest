// ── Points and supported labels ───────────────────────────────────────────────

export const POINTS_BY_LABEL = {
  can:     30,
  bottle:  25,
  plastic: 20,
  paper:   15,
};

export const SUPPORTED_WASTE_LABELS = Object.keys(POINTS_BY_LABEL);

export const CONFIDENCE_THRESHOLD = 0.70;

const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite').replace(/^models\//, '');

// ── Gemini Vision classification ──────────────────────────────────────────────

const GEMINI_PROMPT = `You are a waste classifier for a smart recycling bin system.
Look at the image and classify the waste item into exactly one of these four categories:

- bottle  : any bottle (plastic bottle, glass bottle, water bottle, beverage bottle)
- plastic : plastic bags, plastic wrappers, plastic packaging, plastic trays, or any plastic container that is NOT a bottle
- paper   : paper, cardboard, newspaper, tissue, paper boxes, cartons
- can     : metal cans, aluminium cans, tin cans, soda cans

Respond with ONLY a valid JSON object and nothing else:
{"label":"<bottle|plastic|paper|can>","confidence_pct":<integer 50-100>}

If no waste item is clearly visible, or the item does not belong to the four categories, respond with:
{"label":"unrecognized","confidence_pct":0}`;

export async function predictImageBlob(imageBlob, filename = 'waste_capture.jpg') {
  if (!imageBlob) {
    throw new Error('No image provided for AI verification.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Add it to your .env file.');
  }

  const bytes = await imageBlob.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const mimeType = imageBlob.type || 'image/jpeg';

  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: GEMINI_PROMPT },
              { inline_data: { mime_type: mimeType, data: base64 } },
            ],
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 64,
            temperature: 0,
          },
        }),
      },
    );
  } catch (err) {
    throw new Error(`Gemini API request failed: ${err.message}`);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini API error ${response.status}: ${body?.error?.message ?? 'Unknown error'}`,
    );
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

  let parsed;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    throw new Error(`Gemini returned unexpected response: ${text}`);
  }

  return normalizePrediction({ ...parsed, source: GEMINI_MODEL });
}

export async function predictImageFile(imageFile) {
  if (!imageFile || typeof imageFile.arrayBuffer !== 'function') {
    throw new Error('Upload an image file before running AI verification.');
  }
  return predictImageBlob(imageFile, imageFile.name || 'proof-image.jpg');
}

// ── Normalisation ─────────────────────────────────────────────────────────────

export function normalizePrediction(payload) {
  const label = String(payload?.label ?? 'unrecognized').toLowerCase();
  const confidence = Number(payload?.confidence_pct ?? 0);
  const confidencePct = confidence <= 1
    ? Math.round(confidence * 100)
    : Math.round(confidence);

  return {
    label,
    confidence_pct: Math.min(100, Math.max(0, confidencePct)),
    probabilities: payload?.probabilities ?? null,
    source: payload?.source ?? GEMINI_MODEL,
  };
}

// ── Verification decision ─────────────────────────────────────────────────────

export function createVerificationDecision(prediction, expectedLabel) {
  const rawExpected = expectedLabel
    ? String(expectedLabel).trim().toLowerCase()
    : null;
  const normalizedExpected = rawExpected && !['any', 'any item', 'any supported item'].includes(rawExpected)
    ? rawExpected
    : null;
  const detectedLabel = String(prediction?.label ?? 'unrecognized').trim().toLowerCase();
  const confidencePct = Math.min(100, Math.max(0, Number(prediction?.confidence_pct ?? 0)));
  const confidence = confidencePct / 100;
  const pointsAwarded = POINTS_BY_LABEL[detectedLabel] ?? 0;

  if (!SUPPORTED_WASTE_LABELS.includes(detectedLabel)) {
    return {
      normalizedExpected,
      labelMatches: false,
      detected_label: 'unrecognized',
      confidence,
      confidence_pct: confidencePct,
      points_awarded: 0,
      decision: {
        status: 'rejected',
        message: 'Unrecognized item. Only bottle, plastic, paper, and can are accepted.',
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
        message: 'Confidence too low. Try again with better lighting.',
      },
    };
  }

  const labelMatches = !normalizedExpected || detectedLabel === normalizedExpected;

  return {
    normalizedExpected,
    labelMatches,
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

// ── Proof image upload ────────────────────────────────────────────────────────

export async function uploadProofBlob(supabase, imageBlob, userId, filename = 'waste_capture.jpg') {
  if (!supabase || !imageBlob) return null;

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

  if (error) throw new Error(`Proof upload failed: ${error.message}`);

  return `${bucket}/${storagePath}`;
}

export async function uploadProofFile(supabase, imageFile, userId) {
  return uploadProofBlob(supabase, imageFile, userId, imageFile?.name || 'proof-image.jpg');
}

// ── Label helpers ─────────────────────────────────────────────────────────────

export function expectedLabelFromText(text) {
  const value = String(text ?? '').toLowerCase();
  if (value.includes('bottle'))  return 'bottle';
  if (value.includes('plastic')) return 'plastic';
  if (value.includes('paper'))   return 'paper';
  if (value.includes('can'))     return 'can';
  return null;
}

export function expectedLabelFromChallenge(challenge) {
  if (!challenge) return null;
  if (challenge.target_label)   return String(challenge.target_label).toLowerCase();
  if (challenge.expected_label) return String(challenge.expected_label).toLowerCase();
  return expectedLabelFromText(
    `${challenge.title ?? ''} ${challenge.description ?? ''} ${challenge.category ?? ''}`,
  );
}
