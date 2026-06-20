# Environment variables — AgentHub

Set these in Vercel (or local `.env.local`). NEVER expose `SUPABASE_SERVICE_KEY` to the browser.

## Required

| Var | Source | Notes |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | @BotFather → /token | Format: `1234567890:AABBccDD...` |
| `TELEGRAM_BOT_USERNAME` | name chosen at /newbot | Without leading `@` |
| `SUPABASE_URL` | Project Settings → API | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Project Settings → API (service_role) | Long JWT, server-only |
| `OTP_SIGNING_KEY` | `openssl rand -hex 32` | Used for HMAC-SHA256 OTP hashing |
| `SESSION_SECRET` | `openssl rand -hex 32` | Used for HMAC session cookie signing |

## Generate keys

```bash
openssl rand -hex 32  # run twice, copy two outputs
```

## Supabase schema (run in SQL editor once)

```sql
-- 1) Users table — populated by your bot when users /start
create table if not exists telegram_users (
  phone text primary key,        -- E.164: +62xxxxxxxxxx
  chat_id bigint not null,
  username text,
  first_seen timestamptz default now(),
  last_seen timestamptz default now()
);

-- 2) OTP sessions (single-row per phone)
create table if not exists otp_sessions (
  phone text primary key references telegram_users(phone),
  otp_hash text not null,
  expires_at timestamptz not null,
  attempts int default 0,
  last_sent_at timestamptz default now()
);

-- 3) Issued API keys (issued on first verify per phone)
create table if not exists issued_keys (
  phone text primary key references telegram_users(phone),
  api_key text not null,
  issued_at timestamptz default now()
);

-- 4) Rate-limit log (auto-prune with cron later)
create table if not exists otp_send_log (
  id bigserial primary key,
  phone text not null,
  sent_at timestamptz default now()
);

-- Optional: index for fast lookups
create index if not exists idx_otp_send_log_phone_time on otp_send_log (phone, sent_at desc);
```

## Telegram setup

```bash
# 1. Open @BotFather in Telegram, send /newbot, follow prompts
# 2. Copy token → TELEGRAM_BOT_TOKEN
# 3. Note username → TELEGRAM_BOT_USERNAME

# 4. Optional: set webhook so bot knows who /start-ed
#    (bot must already be polling; you receive chat_id in `message.from` etc.)
#    If your bot uses polling, you don't need webhook — every message comes in to your polling loop.
```

## RLS (Row Level Security) — REQUIRED

Because `supabaseKey` here is **service_role**, RLS is bypassed. But other clients of your Supabase should still benefit from RLS.

For this skill, leave RLS OFF on the 4 tables above (server controls all writes). If you want browser reads, create a separate anon-key view.

## Vercel deployment

```bash
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_BOT_USERNAME
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
vercel env add OTP_SIGNING_KEY production
vercel env add SESSION_SECRET production
```

Then push to main → GitHub Actions → Vercel auto-deploys.

## Test flow after deploy

1. Visit `https://<your-domain>/agenthub/`
2. In Telegram, DM your bot `/start register`
3. In Supabase, confirm row in `telegram_users` populated within seconds
4. Enter phone in form → click "Kirim kode OTP"
5. Check Telegram — message arrived?
6. Enter 5-digit code on site → dashboard with API key
7. Reload page → session persists (cookie)
8. Click "Keluar" → session clears
