import { NextResponse } from 'next/server';
import { publicUser, users } from '@/lib/ecoquest-data';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { email, phone } = body;

  const user = users.find((candidate) => candidate.email === email || candidate.phone === phone);

  if (!user) {
    return NextResponse.json({ error: 'Invalid login credentials.' }, { status: 401 });
  }

  return NextResponse.json({
    user: publicUser(user),
    token: `demo.jwt.${user.user_id}.${user.role}`,
    expires_in: 86400,
  });
}
