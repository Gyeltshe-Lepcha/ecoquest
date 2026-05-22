import { NextResponse } from 'next/server';
import {
  submissions,
  submissionView,
  verificationStatusFromConfidence,
} from '@/lib/ecoquest-data';
import { maybeCreateServerSupabaseClient } from '@/lib/supabase/server';

function supabaseSubmissionView(submission) {
  return {
    ...submission,
    ai_confidence_pct: Math.round(Number(submission.ai_confidence ?? 0) * 100),
    challenge_title: submission.challenges?.title ?? 'Unknown challenge',
    points_value: submission.challenges?.points_value ?? 0,
    proof_type: submission.challenges?.proof_type ?? 'photo',
    user: submission.profiles
      ? {
          user_id: submission.user_id,
          name: submission.profiles.name,
          email: submission.profiles.email,
          phone: submission.profiles.phone,
          campus: submission.profiles.campus,
          role: submission.profiles.role,
          avatar: submission.profiles.avatar,
          total_points: submission.profiles.eco_points,
          streak_days: submission.profiles.streak_days,
        }
      : null,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    let query = supabase
      .from('submissions')
      .select('*, challenges(title, points_value, proof_type), profiles(name, email, phone, campus, role, avatar, eco_points, streak_days)')
      .order('submitted_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ submissions: data.map(supabaseSubmissionView) });
  }

  const filtered = submissions
    .filter((submission) => (status ? submission.status === status : true))
    .map(submissionView);

  return NextResponse.json({ submissions: filtered });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { user_id, challenge_id, proof_url } = body;

  if (!user_id || !challenge_id) {
    return NextResponse.json({ error: 'user_id and challenge_id are required.' }, { status: 400 });
  }

  const confidencePct = Number(body.ai_confidence_pct ?? 72);
  const decision = verificationStatusFromConfidence(confidencePct);
  const supabase = maybeCreateServerSupabaseClient();

  if (supabase) {
    const submissionId = `SUB-${Date.now()}`;

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        submission_id: submissionId,
        user_id,
        challenge_id,
        proof_url: proof_url ?? null,
        ai_label: body.ai_label ?? null,
        ai_confidence: confidencePct / 100,
        status: decision.status,
        reviewed_by: decision.status === 'approved' ? 'AI Auto-Approval' : null,
      })
      .select('*, challenges(title, points_value, proof_type), profiles(name, email, phone, campus, role, avatar, eco_points, streak_days)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        submission: supabaseSubmissionView(data),
        decision,
      },
      { status: 201 },
    );
  }

  const submission = {
    submission_id: `SUB-${String(submissions.length + 1001).padStart(4, '0')}`,
    user_id,
    challenge_id,
    proof_url: proof_url ?? '/placeholder.jpg',
    ai_confidence: confidencePct / 100,
    status: decision.status,
    reviewed_by: decision.status === 'approved' ? 'AI Auto-Approval' : null,
    submitted_at: new Date().toISOString(),
  };

  submissions.unshift(submission);

  return NextResponse.json(
    {
      submission: submissionView(submission),
      decision,
    },
    { status: 201 },
  );
}
