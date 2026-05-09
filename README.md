# TypeDuel

TypeDuel is a modern 1v1 real-time typing battle platform built with Next.js, TypeScript, Tailwind CSS, Supabase PostgreSQL/Auth, and Socket.IO.

## Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS
- Auth and database: Supabase Auth + Supabase PostgreSQL
- Real-time gameplay: Socket.IO with server-authoritative matchmaking, countdowns, paragraph selection, progress, and winner calculation
- Persistent storage: Supabase tables for users, matches, rooms, rankings, match_results, and paragraphs

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`.

3. In Supabase SQL Editor, run:

```bash
supabase/schema.sql
```

4. Start the app and socket server:

```bash
npm run dev:all
```

Next runs at `http://localhost:3000`; Socket.IO runs at `http://localhost:4000`.

## Deployment

Deploy the Next.js app to Vercel with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SOCKET_URL`
- `NEXT_PUBLIC_APP_URL`

Socket.IO requires a long-lived Node process, so deploy `server/index.ts` on a WebSocket-capable host such as Fly.io, Railway, Render, or a VM, then point `NEXT_PUBLIC_SOCKET_URL` at that service. The app remains Vercel-ready for the UI, Supabase Auth, and API routes.

## Socket Events

Client to server:

- `player:hello`
- `queue:join`
- `queue:leave`
- `room:create`
- `room:join`
- `match:ready`
- `typing:update`
- `match:leave`

Server to client:

- `stats:update`
- `queue:waiting`
- `room:created`
- `room:joined`
- `match:found`
- `match:countdown`
- `match:started`
- `opponent:update`
- `match:ended`
- `match:error`

## Anti-Cheat Notes

The client blocks paste/drop/autofill-like interactions, but final authority lives on the socket server. The server locks the paragraph and seed, validates monotonic progress, throttles update bursts, rejects impossible WPM spikes, recalculates WPM/accuracy/completion time, and persists only server-computed results.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full project architecture, match lifecycle, socket contract, winner logic, and scaling notes.
