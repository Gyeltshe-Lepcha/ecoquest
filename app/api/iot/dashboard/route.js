import { NextResponse } from 'next/server';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';

const labels = ['plastic', 'paper', 'bottle', 'unknown'];

function emptyCounts() {
  return {
    total: 0,
    plastic: 0,
    paper: 0,
    bottle: 0,
    unknown: 0,
  };
}

export async function GET() {
  const userId = 'USR-0042';
  const supabase = maybeCreateServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({
      connected: false,
      counts: emptyCounts(),
      latest: null,
      profile: { user_id: userId, eco_points: 320 },
    });
  }

  const [
    { data, error },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('detections')
      .select('waste_label, confidence, fill_level_pct, status, bin_id, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('profiles')
      .select('user_id, eco_points')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  if (error) {
    return NextResponse.json({ connected: true, error: error.message }, { status: 500 });
  }

  const counts = emptyCounts();
  for (const row of data) {
    const label = labels.includes(row.waste_label) ? row.waste_label : 'unknown';
    counts[label] += 1;
    counts.total += 1;
  }

  const latest = data[0]
    ? {
        label: data[0].waste_label,
        confidence_pct: Math.round(Number(data[0].confidence ?? 0) * 100),
        fill_level_pct: data[0].fill_level_pct ?? 0,
        status: data[0].status,
        bin_id: data[0].bin_id,
        created_at: data[0].created_at,
      }
    : null;

  return NextResponse.json({
    connected: true,
    counts,
    latest,
    profile: profile ?? { user_id: userId, eco_points: 320 },
  });
}
