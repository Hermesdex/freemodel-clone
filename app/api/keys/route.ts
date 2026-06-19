import { NextRequest, NextResponse } from 'next/server';
import { getApiKeys, createApiKey, revokeApiKey, deleteApiKey, toggleApiKey } from '@/lib/storage';
import type { ApiResponse, CreateKeyResponse } from '@/types';

export async function GET(): Promise<NextResponse> {
  try {
    const keys = getApiKeys();
    return NextResponse.json<ApiResponse<{ keys: ReturnType<typeof getApiKeys> }>>({
      success: true,
      data: { keys },
    });
  } catch (error) {
    console.error('Get keys error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Gagal mengambil API keys',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, keyId, keyName, phoneNumber } = body;

    if (action === 'create') {
      if (!phoneNumber || !keyName) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Nomor Telegram dan nama key wajib diisi',
        }, { status: 400 });
      }

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

    if (action === 'revoke') {
      if (!keyId) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Key ID wajib diisi',
        }, { status: 400 });
      }

      const success = revokeApiKey('user_coinpump', keyId);
      return NextResponse.json<ApiResponse>({
        success,
        message: success ? 'API key dicabut' : 'Key tidak ditemukan',
      }, { status: success ? 200 : 404 });
    }

    if (action === 'delete') {
      if (!keyId) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Key ID wajib diisi',
        }, { status: 400 });
      }

      const success = deleteApiKey('user_coinpump', keyId);
      return NextResponse.json<ApiResponse>({
        success,
        message: success ? 'API key dihapus' : 'Key tidak ditemukan',
      }, { status: success ? 200 : 404 });
    }

    if (action === 'toggle') {
      if (!keyId) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Key ID wajib diisi',
        }, { status: 400 });
      }

      const key = toggleApiKey('user_coinpump', keyId);
      return NextResponse.json<ApiResponse<{ key: typeof key }>>({
        success: !!key,
        data: { key: key! },
        message: key ? `Key ${key.isActive ? 'diaktifkan' : 'dinonaktifkan'}` : 'Key tidak ditemukan',
      }, { status: key ? 200 : 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Action tidak valid',
    }, { status: 400 });
  } catch (error) {
    console.error('Keys API error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Terjadi kesalahan server',
    }, { status: 500 });
  }
}