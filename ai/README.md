# EcoQuest AI — Gemini Vision

Waste classification is handled by **Gemini 2.5 Flash Lite** (Google AI), called directly
from the Next.js server. No Python service or local model file is required.

## Setup

1. Get a free API key at Google AI Studio.
2. Add it to `.env`:
   ```
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-2.5-flash-lite
   ```
3. Restart `npm run dev`.

The classification runs automatically inside `GET /api/capture` whenever the
ESP32-CAM captures an image. The result flows back to the dashboard within ~1 second.

## Supported waste classes

| Label   | EcoPoints |
|---------|-----------|
| bottle  | 25        |
| paper   | 20        |
| plastic | 15        |
| can     | 30        |

## Files

- `devkit_firmware.ino` — ESP32 DevKit firmware (upload via Arduino IDE)
- `models/` — reserved for future local model (currently empty)
