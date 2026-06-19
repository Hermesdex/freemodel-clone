import type { TelegramMessage, SendOtpResponse, VerifyOtpResponse } from '@/types';

// Telegram Bot Configuration
const BOT_TOKEN=process.env.TELEGRAM_BOT_TOKEN || '8751575424:***';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1768939194';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
export const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || 'freemodel-webhook-secret';

// In-memory stores (in production, use Vercel KV / Redis / PostgreSQL)
const otpStore = new Map<string, {
  otp: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}>();

// Phone number → Telegram chat_id mapping
const phoneToChatId = new Map<string, number>();

// Chat ID → Phone number mapping (for webhook)
const chatIdToPhone = new Map<number, string>();

export function generateOtp(): string {
  // 5 digits: 10000-99999
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  
  if (digits.startsWith('62')) {
    return digits;
  }
  
  return '62' + digits;
}

export function parsePhoneFromCommand(text: string): string | null {
  // Parse /start 082317296114 or /start 6282317296114
  const match = text.match(/\/start\s+(\+?\d[\d\s-]*)/i);
  if (match) {
    return formatPhoneNumber(match[1]);
  }
  return null;
}

export async function sendTelegramMessage(message: TelegramMessage): Promise<{success: boolean; error?: string}> {
  try {
    const response = await fetch(`${API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    
    const data = await response.json();
    if (!data.ok) {
      console.error('Telegram API error:', data);
      return { success: false, error: data.description || 'Telegram API error' };
    }
    return { success: true };
  } catch (error) {
    console.error('Telegram send error:', error);
    return { success: false, error: 'Network error' };
  }
}

// Register user's phone with their chat_id (called from webhook)
export function registerPhoneChatId(phoneNumber: string, chatId: number): void {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  phoneToChatId.set(formattedPhone, chatId);
  chatIdToPhone.set(chatId, formattedPhone);
  console.log(`Registered: ${formattedPhone} -> chat_id: ${chatId}`);
}

// Get chat_id for a phone number
export function getChatIdForPhone(phoneNumber: string): number | null {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  return phoneToChatId.get(formattedPhone) || null;
}

// Get phone for a chat_id
export function getPhoneForChatId(chatId: number): string | null {
  return chatIdToPhone.get(chatId) || null;
}

// Send welcome message with instructions
export async function sendWelcomeMessage(chatId: number): Promise<void> {
  const message = `
👋 <b>Selamat datang di FreeModel Bot!</b>

Untuk mendapatkan OTP verifikasi API Key, kirim perintah:

<code>/start 08xxxxxxxxxx</code>

Contoh: <code>/start 082317296114</code>

Setelah terdaftar, Anda bisa request OTP dari dashboard FreeModel dan kodenya akan dikirim ke sini.
  `.trim();
  
  await sendTelegramMessage({
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
  });
}

// Send OTP to user's registered chat
export async function sendOtpToTelegram(phoneNumber: string, otp: string): Promise<SendOtpResponse> {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const chatId = getChatIdForPhone(formattedPhone);
  
  if (!chatId) {
    return {
      success: false,
      message: 'Nomor belum terdaftar. Silakan mulai chat dengan @Denzoow_bot dan kirim /start <nomor> terlebih dahulu.',
      expiresIn: 0,
    };
  }
  
  const message = `
🔐 <b>FreeModel - Kode Verifikasi OTP</b>

📱 Nomor: <code>${formattedPhone}</code>
🔢 Kode OTP: <b>${otp}</b>
⏰ Berlaku: 5 menit

⚠️ Jangan bagikan kode ini ke siapapun. Tim FreeModel tidak akan meminta OTP Anda.
  `.trim();

  const result = await sendTelegramMessage({
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
  });

  if (result.success) {
    otpStore.set(formattedPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
      verified: false,
    });
    
    return {
      success: true,
      message: 'OTP berhasil dikirim ke Telegram Anda',
      expiresIn: 300,
    };
  }

  let errorMsg = 'Gagal mengirim OTP. Coba lagi nanti.';
  if (result.error?.includes('blocked')) {
    errorMsg = 'Bot diblokir. Silakan buka @Denzoow_bot dan klik Start.';
  } else if (result.error?.includes('unauthorized')) {
    errorMsg = 'Token bot tidak valid. Hubungi admin.';
  }

  return {
    success: false,
    message: errorMsg,
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

  session.verified = true;
  otpStore.set(formattedPhone, session);

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

if (typeof window === 'undefined') {
  setInterval(cleanupExpiredOtps, 60 * 1000);
}

// Webhook handler
export async function handleTelegramWebhook(update: any): Promise<boolean> {
  try {
    // Handle /start command with phone number
    if (update.message?.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const phoneNumber = parsePhoneFromCommand(text);
      
      if (phoneNumber) {
        // Register this chat_id for the phone number
        registerPhoneChatId(phoneNumber, chatId);
        
        await sendTelegramMessage({
          chat_id: chatId,
          text: `✅ Nomor <code>${phoneNumber}</code> berhasil terdaftar!\n\nSekarang Anda bisa request OTP dari dashboard FreeModel.`,
          parse_mode: 'HTML',
        });
        return true;
      }
      
      // If just /start without phone
      if (text === '/start') {
        await sendWelcomeMessage(chatId);
        return true;
      }
    }
    
    // Handle callback queries (inline buttons)
    if (update.callback_query) {
      // Could handle inline button callbacks here
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Webhook error:', error);
    return false;
  }
}

// Set webhook URL
export async function setWebhook(webhookUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        url: webhookUrl,
        secret_token: WEBHOOK_SECRET,
        allowed_updates: ['message', 'callback_query'],
      }),
    });
    
    const data = await response.json();
    console.log('Set webhook result:', data);
    return data.ok === true;
  } catch (error) {
    console.error('Set webhook error:', error);
    return false;
  }
}