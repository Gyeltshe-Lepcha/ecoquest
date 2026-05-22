import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    ok: true,
    message: 'Demo session invalidated. A production build should revoke or expire the JWT.',
  });
}
