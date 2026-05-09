# TypeDuel Architecture

## Runtime Split

- Next.js on Vercel serves the React UI, Supabase Auth pages, profile APIs, leaderboard APIs, and match history APIs.
- Supabase PostgreSQL stores users, rooms, matches, rankings, match results, and paragraph inventory with RLS enabled.
- Socket.IO runs as a separate long-lived Node service because Vercel serverless functions do not provide durable WebSocket processes.

## Match Lifecycle

1. Client connects to Socket.IO and sends `player:hello`.
2. Server validates the Supabase access token when present; otherwise it assigns a guest identity.
3. `queue:join` places the player in the in-memory quick queue, or `room:create`/`room:join` handles a private invite code.
4. When two players are paired, the server generates one seed, selects one paragraph from Supabase, and creates one match ID.
5. Both sockets join the same match room and receive `match:found` with the same paragraph, seed, `startsAt`, and server clock.
6. The server emits countdown ticks and then `match:started`.
7. Clients send throttled `typing:update` payloads. The server recalculates progress, WPM, accuracy, and completion.
8. The match ends when both players finish, a first-finisher grace period expires, the time limit is hit, or a player leaves.
9. The server determines the winner and persists `matches` and `match_results`, then updates `users` and `rankings`.

## Winner Rules

Ordering is deterministic:

1. Completed paragraph beats incomplete paragraph.
2. Higher WPM wins.
3. Higher accuracy wins.
4. Faster completion time wins.
5. If neither player completed, higher completion percentage is the final fallback.

## Anti-Cheat

- Paragraphs are selected once by the server and never by the browser.
- Countdown and start time are server-generated.
- Paste/drop is blocked in the UI.
- The socket server validates monotonic timing and flags paste-like bursts, impossible character rates, early starts, and large rollbacks.
- WPM, accuracy, completion percent, and result storage are recalculated on the server.
- Suspicious results receive zero XP and keep their flags in `match_results.suspicious_flags`.

## Socket Event Contract

Client emits:

- `player:hello`: `{ accessToken?, guestId?, name?, avatarUrl? }`
- `queue:join`
- `queue:leave`
- `room:create`
- `room:join`: `{ code }`
- `match:ready`: `{ matchId }`
- `typing:update`: `{ matchId, typed, clientSentAt }`
- `match:leave`

Server emits:

- `player:ready`: public player identity
- `stats:update`: online player, active match, and queue counts
- `queue:waiting`
- `room:created`: `{ code }`
- `room:joined`: `{ code }`
- `match:found`: paragraph, seed, players, start time
- `match:countdown`: remaining milliseconds and server time
- `match:started`
- `self:update`
- `opponent:update`
- `match:ended`
- `match:error`

## Scaling Notes

- Match state is stored in Maps for O(1) lookup by socket ID and match ID.
- Client sends full typed state but throttles updates; server broadcasts opponent stats at roughly 80 ms intervals.
- `perMessageDeflate` is disabled to reduce CPU pressure under many small typing events.
- For 1000+ concurrent matches across multiple Socket.IO instances, add a Redis adapter and move queues/active match state into Redis or another low-latency shared store.
- Supabase is only touched at match start/end and for auth/profile lookup, keeping keystroke traffic off the database.

## Folder Structure

- `src/app`: Next.js routes, API handlers, layout, and providers
- `src/components`: reusable UI, auth, landing, leaderboard, profile, and game components
- `src/hooks`: socket and sound-effect hooks
- `src/lib`: Supabase clients, environment helpers, utility composition
- `src/services`: paragraph seed and selection service
- `src/store`: Zustand match state
- `src/types`: shared game types
- `src/utils`: typing-stat and ranking logic
- `server`: Socket.IO/Express gameplay server
- `supabase`: SQL schema, RLS policies, seed data
