import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Заповніть усі поля' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль має бути не менше 6 символів' }, { status: 400 });
    }

    // Check if user already exists
    const checkRes = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const existingUser = checkRes.rows[0];

    if (existingUser) {
      return NextResponse.json({ error: 'Ця електронна адреса вже зареєстрована' }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');

    // Save to DB
    await db.query(
      'INSERT INTO users (email, password_hash, verification_token) VALUES ($1, $2, $3)',
      [email.toLowerCase(), passwordHash, token]
    );

    // Send email
    await sendVerificationEmail(email, token);

    return NextResponse.json({
      success: true,
      message: 'Реєстрація успішна! Будь ласка, перевірте пошту для підтвердження.'
    });

  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: 'Сталася помилка на сервері' }, { status: 500 });
  }
}
