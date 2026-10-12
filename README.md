# CareCircle

An elder-care check-in system with two apps sharing one backend:

- **`apps/web`** — Next.js admin dashboard for the children/caregivers: manage parents, set medicine/meal/sleep reminder times, view a live-feed placeholder, and track check-in history/adherence.
- **`apps/mobile`** — Expo (React Native) app for the elderly parent: large-text, high-contrast UI that fires daily notifications ("Did you take your medicine?") and lets them answer Yes/No with one tap, plus a simple daily mood check-in.

Both apps talk to the same backend, which lives inside `apps/web` as Next.js API routes backed by Prisma + SQLite (swap the `DATABASE_URL` in `apps/web/.env` for Postgres/MySQL when you're ready for production).

## Data model

`Elder` (parent) ↔ `Caregiver` (child) via `CaregiverLink` (many-to-many, so siblings can share one parent). Each `Elder` has `Reminder`s (medicine/meal/sleep/wake/custom, a time, and a question), each of which produces daily `CheckIn` records the elder answers. `MoodLog` captures the simple daily mood check-in.

## Running it

### 1. Admin web dashboard

```bash
cd apps/web
npm install        # already done if you just cloned this
npx prisma db push # creates dev.db from prisma/schema.prisma
npx tsx prisma/seed.ts   # optional: adds a sample family
npm run dev
```

Open http://localhost:3000 — you'll see the family list, and each parent's page has the live-feed placeholder, a 7-day adherence chart, the reminder editor, and check-in history.

### 2. Elder mobile app

```bash
cd apps/mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (or run `npm run android` / `npm run ios`). On first launch it asks for:
1. **Server address** — the admin dashboard's URL reachable from the phone, e.g. `http://192.168.1.20:3000` (your computer's LAN IP, not `localhost`, if testing on a real device).
2. **Which profile is you** — pick from the parents added in the web dashboard.

From then on it shows today's reminders as big cards with Yes/Not yet buttons, and schedules a real local notification for each active reminder's time every day.

## What's stubbed for now

- **Live feed** connects to a real ESP32-CAM stream via `src/components/LiveFeed.tsx` — set the camera's address from the "Add camera" button on the elder's dashboard page. Firmware for the camera (MJPEG stream + MQTT door-status LED) lives in [`firmware/esp32-cam`](firmware/esp32-cam).
- **Auth** is intentionally absent (no login) to keep the MVP simple — anyone with the server address can see all profiles. Add caregiver auth (e.g. NextAuth) and a pairing code/PIN for the mobile app before using this with real family data.
- **Missed-reminder detection** isn't automated yet — `CheckIn.status` stays `PENDING` until the elder answers; add a scheduled job (cron/queue) that flips overdue ones to `MISSED` and optionally pushes a notification to the caregiver.
- **Push notifications to caregivers** (e.g. "Mom missed her evening medicine") aren't wired up — the mobile app only handles *local* notifications to the elder. Wiring caregiver alerts would need Expo push tokens stored per elder device and a server-side trigger.
