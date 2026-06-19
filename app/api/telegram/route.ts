import { NextRequest, NextResponse } from 'next/server';
import { 
  sendOtpToTelegram, 
  verifyOtp, 
  isOtpVerified, 
  consumeOtpVerification, 
  generateOtp,
  registerPhoneChatId,
  getChatIdForPhone,
  formatPhoneNumber
} from '@/lib/telegram';
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
          message: 'Telegram number is required',
          expiresIn: 0,
        }, { status: 400 });
      }

      const generatedOtp = generateOtp();
      const result = await sendOtpToTelegram(phoneNumber, generatedOtp);
      return NextResponse.json<SendOtpResponse>(result, { 
        status: result.success ? 200 : 400 // 400 for user errors (not registered)
      });
    }

    if (action === 'verify-otp') {
      if (!phoneNumber || !otp) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Phone number and OTP are required',
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
          error: 'Phone number and key name are required',
        }, { status: 400 });
      }

      if (!isOtpVerified(phoneNumber)) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'OTP verification not completed',
        }, { status: 401 });
      }

      const consumed = consumeOtpVerification(phoneNumber);
      if (!consumed) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Invalid verification session',
        }, { status: 401 });
      }

      const newKey = createApiKey('user_coinpump', keyName);
      if (!newKey) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Failed to create API key',
        }, { status: 500 });
      }

      const response: CreateKeyResponse = {
        key: newKey,
        rawKey: (newKey as any).rawKey,
      };

      return NextResponse.json<CreateKeyResponse>(response, { status: 201 });
    }

    if (action === 'register-phone') {
      // For testing: manually register a phone with a chat_id
      if (!phoneNumber) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Phone number required',
        }, { status: 400 });
      }
      
      // This would normally come from webhook, but allow manual for testing
      const chatId = parseInt(body.chatId || '1768939194');
      registerPhoneChatId(phoneNumber, chatId);
      
      return NextResponse.json<ApiResponse>({
        success: true,
        message: `Registered ${phoneNumber} to chat_id ${chatId}`,
      });
    }

    if (action === 'check-registration') {
      if (!phoneNumber) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Phone number required',
        }, { status: 400 });
      }
      
      const chatId = getChatIdForPhone(phoneNumber);
      return NextResponse.json<ApiResponse<{ registered: boolean; chatId: number | null }>>({
        success: true,
        data: { 
          registered: !!chatId, 
          chatId 
        },
      });
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Invalid action',
    }, { status: 400 });
  } catch (error) {
    console.error('Telegram API error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Server error',
    }, { status: 500 });
  }
}