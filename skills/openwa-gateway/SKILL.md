---
name: openwa-gateway
description: "OpenWA WhatsApp API Gateway - install, operate, monitor, troubleshoot. Spin up Baileys/wwebjs self-hosted WhatsApp gateway on VPS with health checks, log scanning, session restart, and update flow."
category: communications
---

# OpenWA Gateway — VPS Ops Manual

OpenWA = self-hosted, REST-style WhatsApp gateway (Node 22 LTS, NestJS 11, TypeScript).
Built on `@whiskeysockets/baileys` (WebSocket, no Chromium) **OR** `whatsapp-web.js` (Chromium).
**Unofficial / reverse-engineered — NOT Meta Business API.** Accounts may be banned.

References: `references/compose-cheatsheet.md`, `references/health-api.md`, `references/baileys-vs-wwebjs.md`, `references/update-and-backup.md`.

---

## 1. First-time Install (VPS, Ubuntu 22.04+, 2 GB RAM)

```bash
# Clone
git clone https://github.com/rmyndharis/OpenWA.git /opt/openwa
cd /opt/openwa

# Copy env and edit
cp .env.example .env
nano .env   # set API_PORT=2785, NODE_ENV=production, ENGINE_TYPE=baileys (lighter)

# Generate API key (UI does this on first boot) — preview hash:
openssl rand -hex 32

# Bring up
docker compose pull
docker compose up -d
docker compose logs -f openwa-api | head -50
```

Default ports: API + Dashboard = `2785`; Swagger = `2785/api/docs`.

⚠️ **Bind carefully**: by default dev stack binds `127.0.0.1` only (safe). For remote access, set `BIND_HOST=0.0.0.0` AND put TLS reverse proxy in front — the API key is sent in cleartext over HTTP.

## 2. Day-2 Operations

| Task | Command |
|---|---|
| Health check | `curl -s http://127.0.0.1:2785/api/health` |
| Logs (last 200) | `docker compose logs --tail=200 openwa-api` |
| Logs (follow) | `docker compose logs -f openwa-api` |
| Restart API only | `docker compose restart openwa-api` |
| Stop all | `docker compose down` |
| Start again | `docker compose up -d` |
| Resource use | `docker stats --no-stream openwa-api` |
| Disk used | `du -sh /opt/openwa/data` |

Reference: `references/health-api.md` for what each status code means.

## 3. QR Scan Flow

1. Create session via API: `POST /api/sessions {"name":"mybot"}` (header `X-API-KEY`).
2. Start: `POST /api/sessions/{id}/start` → returns QR.
3. Get QR image: `GET /api/sessions/{id}/qr` (PNG).
4. WhatsApp > Linked Devices > Link a Device > scan.
5. Session persists in `./data/sessions/auth-<id>/` (creds.json, keys).

For **remote QR** (VPS without browser):
- Option 1: TUI dashboard `http://<vps>:2785/dashboard` (same-origin)
- Option 2: `ngrok tcp 2785` then open dashboard URL via tunnel
- Option 3: decode QR from PNG with `zbarimg` and scan with phone

## 4. Engine Choice

| Engine | Resource | Bans | Stability | Notes |
|---|---|---|---|---|
| `baileys` | Low (no Chromium) | Higher (WebSocket fingerprint) | Lower on WhatsApp protocol changes | No Chromium needed |
| `whatsapp-web.js` | Higher (~250 MB RAM) | Similar | Higher; version-sync hangs possible | Pin `WWEBJS_WEB_VERSION` if stuck |

Switch: edit `ENGINE_TYPE=` in `.env`, `docker compose restart openwa-api`.

See `references/baileys-vs-wwebjs.md` for trade-off matrix.

## 5. Update Flow

```bash
cd /opt/openwa
git fetch --all
git pull --rebase   # or pin tag: git checkout v0.4.3
docker compose pull
docker compose up -d
docker compose logs --tail=100 openwa-api   # confirm "ready"
```

Save `data/` (creds.json, audit DB, media) before update — keeps sessions alive.

## 6. Backup + Restore

**Backup:**
```bash
tar czf openwa-backup-$(date +%F).tar.gz data/ .env
```
Persists: session creds, audit logs, media files, env.

**Restore:**
```bash
tar xzf openwa-backup-YYYY-MM-DD.tar.gz
docker compose up -d
```

Upload to offsite with `rclone` (cron nightly; size usually <50 MB).

## 7. Webhook Setup

```bash
curl -X POST http://127.0.0.1:2785/api/sessions/{id}/webhooks \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: $OPENWA_KEY" \
  -d '{
    "url": "https://your-server.com/wa-hook",
    "events": ["message.received", "session.status"],
    "secret": "<hmac-secret>"
  }'
```

Verify HMAC signature on receiver (`sha256` of payload with shared secret).

## 8. Common Failure Modes

| Symptom | Cause | Fix |
|---|---|---|
| Stuck at "authenticating" (wwebjs) | Version sync | Pin `WWEBJS_WEB_VERSION=2.3000.1023204257` |
| "Session logged out" | Phone scanned elsewhere | `POST /sessions/{id}/start` → re-scan QR |
| API key rejected | Wrong header name | Use `X-API-KEY`, not `Authorization` |
| `ECONNREFUSED 127.0.0.1:2785` from remote | BIND_HOST=127.0.0.1 | Set `BIND_HOST=0.0.0.0` + reverse proxy |
| Postgres refuses to start | Default `DATABASE_PASSWORD` | Set strong pw in `.env` |

## 9. ToS Reminder

OpenWA is **NOT** sanctioned by Meta. Use cases that risk bans:
- Bulk unsolicited messaging
- Multi-account mass operations
- Impersonation / spam

Safer patterns: customer support, internal tooling, transaction notifications (opt-in).
