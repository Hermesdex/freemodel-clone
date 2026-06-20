# Baileys vs whatsapp-web.js — Trade-off

| Aspect | `baileys` | `whatsapp-web.js` |
|---|---|---|
| Transport | Pure WebSocket | Headless Chromium |
| RAM | ~80-120 MB | ~250-400 MB |
| CPU (idle) | ~0.5% | ~2-4% |
| Disk | Low | Chromium ~250 MB |
| Startup | Instant | 3-8 s |
| Bans | Higher (WS fingerprint) | Lower (browser fingerprint) |
| Stability | Drops on WA protocol change | Auto-recovers |
| Multi-session memory | Cheap | Expensive |
| Proxy support | ❌ not yet | ✅ per-session proxy |
| Headless on VPS ARM | ✅ pure JS | ⚠ needs explicit Chromium binary path |

## When to pick Baileys

- Tight VPS (1 GB RAM or less)
- ARM/Raspberry Pi
- Programmatic control (no browser rendering)
- Many sessions (5+)

## When to pick wwebjs

- Visibility — can run `puppeteer.connect()` for debugging
- Per-session proxy (geo-distributed numbers)
- Need media rendering pipeline

## Switching

`ENGINE_TYPE=baileys` or `ENGINE_TYPE=whatsapp-web.js` in `.env`.

Restart:
```bash
docker compose restart openwa-api
```

Existing session creds **survive engine swap** if you keep `BAILEYS_AUTH_DIR/data/sessions`.

## Known Version-Pin Issue (wwebjs)

If session stuck at `authenticating` for >60 s with QR scanned:

```env
WWEBJS_WEB_VERSION=2.3000.1023204257
```

(otherwise auto `latest`)

Check available versions: https://github.com/wppconnect-team/wa-version (browse `html/` folder).
