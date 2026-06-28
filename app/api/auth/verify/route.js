import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/?verified=false&error=missing_token', request.url));
    }

    const stmt = db.prepare('SELECT * FROM users WHERE verification_token = ?');
    const user = stmt.get(token);

    if (!user) {
      return NextResponse.redirect(new URL('/?verified=false&error=invalid_token', request.url));
    }

    const updateStmt = db.prepare('UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?');
    updateStmt.run(user.id);

    return NextResponse.redirect(new URL('/?verified=true', request.url));

  } catch (error) {
    console.error('Verification API Error:', error);
    return NextResponse.redirect(new URL('/?verified=false&error=server_error', request.url));
  }
}
