import { NextResponse } from 'next/server';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';
import { challenges as seedChallenges } from '@/lib/ecoquest-data';
import { logActivity } from '@/lib/admin-activity';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const supabase = maybeCreateServerSupabaseClient();

  const updates = { ...body };
  if (updates.points_value != null) updates.points_value = Number(updates.points_value);

  if (supabase) {
    const { data, error } = await supabase
      .from('challenges')
      .update(updates)
      .eq('challenge_id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    logActivity({
      event_type: 'challenge_updated',
      target_id: id,
      target_type: 'challenge',
      metadata: { title: data.title },
    });
    return NextResponse.json({ challenge: data });
  }

  const idx = seedChallenges.findIndex((c) => c.challenge_id === id);
  if (idx === -1) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });

  seedChallenges[idx] = { ...seedChallenges[idx], ...updates };
  logActivity({
    event_type: 'challenge_updated',
    target_id: id,
    target_type: 'challenge',
    metadata: { title: seedChallenges[idx].title },
  });
  return NextResponse.json({ challenge: seedChallenges[idx] });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const { error } = await supabase.from('challenges').delete().eq('challenge_id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    logActivity({ event_type: 'challenge_deleted', target_id: id, target_type: 'challenge', metadata: {} });
    return NextResponse.json({ deleted: true });
  }

  const idx = seedChallenges.findIndex((c) => c.challenge_id === id);
  if (idx === -1) return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
  const [removed] = seedChallenges.splice(idx, 1);
  logActivity({
    event_type: 'challenge_deleted',
    target_id: id,
    target_type: 'challenge',
    metadata: { title: removed.title },
  });
  return NextResponse.json({ deleted: true });
}
