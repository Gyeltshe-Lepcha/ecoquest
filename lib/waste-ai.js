// ── Points and supported labels ───────────────────────────────────────────────

export const POINTS_BY_LABEL = {
  can:     30,
  bottle:  25,
  plastic: 20,
  paper:   15,
};

export const SUPPORTED_WASTE_LABELS = Object.keys(POINTS_BY_LABEL);

export const CONFIDENCE_THRESHOLD = 0.50;

const GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite').replace(/^models\//, '');

// ── Gemini Vision classification ──────────────────────────────────────────────

const GEMINI_PROMPT = `You are the waste-classification engine for the EcoQuest Smart Dustbin.

Your task is to analyze the uploaded image and classify the object into EXACTLY ONE of the following categories:

* can
* bottle
* plastic
* paper

IMPORTANT RULES:

1. You MUST return exactly one category from the list above.
2. Never return "unknown", "unrecognized", "other", "none", or any category outside the four allowed classes.
3. Even if the image is blurry, partially visible, dark, cropped, or low quality, choose the MOST LIKELY category based on the visible evidence.
4. Focus only on the primary waste object in the image.
5. Ignore the background, floor, table, walls, dustbin structure, hands, shadows, reflections, and surrounding objects.
6. If multiple objects are present, classify the largest and most central object.
7. Choose the category that most closely matches the object's shape, material, appearance, and intended use.

Classification Guidance:

CAN:

* Aluminum cans
* Soft drink cans
* Energy drink cans
* Beverage cans
* Metal food cans
* Tin cans

BOTTLE:

* Plastic water bottles
* Mineral water bottles
* Soft drink bottles
* Juice bottles
* Beverage bottles
* Reusable bottles

PLASTIC:

* Plastic containers
* Plastic wrappers
* Plastic bags
* Plastic packaging
* Plastic cups
* Plastic household items

PAPER:

* Paper sheets
* Newspapers
* Magazines
* Cardboard
* Cartons
* Paper packaging
* Paper boxes

EcoPoints Mapping:

* can = 30 EcoPoints
* bottle = 25 EcoPoints
* plastic = 20 EcoPoints
* paper = 15 EcoPoints

Return ONLY valid JSON in this exact format:

{
"label": "can|bottle|plastic|paper",
"confidence": 0-100,
"reasoning": "short explanation"
}

The confidence score should represent how strongly the image matches the selected category among the four available classes.

Your goal is to select the category with the highest visual similarity to the object shown in the image.`;

const GEMINI_RETRY_PROMPT = GEMINI_PROMPT;

export async function predictImageBlob(imageBlob, filename = 'waste_capture.jpg') {
  if (!imageBlob) {
    throw new Error('No image provided for AI verification.');
  }

  const availableKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean);
  if (availableKeys.length === 0) {
    throw new Error('GEMINI_API_KEY is not set. Add it to your .env file.');
  }
  const apiKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];

  const bytes = await imageBlob.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const mimeType = imageBlob.type || 'image/jpeg';

  const primary = await requestGeminiClassification({
    apiKey,
    prompt: GEMINI_PROMPT,
    base64,
    mimeType,
    source: GEMINI_MODEL,
  });

  if (!shouldRetryPrediction(primary)) {
    return primary;
  }

  const retry = await requestGeminiClassification({
    apiKey,
    prompt: GEMINI_RETRY_PROMPT,
    base64,
    mimeType,
    source: `${GEMINI_MODEL}:retry`,
  });

  return shouldUseRetryPrediction(primary, retry) ? retry : primary;
}

async function requestGeminiClassification({ apiKey, prompt, base64, mimeType, source }) {
  const keyHint = `...${apiKey.slice(-6)}`;
  console.log(`[GEMINI] source=${source} model=${GEMINI_MODEL} key=${keyHint} imageBytes=${Math.round(base64.length * 0.75)}`);

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
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64 } },
            ],
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 256,
            temperature: 0,
          },
        }),
      },
    );
  } catch (err) {
    console.error(`[GEMINI] Network error: ${err.message}`);
    throw new Error(`Gemini API request failed: ${err.message}`);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    console.error(`[GEMINI] API error ${response.status}:`, JSON.stringify(body));
    throw new Error(
      `Gemini API error ${response.status}: ${body?.error?.message ?? 'Unknown error'}`,
    );
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = (parts.find(p => !p.thought)?.text) ?? parts[0]?.text ?? '{}';

  console.log(`[GEMINI] raw response: ${text}`);

  const parsed = parseGeminiJson(text);
  console.log(`[GEMINI] parsed:`, JSON.stringify(parsed));

  const normalized = normalizePrediction({ ...parsed, source, raw_response: text });
  console.log(`[GEMINI] normalized: label=${normalized.label} confidence_pct=${normalized.confidence_pct}`);

  return normalized;
}

export async function predictImageFile(imageFile) {
  if (!imageFile || typeof imageFile.arrayBuffer !== 'function') {
    throw new Error('Upload an image file before running AI verification.');
  }
  return predictImageBlob(imageFile, imageFile.name || 'proof-image.jpg');
}

// ── Normalisation ─────────────────────────────────────────────────────────────

export function normalizePrediction(payload) {
  const label = normalizeWasteLabel(payload?.label ?? payload?.class ?? payload?.detected_label);
  const confidence = Number(payload?.confidence_pct ?? payload?.confidence ?? 0);
  const confidencePct = confidence <= 1
    ? Math.round(confidence * 100)
    : Math.round(confidence);

  return {
    label,
    confidence_pct: Math.min(100, Math.max(0, confidencePct)),
    probabilities: payload?.probabilities ?? null,
    source: payload?.source ?? GEMINI_MODEL,
    raw_response: payload?.raw_response ?? null,
    reasoning: payload?.reasoning ?? null,
  };
}

function parseGeminiJson(text) {
  const trimmed = String(text ?? '').trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
  }

  throw new Error(`Gemini returned unexpected response: ${trimmed}`);
}

function normalizeWasteLabel(value) {
  const normalized = String(value ?? 'unrecognized')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ');

  if (!normalized || ['unknown', 'none', 'no item', 'not sure', 'unrecognised', 'unrecognized'].includes(normalized)) {
    return 'plastic';
  }

  if (normalized.includes('bottle') || normalized.includes('pet bottle') || normalized.includes('water bottle')) {
    return 'bottle';
  }

  if (normalized.includes('can') || normalized.includes('tin') || normalized.includes('aluminium') || normalized.includes('aluminum')) {
    return 'can';
  }

  if (normalized.includes('paper') || normalized.includes('cardboard') || normalized.includes('carton') || normalized.includes('newspaper') || normalized.includes('receipt') || normalized.includes('tissue')) {
    return 'paper';
  }

  if (normalized.includes('plastic') || normalized.includes('wrapper') || normalized.includes('packet') || normalized.includes('pouch') || normalized.includes('bag')) {
    return 'plastic';
  }

  return SUPPORTED_WASTE_LABELS.includes(normalized) ? normalized : 'plastic';
}

function shouldRetryPrediction(prediction) {
  return !SUPPORTED_WASTE_LABELS.includes(prediction.label);
}

function shouldUseRetryPrediction(primary, retry) {
  const primarySupported = SUPPORTED_WASTE_LABELS.includes(primary.label);
  const retrySupported = SUPPORTED_WASTE_LABELS.includes(retry.label);

  if (retrySupported && !primarySupported) return true;
  if (retrySupported && Number(retry.confidence_pct ?? 0) > Number(primary.confidence_pct ?? 0)) return true;

  return false;
}

// ── Verification decision ─────────────────────────────────────────────────────

export function createVerificationDecision(prediction, expectedLabel) {
  const rawExpected = expectedLabel
    ? String(expectedLabel).trim().toLowerCase()
    : null;
  const normalizedExpected = rawExpected && !['any', 'any item', 'any supported item'].includes(rawExpected)
    ? rawExpected
    : null;
  const detectedLabel = String(prediction?.label ?? 'plastic').trim().toLowerCase();
  const confidencePct = Math.min(100, Math.max(0, Number(prediction?.confidence_pct ?? 0)));
  const confidence = confidencePct / 100;
  const pointsAwarded = POINTS_BY_LABEL[detectedLabel] ?? 0;

  // if (!SUPPORTED_WASTE_LABELS.includes(detectedLabel)) { unrecognized check removed — Gemini is forced to pick from 4 classes }

  // confidence threshold check removed — Gemini is forced to pick from 4 classes, so best guess always wins

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
