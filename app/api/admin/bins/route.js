import { NextResponse } from 'next/server';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';
import { smartBins } from '@/lib/ecoquest-data';

export async function GET() {
  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('smart_bins')
      .select('*')
      .order('fill_level_pct', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ bins: data ?? [] });
  }

  return NextResponse.json({ bins: smartBins });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { bin_id, location_name, campus } = body;

  if (!bin_id?.trim() || !location_name?.trim()) {
    return NextResponse.json({ error: 'bin_id and location_name are required' }, { status: 400 });
  }

  const supabase = maybeCreateServerSupabaseClient();
  const newBin = {
    bin_id: bin_id.trim(),
    location_name: location_name.trim(),
    campus: campus?.trim() ?? null,
    fill_level_pct: 0,
    is_full: false,
    online: false,
    total_deposits: 0,
    battery_level_pct: 100,
    last_synced_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase.from('smart_bins').insert(newBin).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ bin: data }, { status: 201 });
  }

  smartBins.push(newBin);
  return NextResponse.json({ bin: newBin }, { status: 201 });
}
