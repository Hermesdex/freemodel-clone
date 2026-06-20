/**
 * AgentHub server-side API endpoints
 *
 * Menampung semua secret (Telegram bot token, Supabase service-role key, OTP signing key)
 * sehingga tidak pernah bocor ke browser. Endpoint melayani:
 *
 *   GET  /api/agenthub/config   → bot username (publik)
 *   GET  /api/agenthub/session  → cookies yang valid → kembalikan api_key + phone
 *   POST /api/agenthub/send     → generate OTP, hash, simpan, kirim via Telegram bot
 *   POST /api/agenthub/verify   → cocokkan OTP, terbitkan session HttpOnly, kembalikan api_key
 *   POST /api/agenthub/logout   → hapus session cookie
 *
 * Env vars yang harus di-set di Vercel / runtime:
 *   TELEGRAM_BOT_TOKEN      - token dari @BotFather
 *   TELEGRAM_BOT_USERNAME   - username bot tanpa '@'
 *   SUPABASE_URL            - https://xxxxx.supabase.co
 *   SUPABASE_SERVICE_KEY    - service_role key (JANGAN anon)
 *   OTP_SIGNING_KEY         - 32+ char random; HMAC untuk hash OTP
 *   SESSION_SECRET          - 32+ char random; HMAC untuk session cookie
 *
 * Tables di Supabase (harus sudah dibuat via migration atau SQL editor):
 *
 *   create table telegram_users (
 *     phone text primary key,        -- E.164: +62xxxxxxxxxx
 *     chat_id bigint not null,
 *     username text,
 *     first_seen timestamptz default now(),
 *     last_seen timestamptz default now()
 *   );
 *
 *   create table otp_sessions (
 *     phone text primary key,
 *     otp_hash text not null,
 *     expires_at timestamptz not null,
 *     attempts int default 0,
 *     last_sent_at timestamptz default now()
 *   );
 *
 *   create table issued_keys (
 *     phone text primary key references telegram_users(phone),
 *     api_key text not null,
 *     issued_at timestamptz default now()
 *   );
 *
 *   -- Rate-limit helper
 *   create table otp_send_log (
 *     phone text,
 *     sent_at timestamptz default now()
 *   );
 *
 * Catatan operasional:
 * - Rate limit: per phone, max 1 send / 60 s, max 6 per 24 jam
 * - Verify lock: max 5 attempts per session, lalu regenerate OTP
 * - OTP expired after 5 min, single-use (deleted after verify)
 * - Session cookie: HttpOnly, Secure, SameSite=Strict, expires 24 h
 * - HMAC SHA-256(key=OTP_SIGNING_KEY, msg=phone+":"+otp)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PhoneSchema = z.string().regex(/^\+\d{8,15}$/, 'phone must be E.164');
const VerifySchema = z.object({
  phone: PhoneSchema,
  code: z.string().regex(/^\d{5}$/, 'code must be 5 digits'),
});

const COOKIE_NAME = 'ah_session';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

function getEnv() {
  const required = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_BOT_USERNAME', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'OTP_SIGNING_KEY', 'SESSION_SECRET'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
    botUsername: process.env.TELEGRAM_BOT_USERNAME!,
    supabaseUrl: process.env.SUPABASE_URL!,
    supabaseKey: process.env.SUPABASE_SERVICE_KEY!,
    otpKey: process.env.OTP_SIGNING_KEY!,
    sessionSecret: process.env.SESSION_SECRET!,
  };
}

function env() { try { return getEnv(); } catch (e: any) { return { error: e.message }; } }

function sb() {
  const e = env();
  if ('error' in e) return null;
  return createClient(e.supabaseUrl, e.supabaseKey, { auth: { persistSession: false } });
}

function hashOTP(phone: string, otp: string, key: string) {
  return crypto.createHmac('sha256', key).update(`${phone}:${otp}`).digest('hex');
}

function signCookie(phone: string, key: string) {
  const payload = `${phone}:${Math.floor(Date.now() / 1000)}`;
  const sig = crypto.createHmac('sha256', key).update(payload).digest('hex').slice(0, 32);
  return `${Buffer.from(payload).toString('base64url')}.${sig}`;
}

function verifyCookie(token: string, key: string): string | null {
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return null;
  try {
    const payload = Buffer.from(b64, 'base64url').toString('utf8');
    const expected = crypto.createHmac('sha256', key).update(payload).digest('hex').slice(0, 32);
    if (expected !== sig) return null;
    const [phone, tsStr] = payload.split(':');
    const ts = parseInt(tsStr, 10);
    if (Number.isNaN(ts) || Date.now() / 1000 - ts > COOKIE_MAX_AGE) return null;
    return phone;
  } catch { return null; }
}

function cookieHeader(token: string | null): string {
  if (token === null) {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
  }
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`;
}

function genOTP(): string {
  // 5 digit, leading zero allowed so user can paste exactly what they see
  return String(Math.floor(Math.random() * 100000)).padStart(5, '0');
}

function genApiKey(): string {
  // 32 char alphanumeric; user-facing prefix optional
  const rand = crypto.randomBytes(24).toString('base64url').replace(/[_-]/g, '').slice(0, 28);
  return `fe_oa_${rand}`;
}

// ── GET /config ─────────────────────────────────────────────────────
export async function GET_config() {
  const e = env();
  if ('error' in e) return NextResponse.json({ error: e.error }, { status: 503 });
  return NextResponse.json({ bot_username: e.botUsername }, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}

// ── GET /session ────────────────────────────────────────────────────
export async function GET_session(req: NextRequest) {
  const e = env();
  if ('error' in e) return NextResponse.json({ error: e.error }, { status: 503 });

  const cookie = req.cookies.get(COOKIE_NAME)?.value || '';
  const decoded = cookie ? decodeURIComponent(cookie) : '';
  const phone = verifyCookie(decoded, e.sessionSecret);
  if (!phone) return NextResponse.json({ authenticated: false }, { status: 401 });

  const supa = sb();
  if (!supa) return NextResponse.json({ error: 'supabase unavailable' }, { status: 503 });
  const { data: keyRow } = await supa.from('issued_keys').select('api_key').eq('phone', phone).single();
  if (!keyRow) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, phone, api_key: keyRow.api_key });
}

// ── POST /send ──────────────────────────────────────────────────────
export async function POST_send(req: NextRequest) {
  const e = env();
  if ('error' in e) return NextResponse.json({ error: e.error }, { status: 503 });
  const supa = sb();
  if (!supa) return NextResponse.json({ error: 'supabase unavailable' }, { status: 503 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }
  const parsed = PhoneSchema.safeParse((body as any)?.phone);
  if (!parsed.success) return NextResponse.json({ error: 'Nomor tidak valid.' }, { status: 400 });
  const phone = parsed.data;

  // Rate limit per phone (write to otp_send_log)
  const since1m = new Date(Date.now() - 60_000).toISOString();
  const since24h = new Date(Date.now() - 86_400_000).toISOString();
  const { count: c1 } = await supa.from('otp_send_log').select('*', { count: 'exact', head: true }).eq('phone', phone).gt('sent_at', since1m);
  const { count: c2 } = await supa.from('otp_send_log').select('*', { count: 'exact', head: true }).eq('phone', phone).gt('sent_at', since24h);
  if ((c1 ?? 0) > 0) return NextResponse.json({ error: 'Tunggu 60 detik sebelum kirim lagi.' }, { status: 429 });
  if ((c2 ?? 0) >= 6) return NextResponse.json({ error: 'Batas harian tercapai. Coba besok.' }, { status: 429 });

  // Resolve chat_id
  const { data: u } = await supa.from('telegram_users').select('chat_id').eq('phone', phone).single();
  if (!u) return NextResponse.json({ error: 'Nomor belum terdaftar di bot. Ketik /start dulu.' }, { status: 404 });
  const chatId = u.chat_id;

  // Generate + hash OTP
  const otp = genOTP();
  const otpHash = hashOTP(phone, otp, e.otpKey);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  await supa.from('otp_sessions').upsert({ phone, otp_hash: otpHash, expires_at: expiresAt, attempts: 0, last_sent_at: new Date().toISOString() }, { onConflict: 'phone' });
  await supa.from('otp_send_log').insert({ phone });

  // Send via Telegram bot
  const text = `🔐 *Kode OTP AgentHub*\n\nKode verifikasimu: *${otp}*\n\nBerlaku 5 menit. Jangan bagikan ke siapapun.`;
  const tgRes = await fetch(`https://api.telegram.org/bot${e.botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
  const tgData = await tgRes.json();
  if (!tgData.ok) {
    return NextResponse.json({ error: `Telegram: ${tgData.description || 'send failed'}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true, expires_in: 300 });
}

// ── POST /verify ────────────────────────────────────────────────────
export async function POST_verify(req: NextRequest) {
  const e = env();
  if ('error' in e) return NextResponse.json({ error: e.error }, { status: 503 });
  const supa = sb();
  if (!supa) return NextResponse.json({ error: 'supabase unavailable' }, { status: 503 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }
  const parsed = VerifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Input tidak valid.' }, { status: 400 });
  const { phone, code } = parsed.data;

  const { data: otpRow } = await supa.from('otp_sessions').select('otp_hash, expires_at, attempts').eq('phone', phone).single();
  if (!otpRow) return NextResponse.json({ error: 'OTP tidak ditemukan. Minta kode baru.' }, { status: 404 });
  if (new Date(otpRow.expires_at).getTime() < Date.now()) {
    await supa.from('otp_sessions').delete().eq('phone', phone);
    return NextResponse.json({ error: 'Kode sudah kedaluwarsa. Minta baru.' }, { status: 410 });
  }
  if (otpRow.attempts >= 5) {
    await supa.from('otp_sessions').delete().eq('phone', phone);
    return NextResponse.json({ error: 'Terlalu banyak percobaan. Minta kode baru.' }, { status: 429 });
  }

  const expected = hashOTP(phone, code, e.otpKey);
  if (expected !== otpRow.otp_hash) {
    await supa.from('otp_sessions').update({ attempts: otpRow.attempts + 1 }).eq('phone', phone);
    return NextResponse.json({ error: 'Kode salah.' }, { status: 401 });
  }

  // OTP matched → Issue / fetch API key, single-use delete OTP, set session cookie
  await supa.from('otp_sessions').delete().eq('phone', phone);

  let apiKey: string;
  const { data: keyRow } = await supa.from('issued_keys').select('api_key').eq('phone', phone).single();
  if (keyRow) {
    apiKey = keyRow.api_key;
  } else {
    apiKey = genApiKey();
    const { error: insErr } = await supa.from('issued_keys').insert({ phone, api_key: apiKey });
    if (insErr) return NextResponse.json({ error: 'Gagal terbitkan kunci.' }, { status: 500 });
  }

  const cookieVal = signCookie(phone, e.sessionSecret);
  return NextResponse.json(
    { ok: true, api_key: apiKey, session_token: cookieVal, expires_in: COOKIE_MAX_AGE },
    { headers: { 'Set-Cookie': cookieHeader(cookieVal) } },
  );
}

// ── POST /logout ────────────────────────────────────────────────────
export async function POST_logout() {
  return NextResponse.json({ ok: true }, { headers: { 'Set-Cookie': cookieHeader(null) } });
}

// ── Unified route handler (single Next.js file) ────────────────────
// Next.js 14 App Router can't natively route `/api/agenthub/:action` with this layout.
// Use named exports per action file or move to dedicated route files at:
//   app/api/agenthub/config/route.ts
//   app/api/agenthub/send/route.ts
//   app/api/agenthub/verify/route.ts
//   app/api/agenthub/session/route.ts
//   app/api/agenthub/logout/route.ts
// The helpers above are importable from each route file.
