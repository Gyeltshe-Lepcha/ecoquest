import { NextResponse } from 'next/server';
import {
  DEFAULT_LEGACY_BIN_ID,
  getLegacyDevkitState,
  labelFromSection,
  setLegacyDashboardUpdate,
} from '@/lib/iot-legacy-devkit';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const wasteType = body.wasteType ?? body.waste_type ?? 'UNKNOWN';
  const latestLabel = getLegacyDevkitState().classification?.label;
  const wasteLabel = body.waste_label
    ?? body.wasteLabel
    ?? body.label
    ?? body.detected_label
    ?? (latestLabel && latestLabel !== 'unknown' ? latestLabel : labelFromSection(wasteType));
  const update = setLegacyDashboardUpdate({
    wasteType,
    waste_label: wasteLabel,
    bin_id: body.bin_id ?? body.binId ?? DEFAULT_LEGACY_BIN_ID,
    bin1: body.bin1 ?? null,
    bin2: body.bin2 ?? null,
    points: Number(body.points ?? 0),
  });

  return NextResponse.json({
    ok: true,
    dashboard: update,
  });
}
