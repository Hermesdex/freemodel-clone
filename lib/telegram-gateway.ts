import type { ApiResponse } from '@/types';

const GATEWAY_BASE_URL = 'https://gateway.telegram.org/v1';

interface GatewaySendResponse {
  request_id?: string;
  success?: boolean;
  error?: string;
  message?: string;
}

export async function sendGatewayOtp(phone: string): Promise<ApiResponse<{ requestId?: string; expiresIn?: number }>> {
  const token = process.env.TELEGRAM_GATEWAY_API_TOKEN;
  if (!token) {
    return { success: false, error: 'Telegram Gateway token not configured' };
  }

  const res = await fetch(`${GATEWAY_BASE_URL}/authorization/send-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      phone_number: phone,
      // Telegram sends the OTP via Telegram app notification / service message
      // No SMS fallback needed here per requirement
    }),
  });

  const data = (await res.json()) as GatewaySendResponse;

  if (!res.ok || data.success === false) {
    return {
      success: false,
      error: data.error || data.message || `Gateway send failed (${res.status})`,
    };
  }

  return {
    success: true,
    data: {
      requestId: data.request_id,
      expiresIn: 300,
    },
  };
}

interface GatewayVerifyResponse {
  success?: boolean;
  error?: string;
  message?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    phone?: string;
  };
}

export async function verifyGatewayOtp(
  phone: string,
  code: string,
  requestId?: string,
): Promise<ApiResponse<GatewayVerifyResponse & { token?: string }>> {
  const token = process.env.TELEGRAM_GATEWAY_API_TOKEN;
  if (!token) {
    return { success: false, error: 'Telegram Gateway token not configured' };
  }

  const res = await fetch(`${GATEWAY_BASE_URL}/authorization/check-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      phone_number: phone,
      code,
      request_id: requestId,
    }),
  });

  const data = (await res.json()) as GatewayVerifyResponse;

  if (!res.ok || data.success === false) {
    return {
      success: false,
      error: data.error || data.message || `Gateway verify failed (${res.status})`,
    };
  }

  return {
    success: true,
    data: {
      ...data,
      token: data.user ? btoa(JSON.stringify(data.user)) : undefined,
    },
  };
}
