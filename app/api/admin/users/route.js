import { NextResponse } from 'next/server';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';
import { users, publicUser } from '@/lib/ecoquest-data';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    let query = supabase
      .from('profiles')
      .select('user_id, name, email, campus, hostel, role, avatar, eco_points, streak_days, current_rank, created_at')
      .order('eco_points', { ascending: false });

    if (role && role !== 'all') query = query.eq('role', role);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ users: data ?? [] });
  }

  const filtered = users
    .filter((u) => !role || role === 'all' || u.role === role)
    .map(publicUser);
  return NextResponse.json({ users: filtered });
}
