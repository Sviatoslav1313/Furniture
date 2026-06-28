import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/?verified=false&error=missing_token', request.url));
    }

    const checkRes = await db.query('SELECT * FROM users WHERE verification_token = $1', [token]);
    const user = checkRes.rows[0];

    if (!user) {
      return NextResponse.redirect(new URL('/?verified=false&error=invalid_token', request.url));
    }

    await db.query('UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = $1', [user.id]);

    return NextResponse.redirect(new URL('/?verified=true', request.url));

  } catch (error) {
    console.error('Verification API Error:', error);
    return NextResponse.redirect(new URL('/?verified=false&error=server_error', request.url));
  }
}
