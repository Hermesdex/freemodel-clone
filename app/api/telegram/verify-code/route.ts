import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/tgauth';
import { createApiKey } from '@/lib/storage';
import type { ApiResponse, VerifyOtpResponseBody } from '@/types';

// In-memory phone -> { otp, expiresAt }
const phoneOtpStore = new Map<string, { otp: string; expiresAt: number }>();

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { phone?: string; code?: string };
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Phone and code are required' }, { status: 400 });
    }

    const stored = phoneOtpStore.get(phone);
    if (!stored) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'OTP not found or expired. Request a new code.' }, { status: 400 });
    }

    if (Date.now() > stored.expiresAt) {
      phoneOtpStore.delete(phone);
      return NextResponse.json<ApiResponse>({ success: false, error: 'OTP expired. Request a new code.' }, { status: 400 });
    }

    if (stored.otp !== code) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Invalid OTP' }, { status: 400 });
    }

    phoneOtpStore.delete(phone);

    const result = await verifyOtp({ phone, code });
    if (!result.success) {
      return NextResponse.json<ApiResponse>({ success: false, error: result.description || 'Verification failed' }, { status: 400 });
    }

    const apiKey = createApiKey('user_coinpump', 'Telegram API Key');
    if (!apiKey) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to create API key' }, { status: 500 });
    }

    return NextResponse.json<ApiResponse<VerifyOtpResponseBody>>(
      {
        success: true,
        data: {
          key: apiKey.key,
          prefix: apiKey.prefix,
          rawKey: (apiKey as any).rawKey as string,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
