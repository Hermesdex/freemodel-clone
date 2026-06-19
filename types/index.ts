export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  verified: boolean;
  plan: 'Free' | 'Pro' | 'Enterprise';
  planRenewal: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
  requests: number;
  tokens: number;
  isActive: boolean;
}

export interface Stats {
  currentPlan: string;
  planRenewal: string;
  cacheHitRate: number | null;
  requests30d: number;
  tokens30d: number;
  avgLatency: number;
}

export interface OtpSession {
  phoneNumber: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}

export interface TelegramMessage {
  chat_id: number;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateKeyResponse {
  key: ApiKey;
  rawKey: string; // Only returned once
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token?: string; // Session token for API key creation
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

// tgauth.io request/response shapes
export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponseBody {
  success: boolean;
  message?: string;
  expiresIn?: number;
}

export interface VerifyOtpRequestBody {
  phone: string;
  code: string;
}

export interface VerifyOtpResponseBody {
  key?: string;
  prefix?: string;
  rawKey?: string;
}