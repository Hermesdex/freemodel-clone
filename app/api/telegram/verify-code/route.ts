import { NextRequest, NextResponse } from 'next/server';
import { verifyGatewayOtp } from '@/lib/telegram-gateway';
import { createApiKey } from '@/lib/storage';
import type { ApiResponse, VerifyOtpResponseBody } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { phone?: string; code?: string };
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Phone and code are required' }, { status: 400 });
    }

    const normalized = phone.replace(/\D/g, '');

    const result = await verifyGatewayOtp(normalized, code);
    if (!result.success) {
      return NextResponse.json<ApiResponse>({ success: false, error: result.error || 'Verification failed' }, { status: 400 });
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
    console.error('Verify Gateway OTP error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
