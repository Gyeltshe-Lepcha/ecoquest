import { NextResponse } from 'next/server';
import { smartBins } from '@/lib/ecoquest-data';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('smart_bins')
      .select('*')
      .order('bin_id', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bins: data });
  }

  return NextResponse.json({ bins: smartBins });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { bin_id, location_name } = body;
  const fillLevel = Number(body.fill_level_pct ?? 0);

  if (!bin_id || !location_name) {
    return NextResponse.json({ error: 'bin_id and location_name are required.' }, { status: 400 });
  }

  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('smart_bins')
      .insert({
        bin_id,
        location_name,
        fill_level_pct: fillLevel,
        is_full: fillLevel >= 80,
        battery_level_pct: Number(body.battery_level_pct ?? 100),
        online: true,
        total_deposits: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bin: data }, { status: 201 });
  }

  if (smartBins.some((bin) => bin.bin_id === bin_id)) {
    return NextResponse.json({ error: 'A bin with this ID already exists.' }, { status: 409 });
  }

  const bin = {
    bin_id,
    location_name,
    fill_level_pct: fillLevel,
    last_deposit_at: null,
    user_id_last: null,
    is_full: fillLevel >= 80,
    last_synced_at: new Date().toISOString(),
    battery_level_pct: Number(body.battery_level_pct ?? 100),
    online: true,
    total_deposits: 0,
  };

  smartBins.push(bin);

  return NextResponse.json({ bin }, { status: 201 });
}
