import { NextRequest, NextResponse } from 'next/server';
import { sendOtp } from '@/lib/tgauth';
import type { SendOtpRequest, ApiResponse } from '@/types';

// In-memory phone -> { otp, expiresAt }
const phoneOtpStore = new Map<string, { otp: string; expiresAt: number }>();

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as Partial<SendOtpRequest>;
    const { phone } = body;

    if (!phone) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Phone is required' }, { status: 400 });
    }

    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const tgauthResult = await sendOtp({ phone });
    if (!tgauthResult.success) {
      return NextResponse.json<ApiResponse>({ success: false, error: tgauthResult.message }, { status: 400 });
    }

    phoneOtpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    return NextResponse.json<ApiResponse<{ expiresIn: number }>>({ success: true, data: { expiresIn: 300 } });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
