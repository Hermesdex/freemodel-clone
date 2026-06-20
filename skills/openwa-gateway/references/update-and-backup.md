# Update + Backup — OpenWA

## Update flow

```bash
cd /opt/openwa

# 1. Snapshot first
tar czf /opt/openwa-backups/before-update-$(date +%s).tar.gz data .env

# 2. Pull latest
git fetch --all
git pull --rebase            # or pin: git checkout v0.4.3
# (check CHANGELOG.md for breaking changes)

# 3. Pull new image
docker compose pull

# 4. Recreate
docker compose up -d

# 5. Verify
docker compose logs --tail=100 openwa-api
curl -fsS http://127.0.0.1:2785/api/health | jq .
```

## Backup shape

```
openwa-backup-YYYY-MM-DD.tar.gz
├── data/
│   ├── sessions/auth-*/creds.json
│   ├── sessions/auth-*/keys.json
│   ├── media/...
│   ├── audit.sqlite (if SQLite)
│   └── ...
└── .env
```

Restore = untar at `/opt/openwa`.

## Offsite strategy (cron)

```bash
0 3 * * * tar czf /tmp/openwa-$(date +\%F).tar.gz -C /opt/openwa data .env \
            && rclone copyto /tmp/openwa-$(date +\%F).tar.gz gdrive:openwa-backups/ \
            && rm /tmp/openwa-*.tar.gz
```

(`date` needs `\%` escaping inside crontab.)

## Restore test checklist

- [ ] `docker compose up -d` starts without error
- [ ] `/api/health` returns 200 with `db: ok`
- [ ] Sessions list re-loads (creds.json present)
- [ ] Webhook URLs preserved (or re-register if webhook secret rotated)
- [ ] Old audit logs queryable
