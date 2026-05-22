import { NextResponse } from 'next/server';
import { challenges } from '@/lib/ecoquest-data';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const proofType = searchParams.get('proof_type');

  const filtered = challenges.filter((challenge) => {
    const statusMatches = status ? challenge.status === status : true;
    const proofMatches = proofType ? challenge.proof_type === proofType : true;

    return statusMatches && proofMatches;
  });

  return NextResponse.json({ challenges: filtered });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { title, description, proof_type, points_value, difficulty, deadline } = body;

  if (!title || !description || !proof_type || !points_value || !difficulty || !deadline) {
    return NextResponse.json({ error: 'Missing required challenge fields.' }, { status: 400 });
  }

  const challenge = {
    challenge_id: `CH-${String(challenges.length + 1).padStart(3, '0')}`,
    title,
    description,
    proof_type,
    points_value: Number(points_value),
    difficulty,
    deadline,
    cadence: body.cadence ?? 'daily',
    category: body.category ?? 'general',
    status: 'active',
    created_by: body.created_by ?? 'ADM-0001',
  };

  challenges.push(challenge);

  return NextResponse.json({ challenge }, { status: 201 });
}
