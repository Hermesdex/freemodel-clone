import { NextRequest, NextResponse } from 'next/server';
import { sendGatewayOtp } from '@/lib/telegram-gateway';
import type { ApiResponse } from '@/types';

// In-memory phone -> { requestId?, expiresAt, attempts }
const phoneGatewayStore = new Map<string, { requestId?: string; expiresAt: number; attempts: number }>();

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { phone?: string };
    const { phone } = body;

    if (!phone) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Phone is required' }, { status: 400 });
    }

    const normalized = phone.replace(/\D/g, '');
    const existing = phoneGatewayStore.get(normalized);

    if (existing && Date.now() < existing.expiresAt && existing.attempts >= 5) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Too many attempts. Please wait before requesting a new code.' },
        { status: 429 },
      );
    }

    const result = await sendGatewayOtp(normalized);

    if (!result.success) {
      return NextResponse.json<ApiResponse>({ success: false, error: result.error || 'Gagal mengirim OTP' }, { status: 400 });
    }

    phoneGatewayStore.set(normalized, {
      requestId: result.data?.requestId,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: existing ? existing.attempts + 1 : 1,
    });

    return NextResponse.json<ApiResponse<{ expiresIn: number }>>(
      { success: true, data: { expiresIn: 300 } },
      { status: 200 },
    );
  } catch (error) {
    console.error('Send Gateway OTP error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Server error' }, { status: 500 });
  }
}
