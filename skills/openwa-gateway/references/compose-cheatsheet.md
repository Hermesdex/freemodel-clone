# Docker Compose Cheatsheet — OpenWA

## Profiles

OpenWA uses profile-based docker-compose to opt into optional services:

| Service | Profile | Purpose |
|---|---|---|
| `postgres` | (default with `POSTGRES_BUILTIN=true`) | Replaces SQLite |
| `redis` | (default with `REDIS_BUILTIN=true`) | Queue + cache |
| `minio` | (default with `MINIO_BUILTIN=true`) | S3-compatible media |

Bring up with one service: `docker compose --profile builtin-redis up -d`.

## Common Operations

```bash
docker compose ps                          # status
docker compose logs --tail=200 <svc>       # logs
docker compose restart <svc>               # restart one
docker compose pull && docker compose up -d # update images
docker compose down -v                     # stop + drop volumes (DESTRUCTIVE)
docker compose exec openwa-api sh          # shell inside API container
docker compose exec postgres psql -U openwa openwa  # SQL into DB
```

## Volume Mounts

```
/opt/openwa/data           → /app/data         (sessions, audit, media)
/opt/openwa/.env           → /app/.env:ro      (config, read-only)
/var/run/docker.sock       → /var/run/docker.sock  (for Engine-In-Container, optional)
```

Inspect:

```bash
docker volume ls | grep openwa
docker volume inspect openwa_openwa-data
```

## Networking

API listens on `0.0.0.0:2785` (configurable). In default dev compose, the dev server binds `127.0.0.1:2886`.

For external access: front with nginx/Caddy/cloud LB with TLS, and add proxy IPs to `TRUSTED_PROXIES=`.

## Resource Limits (recommend)

Add to `openwa-api` service block:

```yaml
deploy:
  resources:
    limits:
      cpus: '1.5'
      memory: 1G
    reservations:
      cpus: '0.3'
      memory: 256M
```

Baileys engine: 256 MB sufficient.
wwebjs engine: 512 MB minimum (Chromium overhead).
