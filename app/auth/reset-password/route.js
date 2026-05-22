import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const destination = body.email || body.phone;

  if (!destination) {
    return NextResponse.json({ error: 'Email or phone number is required.' }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    delivery: body.phone ? 'otp' : 'email',
    message: 'Password reset instructions have been queued for the prototype.',
  });
}
