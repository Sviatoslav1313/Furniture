import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const sessionCookie = cookies().get('user_session');

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: { email: sessionCookie.value }
  });
}
