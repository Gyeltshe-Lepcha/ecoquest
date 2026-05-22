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

    const timestamp = body.timestamp ?? new Date().toISOString();
    const fillLevel = Number(body.fill_level_pct ?? bin.fill_level_pct);

    const { data: updatedBin, error: updateError } = await supabase
      .from('smart_bins')
      .update({
        fill_level_pct: fillLevel,
        last_deposit_at: timestamp,
        user_id_last: body.user_qr_code ?? body.user_id ?? bin.user_id_last,
        is_full: fillLevel >= 80,
        last_synced_at: new Date().toISOString(),
        online: true,
        total_deposits: Number(bin.total_deposits ?? 0) + 1,
      })
      .eq('bin_id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      bin: updatedBin,
      points_awarded: body.deposit_event === false ? 0 : 5,
      message: 'Deposit logged and linked to the user QR/NFC identity.',
    });
  }

  const bin = smartBins.find((candidate) => candidate.bin_id === id);

  if (!bin) {
    return NextResponse.json({ error: 'Smart bin not found.' }, { status: 404 });
  }

  const timestamp = body.timestamp ?? new Date().toISOString();
  const fillLevel = Number(body.fill_level_pct ?? bin.fill_level_pct);

  Object.assign(bin, {
    fill_level_pct: fillLevel,
    last_deposit_at: timestamp,
    user_id_last: body.user_qr_code ?? body.user_id ?? bin.user_id_last,
    is_full: fillLevel >= 80,
    last_synced_at: new Date().toISOString(),
    online: true,
    total_deposits: bin.total_deposits + 1,
  });

  return NextResponse.json({
    bin,
    points_awarded: body.deposit_event === false ? 0 : 5,
    message: 'Deposit logged and linked to the user QR/NFC identity.',
  });
}
