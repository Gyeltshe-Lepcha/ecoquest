const COMMAND_TIMEOUT_MS = 6000;

export function getDevkitMode(body = {}) {
  return String(body.devkit_mode || body.devkitMode || process.env.IOT_DEVKIT_MODE || 'polling').toLowerCase();
}

function withStartChallengePath(url) {
  if (!url) return '';

  const trimmed = String(url).trim().replace(/\/$/, '');
  return trimmed.endsWith('/start-challenge') ? trimmed : `${trimmed}/start-challenge`;
}

function resolveBackendLogUrl(body) {
  const explicitUrl = body.backend_url || body.backendUrl || process.env.IOT_BACKEND_URL;
  if (explicitUrl) return String(explicitUrl).replace(/\/$/, '');

  const publicBaseUrl = process.env.PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (publicBaseUrl) return `${String(publicBaseUrl).replace(/\/$/, '')}/log-waste`;

  return '';
}

export async function sendMissionToDevkit({ mission, body = {} }) {
  const commandUrl = withStartChallengePath(body.devkit_command_url || body.devkitCommandUrl || process.env.ESP32_DEVKIT_COMMAND_URL);

  if (!commandUrl) {
    return {
      status: 'not_configured',
      message: 'Set ESP32_DEVKIT_COMMAND_URL to command the physical ESP32 DevKit. Mission is waiting for the next /log-waste event.',
    };
  }

  const backendUrl = resolveBackendLogUrl(body);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), COMMAND_TIMEOUT_MS);

  try {
    const payload = {
      event: 'start_challenge',
      mission_id: mission.mission_id,
      user_id: mission.user_id,
      challenge_id: mission.challenge_id,
      challenge_title: mission.challenge_title,
      expected_label: mission.expected_label,
      bin_id: mission.bin_id,
      backend_url: backendUrl,
      esp32_cam_capture_url: body.esp32_cam_capture_url || body.esp32CamCaptureUrl || process.env.ESP32_CAM_CAPTURE_URL || '',
      points_awarded: mission.points_awarded ?? 5,
    };

    const headers = {
      'Content-Type': 'application/json',
    };
    const token = process.env.IOT_DEVICE_TOKEN;
    if (token) {
      headers['x-device-token'] = token;
    }

    const response = await fetch(commandUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: controller.signal,
    });

    const responseText = await response.text().catch(() => '');

    if (!response.ok) {
      return {
        status: 'failed',
        message: `ESP32 DevKit returned HTTP ${response.status}. Check its IP address and /start-challenge handler.`,
        http_status: response.status,
        url: commandUrl,
        response: responseText.slice(0, 500),
      };
    }

    return {
      status: 'commanded',
      message: 'Mission sent to ESP32 DevKit. Waiting for ultrasonic person detection, IR waste detection, then camera capture.',
      http_status: response.status,
      url: commandUrl,
      response: responseText.slice(0, 500),
    };
  } catch (error) {
    return {
      status: 'failed',
      message: error.name === 'AbortError'
        ? 'ESP32 DevKit command timed out. Confirm the DevKit IP and Wi-Fi network.'
        : `ESP32 DevKit command failed: ${error.message}`,
      url: commandUrl,
    };
  } finally {
    clearTimeout(timeout);
  }
}
