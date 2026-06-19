import type { SendOtpRequest, SendOtpResponseBody, VerifyOtpRequestBody } from '@/types';

const TGAUTH_BASE_URL='https://tgauth.io/api/v1';
const API_KEY=process.env.TGAUTH_API_KEY || '';

export async function sendOtp(request: SendOtpRequest): Promise< SendOtpResponseBody > {
  const res = await fetch(`${TGAUTH_BASE_URL}/otp/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  const data = (await res.json()) as Partial< SendOtpResponseBody >;
  if (!res.ok) {
    return {
      success: false,
      message: data.message || `tgauth send failed (${res.status})`,
    } as SendOtpResponseBody;
  }

  return data as SendOtpResponseBody;
}

interface VerifyOtpResult {
  ok: boolean;
  success: boolean;
  description?: string;
}

export async function verifyOtp(request: VerifyOtpRequestBody): Promise< VerifyOtpResult > {
  const res = await fetch(`${TGAUTH_BASE_URL}/otp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  const data = (await res.json()) as Partial< { ok: boolean; description?: string } >;
  if (!res.ok) {
    return {
      ok: false,
      success: false,
      description: data.description || `tgauth verify failed (${res.status})`,
    };
  }

  return { ok: data.ok ?? false, success: data.ok ?? false, description: data.description };
}
