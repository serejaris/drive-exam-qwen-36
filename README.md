# drive-exam-qwen-36

CABA driving-exam Telegram Mini App.
**Model under test:** Qwen 3.6 (Alibaba).
**Bot:** [@qwen_36_ris_bot](https://t.me/qwen_36_ris_bot).

Part of live stream `chinese-models` (2026-04-24) — see
[live.sereja.tech/chinese-models](https://live.sereja.tech/chinese-models/).

Six clones of the same PRD built in parallel by six different models.
This repo holds the Qwen 3.6 implementation.

## PRD

[`docs/PRD.md`](./docs/PRD.md) — canonical product spec (mirror of
[serejaris/tg-drive-exam](https://github.com/serejaris/tg-drive-exam/blob/main/docs/PRD.md)).

## Stack

- Next.js 15 App Router + TypeScript + React 19
- Tailwind CSS (mobile-first, `WebApp.themeParams` → CSS vars)
- Prisma + PostgreSQL (Railway Postgres)
- grammY webhook bot at `/api/telegram/webhook/:secret`
- Railway Cron hits `/api/cron/send-reminders`

## Local setup

```bash
cp .env.example .env
# Fill TELEGRAM_BOT_TOKEN, DATABASE_URL, BOT_WEBHOOK_SECRET, CRON_SECRET.

npm install
npx prisma db push          # create tables in your local Postgres
npm run db:seed             # load 10 sample CABA B questions (ES + RU)

npm run dev                 # http://localhost:3000
```

To receive Telegram updates locally, expose `localhost:3000` with a tunnel
(ngrok / cloudflared), then:

```bash
WEBAPP_URL=https://<tunnel>.ngrok.app npm run bot:setwebhook
```

Also set your Mini App URL in BotFather:
`/mybots → @qwen_36_ris_bot → Bot Settings → Menu Button → https://<tunnel>.ngrok.app/app`.

## Railway deploy

One Railway project, two services.

### 1. Create the Postgres plugin

- Railway dashboard → New project → Add Postgres.
- This exposes `DATABASE_URL` as a service variable.

### 2. Deploy this repo as a web service

- New service → Deploy from GitHub → pick `serejaris/drive-exam-qwen-36`.
- Railway auto-detects Nixpacks; `railway.json` pins:
  - Build: `npm ci && npm run build` (runs `prisma generate` via the build script).
  - Start: `npx prisma migrate deploy && npm run start`.
- Add service variables:

  | Name | Value |
  |------|-------|
  | `TELEGRAM_BOT_TOKEN` | from BotFather |
  | `TELEGRAM_BOT_USERNAME` | `qwen_36_ris_bot` |
  | `WEBAPP_URL` | the public Railway URL (e.g. `https://drive-exam-qwen-36-production.up.railway.app`) |
  | `BOT_WEBHOOK_SECRET` | long random string |
  | `CRON_SECRET` | long random string |
  | `APP_TIMEZONE` | `America/Argentina/Buenos_Aires` |
  | `DATABASE_URL` | Railway will reference the Postgres plugin — pick it from the dropdown |

- Railway will run `prisma migrate deploy` on every deploy. If your repo has no
  migrations folder yet, the easiest bootstrap is to run
  `npx prisma migrate dev --name init` locally against the Railway DB and push
  the generated `prisma/migrations/` up. Alternatively, replace the start
  command with `npx prisma db push && npm run start` for schema-sync deploys.

### 3. Seed production questions

Once deployed, from your local machine (with the Railway Postgres URL
temporarily exported):

```bash
DATABASE_URL=postgres://... npm run db:seed
```

Or open a shell in the Railway service and run `npm run db:seed`.

### 4. Register the webhook with Telegram

```bash
TELEGRAM_BOT_TOKEN=... WEBAPP_URL=https://...up.railway.app BOT_WEBHOOK_SECRET=... \
  npm run bot:setwebhook
```

### 5. Point BotFather at the Mini App URL

`/mybots → @qwen_36_ris_bot → Bot Settings → Menu Button → Configure Menu Button`
→ paste `https://<railway-url>/app`.

### 6. Schedule the cron

Railway → your service → Settings → Cron. Add a job that runs every 5 minutes:

```
*/5 * * * *   curl -sS -H "x-cron-secret: $CRON_SECRET" "$WEBAPP_URL/api/cron/send-reminders"
```

(The endpoint accepts `x-cron-secret` header, `Authorization: Bearer …`, or
`?secret=…` query param.)

## Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Next dev server |
| `npm run build` | `prisma generate && next build` |
| `npm run start` | Run the production server |
| `npm run lint` | ESLint |
| `npm run db:push` | Push Prisma schema to the DB (no migrations) |
| `npm run db:migrate` | Apply Prisma migrations (prod) |
| `npm run db:seed` | Load 10 bilingual CABA B sample questions |
| `npm run bot:setwebhook` | Register the Telegram webhook |

## Acceptance

See [issue #1](../../issues/1) for the MVP task + checklist.

## Manual QA checklist

Follows PRD §13. Quick pass:

1. `/start` in Telegram → user row created.
2. Tap the "Открыть тренировку" button → Mini App opens.
3. Auth round-trip hits `POST /api/auth/telegram`, session cookie is set.
4. Home shows Training / Exam / Mistakes / Settings.
5. Training: pick answer → feedback + explanation shown.
6. Exam: answers accepted, feedback hidden until results screen.
7. Results screen shows `N / Total`, percentage, mistakes list, CTAs.
8. Mistakes mode starts a session with previously-wrong questions only.
9. Settings: change language mode, reminder time → save → refresh → persisted.
10. `curl` the cron endpoint with `x-cron-secret` → Telegram sends the reminder.
