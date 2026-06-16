import { NextResponse } from 'next/server';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';
import { challenges as seedChallenges } from '@/lib/ecoquest-data';
import { logActivity } from '@/lib/admin-activity';

export async function GET() {
  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ challenges: data ?? [] });
  }

  return NextResponse.json({ challenges: [...seedChallenges] });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { title, description, proof_type, points_value, difficulty, cadence, category, deadline } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const supabase = maybeCreateServerSupabaseClient();
  const now = new Date().toISOString();
  const challengePayload = {
    challenge_id: `CH-${String(Date.now()).slice(-7)}`,
    title: title.trim(),
    description: (description ?? '').trim(),
    proof_type: proof_type ?? 'photo',
    points_value: Number(points_value ?? 10),
    milestone_points: Number(points_value ?? 10),
    difficulty: difficulty ?? 'medium',
    cadence: cadence ?? 'daily',
    category: (category ?? 'recycling').trim(),
    deadline: deadline ?? new Date(Date.now() + 7 * 86_400_000).toISOString(),
    status: 'active',
    created_by: body.created_by ?? 'ADM-0001',
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('challenges')
      .insert({ ...challengePayload, created_at: now })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    logActivity({
      event_type: 'challenge_created',
      target_id: data.challenge_id,
      target_type: 'challenge',
      metadata: { title: data.title, points_value: data.points_value },
    });
    return NextResponse.json({ challenge: data }, { status: 201 });
  }

  // Demo fallback: mutate in-memory array (persists until server restart)
  const challenge = {
    ...challengePayload,
    challenge_id: `CH-${String(Date.now()).slice(-7)}`,
    created_at: now,
  };
  seedChallenges.unshift(challenge);
  logActivity({
    event_type: 'challenge_created',
    target_id: challenge.challenge_id,
    target_type: 'challenge',
    metadata: { title: challenge.title },
  });
  return NextResponse.json({ challenge }, { status: 201 });
}
