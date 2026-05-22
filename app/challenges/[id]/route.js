import { NextResponse } from 'next/server';
import { challengeById, challenges } from '@/lib/ecoquest-data';

export async function GET(_request, { params }) {
  const { id } = await params;
  const challenge = challengeById(id);

  if (!challenge) {
    return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 });
  }

  return NextResponse.json({ challenge });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const challenge = challengeById(id);

  if (!challenge) {
    return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  Object.assign(challenge, {
    ...body,
    points_value: body.points_value ? Number(body.points_value) : challenge.points_value,
  });

  return NextResponse.json({ challenge });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const index = challenges.findIndex((challenge) => challenge.challenge_id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 });
  }

  const [deleted] = challenges.splice(index, 1);

  return NextResponse.json({ deleted });
}
