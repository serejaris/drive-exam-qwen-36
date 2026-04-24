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

- Hosting: **Railway** (web + Railway Postgres, Railway Cron for reminders)
- Frontend/backend: Next.js + TypeScript + Telegram WebApp JS API
- Bot: grammY / Telegraf via webhook
- DB: Railway Postgres with Prisma or Drizzle

## Setup

1. Copy `.env.example` to `.env`, fill in the bot token and DB URL.
2. `npm install`
3. `npm run dev`

## Acceptance

See [issue #1](../../issues/1) for the MVP task + checklist.
