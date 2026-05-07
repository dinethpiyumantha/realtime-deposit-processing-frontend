# Architecture

## Overview

```
Browser
  └── React SPA (Vite)
        ├── REST (Axios)        →  NestJS API  →  PostgreSQL
        └── WebSocket (Socket.IO)  /deposits namespace
```

## Frontend Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Pages | `src/pages/` | Route-level components |
| Features | `src/features/` | Self-contained domain modules (auth, wallets, deposits, transactions) |
| Services | `src/services/` | Raw API calls (Axios) |
| Store | `src/store/` | Global auth state via React Context |
| Lib | `src/lib/` | Axios client, TanStack Query client, Socket.IO singleton, utilities |

## Data Flow

1. **Auth** — API key stored in `localStorage`; Axios request interceptor attaches it as `x-api-key` on every request. 401 responses auto-clear the key and redirect to login.

2. **Wallets** — Fetched on mount and polled every 5 s via TanStack Query.

3. **Transactions** — Each wallet's transactions are fetched individually (`GET /wallets/:address`) and merged in `useTransactions`. The Socket.IO hook updates the TanStack Query cache in-place on `deposit.processed` events — no refetch needed. A 30 s REST poll runs as a fallback.

## Real-time

```
Socket.IO  →  useDepositSocket  →  queryClient.setQueryData  →  React re-render
```

- Singleton socket in `src/lib/socket.ts` (`autoConnect: false`).
- `useDepositSocket` connects on mount, disconnects on unmount.
- Dependency key is derived from wallet addresses string, not the array reference, to prevent reconnects on every poll cycle.
