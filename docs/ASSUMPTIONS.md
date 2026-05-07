# Assumptions & Limitations

## Assumptions

- The NestJS backend is running at `VITE_API_BASE_URL` (default `http://localhost:3000`) and accepts `x-api-key` authentication.
- The backend exposes a Socket.IO namespace at `/deposits` and emits `deposit.processed` / `deposit.callback_failed` events.
- Wallet addresses are alphanumeric strings (hyphens and underscores allowed). No blockchain address format is enforced.
- A single API key grants full access — there is no per-user scoping.

## Limitations

- **No token expiry** — the API key persists in `localStorage` until the user signs out or a 401 is received.
- **No pagination** — all transactions for all wallets are fetched and rendered in a single table. Performance degrades with large transaction volumes.
- **Single dashboard** — the app has one route (`/dashboard`). Multi-user or multi-tenant views are out of scope.
- **Callback failures are informational only** — the `deposit.callback_failed` toast is a warning; there is no retry mechanism in the UI.
- **WebSocket auth** — the socket connection does not send the API key (the backend `/deposits` namespace does not require it in this implementation).
