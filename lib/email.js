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

export async function sendOrderEmail(order) {
  const { customerName, customerPhone, customerAddress, customerEmail, items, total } = order;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        <span style="font-size: 12px; color: #666;">Колір: ${item.color}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price} ₴</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price * item.quantity} ₴</td>
    </tr>
  `).join('');

  const adminEmail = process.env.SMTP_USER || 'svjatoslav200713@gmail.com';

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Krona Store" <noreply@krona.com>',
    to: adminEmail,
    subject: `Нове замовлення від ${customerName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; color: #333;">
        <h2 style="color: #111; text-align: center; border-bottom: 2px solid #111; padding-bottom: 10px;">Нове замовлення!</h2>
        
        <h3>Контакти клієнта:</h3>
        <p><strong>Ім'я:</strong> ${customerName}</p>
        <p><strong>Телефон:</strong> ${customerPhone}</p>
        <p><strong>Адреса доставки:</strong> ${customerAddress}</p>
        <p><strong>Пошта:</strong> ${customerEmail || 'Не вказана (неавторизований)'}</p>
        
        <h3>Деталі замовлення:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Товар</th>
              <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">К-сть</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Ціна</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Сума</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 15px 10px 10px; text-align: right; font-weight: bold;">Загальна сума:</td>
              <td style="padding: 15px 10px 10px; text-align: right; font-weight: bold; font-size: 16px; color: #111;">${total} ₴</td>
            </tr>
          </tfoot>
        </table>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 10px; color: #999; text-align: center;">KRONA — Студія Сучасних та Мінімалістичних Меблів</p>
      </div>
    `
  };

  // 1. Always log to local emails.log for ease of testing
  const logMessage = `[${new Date().toISOString()}] NEW ORDER EMAIL to: ${adminEmail}\nCustomer: ${customerName} (${customerPhone})\nAddress: ${customerAddress}\nTotal: ${total} ₴\n----------------------------------------\n`;
  fs.appendFileSync(logPath, logMessage, 'utf-8');
  console.log(`Order email logged to ${logPath}`);

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
      console.log(`Order email successfully sent to ${adminEmail} via SMTP`);
      return;
    } catch (error) {
      console.error('SMTP sending failed for order, falling back to test account:', error.message);
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
    console.log(`SMTP Order Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    console.warn('SMTP sending failed (normal if offline or no SMTP configured):', error.message);
  }
}

export async function sendCustomerOrderConfirmationEmail(order) {
  const { customerName, customerPhone, customerAddress, customerEmail, items, total } = order;

  if (!customerEmail) return;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        <span style="font-size: 12px; color: #666;">Колір: ${item.color}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price} ₴</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price * item.quantity} ₴</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Krona Store" <noreply@krona.com>',
    to: customerEmail,
    subject: `Ваше замовлення в KRONA успішно прийнято!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; color: #333;">
        <h2 style="color: #111; text-align: center; border-bottom: 2px solid #111; padding-bottom: 10px;">Дякуємо за замовлення, ${customerName}!</h2>
        <p style="font-size: 15px; line-height: 1.5;">Ми раді повідомити, що ваше замовлення успішно отримано та вже обробляється менеджером. Наш спеціаліст зв'яжеться з вами найближчим часом за номером <strong>${customerPhone}</strong>.</p>
        
        <h3 style="margin-top: 25px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Деталі доставки:</h3>
        <p><strong>Адреса доставки:</strong> ${customerAddress}</p>
        
        <h3 style="margin-top: 25px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Ваше замовлення:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Товар</th>
              <th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">К-сть</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Ціна</th>
              <th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Сума</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 15px 10px 10px; text-align: right; font-weight: bold;">Загальна сума:</td>
              <td style="padding: 15px 10px 10px; text-align: right; font-weight: bold; font-size: 16px; color: #111;">${total} ₴</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="margin-top: 30px; font-size: 13px; color: #666; text-align: center;">Якщо у вас виникли запитання, ви можете відповісти на цей лист.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 10px; color: #999; text-align: center;">KRONA — Студія Сучасних та Мінімалістичних Меблів</p>
      </div>
    `
  };

  // 1. Always log to local emails.log for ease of testing
  const logMessage = `[${new Date().toISOString()}] CUSTOMER CONFIRMATION EMAIL to: ${customerEmail}\nTotal: ${total} ₴\n----------------------------------------\n`;
  fs.appendFileSync(logPath, logMessage, 'utf-8');
  console.log(`Customer order confirmation email logged to ${logPath}`);

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
      console.log(`Customer order confirmation email successfully sent to ${customerEmail} via SMTP`);
      return;
    } catch (error) {
      console.error('SMTP sending failed for customer confirmation, falling back to test account:', error.message);
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
    console.log(`SMTP Customer Order Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    console.warn('SMTP sending failed for customer (normal if offline or no SMTP configured):', error.message);
  }
}
