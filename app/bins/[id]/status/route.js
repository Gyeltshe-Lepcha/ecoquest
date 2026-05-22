import { NextResponse } from 'next/server';
import { smartBins } from '@/lib/ecoquest-data';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const { data: bin, error: findError } = await supabase
      .from('smart_bins')
      .select('*')
      .eq('bin_id', id)
      .single();

    if (findError) {
      return NextResponse.json({ error: 'Smart bin not found.' }, { status: 404 });
    }

    const fillLevel = Number(body.fill_level_pct ?? bin.fill_level_pct);

    const { data: updatedBin, error: updateError } = await supabase
      .from('smart_bins')
      .update({
        fill_level_pct: fillLevel,
        is_full: fillLevel >= 80,
        battery_level_pct: Number(body.battery_level_pct ?? bin.battery_level_pct),
        online: true,
        last_synced_at: new Date().toISOString(),
      })
      .eq('bin_id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      bin: updatedBin,
      alert: fillLevel >= 80 ? 'Bin is above 80% full. Admin notification required.' : null,
    });
  }

  const bin = smartBins.find((candidate) => candidate.bin_id === id);

  if (!bin) {
    return NextResponse.json({ error: 'Smart bin not found.' }, { status: 404 });
  }

  const fillLevel = Number(body.fill_level_pct ?? bin.fill_level_pct);

  Object.assign(bin, {
    fill_level_pct: fillLevel,
    is_full: fillLevel >= 80,
    battery_level_pct: Number(body.battery_level_pct ?? bin.battery_level_pct),
    online: true,
    last_synced_at: new Date().toISOString(),
  });

  return NextResponse.json({
    bin,
    alert: fillLevel >= 80 ? 'Bin is above 80% full. Admin notification required.' : null,
  });
}
