import { NextResponse } from 'next/server';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';
import { smartBins } from '@/lib/ecoquest-data';
import { logActivity } from '@/lib/admin-activity';

export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.from('smart_bins').select('*').eq('bin_id', id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ bin: data });
  }

  const bin = smartBins.find((b) => b.bin_id === id);
  if (!bin) return NextResponse.json({ error: 'Bin not found' }, { status: 404 });
  return NextResponse.json({ bin });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('smart_bins')
      .update({ ...body, last_synced_at: new Date().toISOString() })
      .eq('bin_id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (data.fill_level_pct >= 80) {
      logActivity({
        event_type: 'bin_alert',
        actor_id: 'system',
        target_id: id,
        target_type: 'bin',
        metadata: { fill_level_pct: data.fill_level_pct, location: data.location_name },
      });
    }
    return NextResponse.json({ bin: data });
  }

  const idx = smartBins.findIndex((b) => b.bin_id === id);
  if (idx === -1) return NextResponse.json({ error: 'Bin not found' }, { status: 404 });
  smartBins[idx] = { ...smartBins[idx], ...body, last_synced_at: new Date().toISOString() };
  return NextResponse.json({ bin: smartBins[idx] });
}
