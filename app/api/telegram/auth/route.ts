import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramAuth, createUserSession, BOT_USERNAME } from '@/lib/telegram-auth';
import type { ApiResponse, TelegramAuthData } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, authData } = body;

    if (action === 'verify-login') {
      if (!authData) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Authentication data required',
        }, { status: 400 });
      }

      // Verify the Telegram Login Widget data
      const result = verifyTelegramAuth(authData as TelegramAuthData);
      
      if (!result.valid) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: result.error || 'Invalid authentication',
        }, { status: 400 });
      }

      // Create user session
      const sessionToken = createUserSession(
        result.user!.id, 
        result.user!.phone_number
      );

      return NextResponse.json<ApiResponse<{ 
        user: typeof result.user; 
        sessionToken: string 
      }>>({
        success: true,
        data: {
          user: result.user,
          sessionToken,
        },
        message: 'Telegram authentication successful',
      });
    }

    if (action === 'get-bot-info') {
      return NextResponse.json<ApiResponse<{ botUsername: string }>>({
        success: true,
        data: { botUsername: BOT_USERNAME },
      });
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Invalid action',
    }, { status: 400 });
  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Server error',
    }, { status: 500 });
  }
}