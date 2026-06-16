import { NextResponse } from 'next/server';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';
import { submissions, users } from '@/lib/ecoquest-data';
import { POINTS_BY_LABEL } from '@/lib/waste-ai';
import { logActivity } from '@/lib/admin-activity';

function pointsForLabel(label) {
  return POINTS_BY_LABEL[String(label ?? '').toLowerCase()] ?? 10;
}

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { action, reason, actor_id = 'ADM-0001' } = body;

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 });
  }

  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*, challenges(title, points_value), profiles(eco_points, name)')
      .eq('submission_id', id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { error: fetchError?.message ?? 'Submission not found' },
        { status: 404 },
      );
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { error: `Submission is already "${submission.status}"` },
        { status: 409 },
      );
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const pointsToAward = action === 'approve' ? pointsForLabel(submission.ai_label) : 0;
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        status: newStatus,
        reviewed_by: actor_id,
        reviewed_at: now,
        rejection_reason: action === 'reject' ? (reason?.trim() || 'Rejected by admin') : null,
      })
      .eq('submission_id', id);

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

    if (pointsToAward > 0) {
      const currentPoints = Number(submission.profiles?.eco_points ?? 0);
      await supabase
        .from('profiles')
        .update({ eco_points: currentPoints + pointsToAward })
        .eq('user_id', submission.user_id);
    }

    const eventType = action === 'approve' ? 'submission_approved' : 'submission_rejected';
    const activityEntry = logActivity({
      event_type: eventType,
      actor_id,
      target_id: id,
      target_type: 'submission',
      metadata: {
        user_id: submission.user_id,
        user_name: submission.profiles?.name ?? null,
        challenge_title: submission.challenges?.title ?? null,
        points_awarded: pointsToAward,
        reason: reason ?? null,
      },
    });

    // Best-effort write to DB activity log (non-critical)
    await supabase.from('activity_logs').insert({ ...activityEntry }).catch(() => {});

    return NextResponse.json({
      ok: true,
      submission_id: id,
      new_status: newStatus,
      points_awarded: pointsToAward,
      reviewed_at: now,
    });
  }

  // Demo fallback: mutate in-memory submissions array
  const sub = submissions.find((s) => s.submission_id === id);
  if (!sub) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

  if (sub.status !== 'pending') {
    return NextResponse.json({ error: `Already "${sub.status}"` }, { status: 409 });
  }

  const pointsToAward = action === 'approve' ? pointsForLabel(sub.ai_label) : 0;
  const now = new Date().toISOString();

  sub.status = action === 'approve' ? 'approved' : 'rejected';
  sub.reviewed_by = actor_id;
  sub.reviewed_at = now;
  if (action === 'reject') sub.rejection_reason = reason?.trim() || 'Rejected by admin';

  if (pointsToAward > 0) {
    const user = users.find((u) => u.user_id === sub.user_id);
    if (user) user.total_points = (user.total_points ?? 0) + pointsToAward;
  }

  logActivity({
    event_type: action === 'approve' ? 'submission_approved' : 'submission_rejected',
    actor_id,
    target_id: id,
    target_type: 'submission',
    metadata: { points_awarded: pointsToAward, reason: reason ?? null },
  });

  return NextResponse.json({
    ok: true,
    submission_id: id,
    new_status: sub.status,
    points_awarded: pointsToAward,
    reviewed_at: now,
  });
}
