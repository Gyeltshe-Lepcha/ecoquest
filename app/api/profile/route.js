import { NextResponse } from 'next/server';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';
import { users } from '@/lib/ecoquest-data';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'user_id query param is required.' }, { status: 400 });
  }

  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_id, name, email, phone, campus, eco_points, streak_days, avatar, role, level, created_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    return NextResponse.json({
      user_id: profile.user_id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      campus: profile.campus,
      eco_points: Number(profile.eco_points ?? 0),
      streak_days: Number(profile.streak_days ?? 0),
      avatar: profile.avatar,
      role: profile.role,
      level: profile.level,
      created_at: profile.created_at,
    });
  }

  // Demo fallback — search in-memory array
  const user = users.find((u) => u.user_id === userId);
  if (!user) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
  }

  return NextResponse.json({
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    campus: user.campus,
    eco_points: Number(user.total_points ?? 0),
    streak_days: Number(user.streak_days ?? 0),
    avatar: user.avatar,
    role: user.role,
    level: 1,
    created_at: user.created_at,
  });
}
