import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramWebhook, setWebhook, WEBHOOK_SECRET } from '@/lib/telegram';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify webhook secret
    const secret = request.headers.get('x-telegram-bot-api-secret-token');
    if (secret !== WEBHOOK_SECRET) {
      console.warn('Invalid webhook secret');
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const update = await request.json();
    console.log('Telegram webhook received:', JSON.stringify(update, null, 2));
    
    await handleTelegramWebhook(update);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// GET endpoint to set webhook (call once after deploy)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://freemodel-clone.vercel.app'}/api/telegram/webhook`;
    const success = await setWebhook(webhookUrl);
    
    return NextResponse.json({ 
      ok: success, 
      webhookUrl,
      message: success ? 'Webhook set successfully' : 'Failed to set webhook'
    });
  } catch (error) {
    console.error('Set webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to set webhook' }, { status: 500 });
  }
}