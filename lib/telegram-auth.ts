import { createHash, createHmac } from 'crypto';

/**
 * Telegram Authentication Service
 * 
 * Two approaches:
 * 1. Telegram Login Widget (Official, client-side) - RECOMMENDED
 * 2. MTProto API via Telethon (Server-side, complex)
 * 3. Third-party OTP services
 * 
 * For production, use Telegram Login Widget + backend verification
 */

// Telegram Bot Token (for backend verification)
export const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8751575424:***';
export const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'Denzoow_bot';

// Telegram Login Widget configuration
export const TELEGRAM_LOGIN_CONFIG = {
  botId: BOT_USERNAME.replace('@', ''),
  size: 'large' as 'large' | 'medium' | 'small',
  cornerRadius: 20,
  requestAccess: 'write', // Request phone number access
  lang: 'en',
  onAuth: (user: TelegramUser) => {
    // Handle successful auth
    console.log('Telegram auth success:', user);
  },
};

// Types
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
  phone_number?: string; // Only if user grants permission
}

export interface TelegramAuthData {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
  phone_number?: string;
}

/**
 * Verify Telegram Login Widget data on backend
 * This ensures the auth data came from Telegram and wasn't tampered with
 */
export function verifyTelegramAuth(authData: TelegramAuthData): { valid: boolean; user?: TelegramUser; error?: string } {
  const { hash, ...data } = authData;
  
  // Check auth_date is recent (within 24 hours)
  const authDate = parseInt(data.auth_date, 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    return { valid: false, error: 'Authentication expired' };
  }
  
  // Create data-check-string
  const checkString = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key as keyof typeof data]}`)
    .join('\n');
  
  // Generate secret key: SHA256(bot_token)
  const secretKey = createHash('sha256').update(BOT_TOKEN).digest();
  
  // Calculate HMAC-SHA256
  const hmac = createHmac('sha256', secretKey).update(checkString).digest('hex');
  
  if (hmac !== hash) {
    return { valid: false, error: 'Invalid hash' };
  }
  
  return { 
    valid: true, 
    user: {
      id: parseInt(data.id, 10),
      first_name: data.first_name,
      last_name: data.last_name,
      username: data.username,
      photo_url: data.photo_url,
      auth_date: authDate,
      hash: hash,
      phone_number: data.phone_number,
    }
  };
}

/**
 * For server-side OTP via MTProto (requires API_ID/API_HASH from my.telegram.org)
 * This is a reference implementation - requires Telethon/Pyrogram
 */
export const MTProtoOTPService = {
  /**
   * Send OTP via MTProto (Telegram Client API)
   * Requires: api_id, api_hash from https://my.telegram.org
   * Phone format: +6282317296114
   */
  async sendCode(phoneNumber: string): Promise<{ success: boolean; phoneCodeHash?: string; error?: string }> {
    /*
    const { TelegramClient } = require('telethon');
    const client = new TelegramClient('session', apiId, apiHash);
    await client.connect();
    
    const result = await client.sendCodeRequest(phoneNumber);
    return { success: true, phoneCodeHash: result.phoneCodeHash };
    */
    return { 
      success: false, 
      error: 'MTProto not configured. Use Telegram Login Widget instead.' 
    };
  },
  
  async verifyCode(phoneNumber: string, code: string, phoneCodeHash: string): Promise<{ success: boolean; error?: string }> {
    /*
    const { TelegramClient } = require('telethon');
    const client = new TelegramClient('session', apiId, apiHash);
    await client.connect();
    
    await client.signIn(phoneNumber, { code, phoneCodeHash });
    return { success: true };
    */
    return { 
      success: false, 
      error: 'MTProto not configured' 
    };
  }
};

/**
 * Generate a secure random session token
 */
export function generateSessionToken(): string {
  return `tg_${Date.now()}_${Math.random().toString(36).slice(2, 20)}`;
}

/**
 * Store user session (in production, use Redis/Vercel KV with TTL)
 */
const userSessions = new Map<string, { 
  telegramId: number; 
  phoneNumber?: string; 
  createdAt: number;
  expiresAt: number;
}>();

export function createUserSession(telegramId: number, phoneNumber?: string): string {
  const token = generateSessionToken();
  userSessions.set(token, {
    telegramId,
    phoneNumber,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return token;
}

export function getUserSession(token: string): { telegramId: number; phoneNumber?: string } | null {
  const session = userSessions.get(token);
  if (!session || Date.now() > session.expiresAt) {
    userSessions.delete(token);
    return null;
  }
  return { telegramId: session.telegramId, phoneNumber: session.phoneNumber };
}

export function deleteUserSession(token: string): void {
  userSessions.delete(token);
}