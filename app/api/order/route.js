import { NextResponse } from 'next/server';
import { sendOrderEmail, sendCustomerOrderConfirmationEmail } from '../../../lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerAddress, customerEmail, items, total } = body;

    if (!customerName || !customerPhone || !customerAddress || !items || !total) {
      return NextResponse.json(
        { error: 'Всі обов\'язкові поля мають бути заповнені.' },
        { status: 400 }
      );
    }

    // 1. Send detailed email to admin
    await sendOrderEmail({
      customerName,
      customerPhone,
      customerAddress,
      customerEmail,
      items,
      total
    });

    // 2. Send confirmation email to customer
    if (customerEmail) {
      await sendCustomerOrderConfirmationEmail({
        customerName,
        customerPhone,
        customerAddress,
        customerEmail,
        items,
        total
      });
    }

    return NextResponse.json({ success: true, message: 'Замовлення успішно надіслано' });
  } catch (error) {
    console.error('Order API error:', error);
    return NextResponse.json(
      { error: 'Помилка сервера: не вдалося надіслати замовлення. ' + error.message },
      { status: 500 }
    );
  }
}
