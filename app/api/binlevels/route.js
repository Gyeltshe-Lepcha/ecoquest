import { NextResponse } from 'next/server';
import {
  DEFAULT_LEGACY_BIN_ID,
  setLegacyBinLevels,
} from '@/lib/iot-legacy-devkit';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const levels = setLegacyBinLevels({
    bin1: body.bin1,
    bin2: body.bin2,
  });
  const binId = body.bin_id ?? body.binId ?? DEFAULT_LEGACY_BIN_ID;
  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const { data: existingBin } = await supabase
      .from('smart_bins')
      .select('bin_id')
      .eq('bin_id', binId)
      .maybeSingle();

    if (existingBin) {
      const { error } = await supabase
        .from('smart_bins')
        .update({
          fill_level_pct: levels.fill_level_pct,
          is_full: levels.fill_level_pct >= 80,
          online: true,
          last_synced_at: new Date().toISOString(),
        })
        .eq('bin_id', binId);

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    bin_id: binId,
    levels,
  });
}
