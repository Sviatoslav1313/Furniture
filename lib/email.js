import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const logPath = path.resolve(process.cwd(), 'emails.log');

export async function sendVerificationEmail(email, token) {
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Krona Store" <noreply@krona.com>',
    to: email,
    subject: 'Підтвердження реєстрації в KRONA',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #111; text-align: center;">Вітаємо в KRONA!</h2>
        <p>Дякуємо за реєстрацію на нашому сайті.</p>
        <p>Будь ласка, підтвердіть свою електронну адресу, натиснувши на кнопку нижче:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Підтвердити пошту</a>
        </div>
        <p style="font-size: 12px; color: #666;">Якщо ви не реєструвалися на нашому сайті, просто проігноруйте цей лист.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 10px; color: #999; text-align: center;">KRONA — Студія Сучасних та Мінімалістичних Меблів</p>
      </div>
    `
  };

  // 1. Always log to local emails.log for ease of testing
  const logMessage = `[${new Date().toISOString()}] Email to: ${email}\nVerification Link: ${verifyUrl}\n----------------------------------------\n`;
  fs.appendFileSync(logPath, logMessage, 'utf-8');
  console.log(`Verification email logged to ${logPath}`);

  // 2. Try sending via configured SMTP server
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const secure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465';
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent to ${email} via SMTP`);
      return;
    } catch (error) {
      console.error('SMTP sending failed, falling back to test account:', error.message);
    }
  }

  // 3. Fallback to Ethereal test account if no SMTP credentials exist
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await transporter.sendMail(mailOptions);
    console.log(`SMTP Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    console.warn('SMTP sending failed (normal if offline or no SMTP configured):', error.message);
  }
}
