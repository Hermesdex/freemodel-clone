# Health + API Endpoints (OpenWA)

## Health Probe

```
GET /api/health
```

Response (200 OK):
```json
{
  "status": "ok",
  "version": "0.4.3",
  "engine": "baileys",
  "uptime_sec": 1234,
  "sessions": 3,
  "db": "ok"
}
```

`db: "degraded"` = DB responding slowly or schema dirty → check logs.

## Public Endpoints (API key required)

All require header `X-API-KEY: <key>` (set via dashboard or first-boot wizard).

### Sessions

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/sessions` | List all sessions |
| POST | `/api/sessions` | Create session `{name}` |
| DELETE | `/api/sessions/{id}` | Delete session + creds |
| POST | `/api/sessions/{id}/start` | Spawn QR-ready |
| GET | `/api/sessions/{id}/qr` | PNG QR code |
| GET | `/api/sessions/{id}/status` | `pending|qr|authenticated|ready|disconnected` |
| POST | `/api/sessions/{id}/logout` | Logout (keeps record, drops creds) |
| POST | `/api/sessions/{id}/restart` | Reset WebSocket session |

### Messaging

| Method | Path |
|---|---|
| POST | `/api/sessions/{id}/messages/send-text` |
| POST | `/api/sessions/{id}/messages/send-media` |
| POST | `/api/sessions/{id}/messages/send-reaction` |
| POST | `/api/sessions/{id}/messages/send-bulk` |

### Webhook

| Method | Path |
|---|---|
| POST | `/api/sessions/{id}/webhooks` |
| GET | `/api/sessions/{id}/webhooks` |
| DELETE | `/api/sessions/{id}/webhooks/{webhookId}` |

### Other

| Method | Path |
|---|---|
| GET | `/api/metrics` (with `Authorization: Bearer <METRICS_TOKEN>`) |
| GET | `/api/audit` |
| GET | `/api/docs` (Swagger UI) |
| GET | `/dashboard` (web UI) |

## Status Probe From VPS

```bash
curl -fsS http://127.0.0.1:2785/api/health | jq .
```

Exit code:
- `0` = healthy
- non-zero + 503 = engine down

## Failure Codes

| Code | Meaning |
|---|---|
| 401 | Missing/incorrect API key |
| 404 | Session not found |
| 409 | Session already exists |
| 410 | Session permanently logged out |
| 429 | Rate-limit hit |
| 503 | Engine offline |
