import { getLegacyDevkitState } from '@/lib/iot-legacy-devkit';

export const runtime = 'nodejs';

export async function GET() {
  const state = getLegacyDevkitState();
  const section = state.classification?.section ?? 'UNKNOWN';

  return new Response(section, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
