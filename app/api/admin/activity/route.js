import { NextResponse } from 'next/server';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';
import { activityLog, logActivity } from '@/lib/admin-activity';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100);
  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Use DB data if available; otherwise fall through to in-memory seed
    if (!error && data && data.length > 0) {
      return NextResponse.json({ events: data });
    }
  }

  return NextResponse.json({ events: activityLog.slice(0, limit) });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { event_type, actor_id, target_id, target_type, metadata } = body;

  if (!event_type) {
    return NextResponse.json({ error: 'event_type is required' }, { status: 400 });
  }

  const entry = logActivity({ event_type, actor_id, target_id, target_type, metadata });

  const supabase = maybeCreateServerSupabaseClient();
  if (supabase) {
    await supabase.from('activity_logs').insert({ ...entry }).catch(() => {});
  }

  return NextResponse.json({ event: entry }, { status: 201 });
}
