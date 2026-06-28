import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { cookies } from 'next/headers';

// Trigger hot-reload helper
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Заповніть усі поля' }, { status: 400 });
    }

    const checkRes = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = checkRes.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'Невірна пошта або пароль' }, { status: 400 });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Невірна пошта або пароль' }, { status: 400 });
    }

    // Check if verified
    if (user.is_verified === 0) {
      return NextResponse.json({ error: 'Будь ласка, підтвердіть вашу пошту перед входом. Ми надіслали лист на вашу пошту.' }, { status: 400 });
    }

    // Set cookie
    cookies().set('user_session', user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    return NextResponse.json({
      success: true,
      message: 'Вхід успішний!',
      user: { email: user.email }
    });

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Сталася помилка на сервері' }, { status: 500 });
  }
}
