import { NextRequest, NextResponse } from 'next/server';
import { sendOtpToTelegram, verifyOtp, isOtpVerified, consumeOtpVerification, generateOtp } from '@/lib/telegram';
import { createApiKey } from '@/lib/storage';
import type { ApiResponse, SendOtpResponse, CreateKeyResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, phoneNumber, otp, keyName } = body;

    if (action === 'send-otp') {
      if (!phoneNumber) {
        return NextResponse.json<SendOtpResponse>({
          success: false,
          message: 'Nomor Telegram wajib diisi',
          expiresIn: 0,
        }, { status: 400 });
      }

      // Generate OTP first
      const generatedOtp = generateOtp();
      const result = await sendOtpToTelegram(phoneNumber, generatedOtp);
      return NextResponse.json<SendOtpResponse>(result, { 
        status: result.success ? 200 : 500 
      });
    }

    if (action === 'verify-otp') {
      if (!phoneNumber || !otp) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Nomor dan OTP wajib diisi',
        }, { status: 400 });
      }

      const result = verifyOtp(phoneNumber, otp);
      return NextResponse.json<ApiResponse>(result, { 
        status: result.success ? 200 : 400 
      });
    }

    if (action === 'create-key') {
      if (!phoneNumber || !keyName) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Nomor dan nama key wajib diisi',
        }, { status: 400 });
      }

      // Verify OTP was completed
      if (!isOtpVerified(phoneNumber)) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Verifikasi OTP belum selesai',
        }, { status: 401 });
      }

      // Consume the verification
      const consumed = consumeOtpVerification(phoneNumber);
      if (!consumed) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Sesi verifikasi tidak valid',
        }, { status: 401 });
      }

      // Create the API key
      const newKey = createApiKey('user_coinpump', keyName);
      if (!newKey) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Gagal membuat API key',
        }, { status: 500 });
      }

      const response: CreateKeyResponse = {
        key: newKey,
        rawKey: (newKey as any).rawKey,
      };

      return NextResponse.json<CreateKeyResponse>(response, { status: 201 });
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Action tidak valid',
    }, { status: 400 });
  } catch (error) {
    console.error('Telegram API error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Terjadi kesalahan server',
    }, { status: 500 });
  }
}