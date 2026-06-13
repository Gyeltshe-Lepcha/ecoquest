import { NextResponse } from 'next/server';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';

const DEFAULT_CURRENT_USER_ID = 'USR-0042';

function initialsFromName(name) {
  return String(name ?? 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
}

function normalizeProfile(profile, currentUserId) {
  return {
    user_id: profile.user_id,
    name: profile.name,
    campus: profile.campus || 'Unknown Campus',
    points: Number(profile.eco_points ?? 0),
    streak: Number(profile.streak_days ?? 0),
    avatar: profile.avatar || initialsFromName(profile.name),
    prevRank: Number(profile.current_rank ?? 0),
    isCurrentUser: profile.user_id === currentUserId,
    type: 'registered_user',
  };
}

function rankRows(rows) {
  return rows
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      prevRank: row.prevRank || index + 1,
    }));
}

function buildCampusLeaderboard(users) {
  const campusMap = new Map();

  for (const user of users) {
    const campusName = user.campus || 'Unknown Campus';
    const existing = campusMap.get(campusName) ?? {
      name: campusName,
      members: 0,
      points: 0,
      change: 'same',
    };

    existing.members += 1;
    existing.points += Number(user.points ?? 0);
    campusMap.set(campusName, existing);
  }

  return Array.from(campusMap.values())
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
    .map((campus, index) => ({
      ...campus,
      rank: index + 1,
    }));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const currentUserId = searchParams.get('current_user_id') || DEFAULT_CURRENT_USER_ID;
  const supabase = maybeCreateServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({
      connected: false,
      error: 'Supabase server credentials are not configured.',
      current_user_id: currentUserId,
      individual: [],
      campus: [],
    });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, name, campus, eco_points, streak_days, avatar, current_rank, role')
    .eq('role', 'user')
    .order('eco_points', { ascending: false });

  if (error) {
    return NextResponse.json(
      {
        connected: true,
        error: error.message,
        current_user_id: currentUserId,
        individual: [],
        campus: [],
      },
      { status: 500 },
    );
  }

  const individual = rankRows((data ?? []).map((profile) => normalizeProfile(profile, currentUserId)));
  const campus = buildCampusLeaderboard(individual);

  return NextResponse.json({
    connected: true,
    error: null,
    current_user_id: currentUserId,
    individual,
    campus,
  });
}
