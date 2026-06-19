import type { TelegramMessage, SendOtpResponse, VerifyOtpResponse } from '@/types';

// Telegram Bot Configuration
const BOT_TOKEN=proces...OKEN || '8751575424:AAFJYeMhx58IxfruIlZaiREV8OsdoasfImg';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1768939194';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// In-memory OTP store (in production, use Redis/Vercel KV)
const otpStore = new Map<string, {
  otp: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}>();

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 62 (Indonesia)
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  
  // If starts with 62, keep as is
  if (digits.startsWith('62')) {
    return digits;
  }
  
  // Default: assume Indonesia
  return '62' + digits;
}

export async function sendTelegramMessage(message: TelegramMessage): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    
    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error('Telegram send error:', error);
    return false;
  }
}

export async function sendOtpToTelegram(phoneNumber: string, otp: string): Promise<SendOtpResponse> {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  
  const message = `
🔐 <b>FreeModel - Kode Verifikasi OTP</b>

📱 Nomor: <code>${formattedPhone}</code>
🔢 Kode OTP: <b>${otp}</b>
⏰ Berlaku: 5 menit

⚠️ Jangan bagikan kode ini ke siapapun. Tim FreeModel tidak akan meminta OTP Anda.
  `.trim();

  const sent = await sendTelegramMessage({
    chat_id: parseInt(CHAT_ID),
    text: message,
    parse_mode: 'HTML',
  });

  if (sent) {
    // Store OTP with 5-minute expiry
    otpStore.set(formattedPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
      verified: false,
    });
    
    return {
      success: true,
      message: 'OTP berhasil dikirim ke Telegram',
      expiresIn: 300,
    };
  }

  return {
    success: false,
    message: 'Gagal mengirim OTP. Coba lagi nanti.',
    expiresIn: 0,
  };
}

export function verifyOtp(phoneNumber: string, inputOtp: string): VerifyOtpResponse {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const session = otpStore.get(formattedPhone);

  if (!session) {
    return {
      success: false,
      message: 'OTP tidak ditemukan atau sudah kadaluarsa. Minta kode baru.',
    };
  }

  if (Date.now() > session.expiresAt) {
    otpStore.delete(formattedPhone);
    return {
      success: false,
      message: 'OTP sudah kadaluarsa. Minta kode baru.',
    };
  }

  if (session.attempts >= 3) {
    otpStore.delete(formattedPhone);
    return {
      success: false,
      message: 'Terlalu banyak percobaan gagal. Minta kode baru.',
    };
  }

  if (session.otp !== inputOtp) {
    session.attempts++;
    otpStore.set(formattedPhone, session);
    return {
      success: false,
      message: `Kode OTP salah. Sisa percobaan: ${3 - session.attempts}`,
    };
  }

  // Success - mark verified
  session.verified = true;
  otpStore.set(formattedPhone, session);

  // Generate a session token for API key creation (valid for 10 minutes)
  const token = `fm_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`;
  
  return {
    success: true,
    message: 'Verifikasi berhasil!',
    token,
  };
}

export function isOtpVerified(phoneNumber: string): boolean {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const session = otpStore.get(formattedPhone);
  return session?.verified === true;
}

export function consumeOtpVerification(phoneNumber: string): boolean {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const session = otpStore.get(formattedPhone);
  
  if (session?.verified) {
    otpStore.delete(formattedPhone);
    return true;
  }
  return false;
}

export function cleanupExpiredOtps(): void {
  const now = Date.now();
  for (const [phone, session] of otpStore.entries()) {
    if (now > session.expiresAt) {
      otpStore.delete(phone);
    }
  }
}

// Cleanup every minute
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredOtps, 60 * 1000);
}