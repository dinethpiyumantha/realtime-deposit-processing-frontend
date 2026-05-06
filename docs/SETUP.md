# Project Setup

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 22+ |
| npm | 10+ |
| Docker & Docker Compose | v2+ |

---

## Environment Variables

Copy the example file and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:3000` | Base URL of the NestJS backend API |

---

## Running Locally (without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173**.

> The backend API must be running at `VITE_API_BASE_URL` (default `http://localhost:3000`).  
> Default dev API key: `dev-api-key`

---

## Running with Docker

### Development (hot-reload)

```bash
docker compose up dev
```

- Frontend: **http://localhost:5173**
- Source files are volume-mounted — edits reflect instantly via HMR.

> After adding new npm packages locally, rebuild to refresh the container's `node_modules`:
> ```bash
> docker compose down dev -v
> docker compose build --no-cache dev
> docker compose up dev
> ```

### Production (nginx)

```bash
docker compose up app
```

- Serves the optimised static build at **http://localhost:80**
- Multi-stage Dockerfile: Node 22 builds, nginx serves.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check + production build (`dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing |

---

## Tech Stack

| Layer | Library / Tool |
|-------|---------------|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui (base-nova / `@base-ui/react`) |
| Data fetching | TanStack Query v5 |
| Table | TanStack Table v8 |
| Forms | React Hook Form + Zod |
| Real-time | Socket.IO client (`/deposits` namespace) |
| HTTP client | Axios |
| Routing | React Router v7 |
| Notifications | Sonner |
| Linting | ESLint |
| Formatting | Prettier |
| Git hooks | Husky |

---

## Project Structure

```
src/
├── features/
│   ├── auth/          # Login form, ProtectedRoute, useAuth hook
│   ├── wallets/       # AddWalletForm, WalletList, useWallets, useRegisterWallet
│   ├── deposits/      # DepositForm, useIngestDeposit
│   └── transactions/  # TransactionsTable, StatusBadge, useTransactions, useDepositSocket
├── lib/
│   ├── axios.ts       # Axios instance with x-api-key interceptor
│   ├── query-client.ts
│   ├── socket.ts      # Socket.IO singleton (autoConnect: false)
│   └── utils.ts       # cn(), getAxiosErrorMessage()
├── pages/
│   ├── LandingPage.tsx
│   └── DashboardPage.tsx
├── services/
│   ├── wallets.service.ts
│   └── deposits.service.ts
├── store/
│   └── auth.store.tsx  # AuthContext + useAuth
└── types/
    └── index.ts        # Shared TypeScript types
```

---

## Real-time Architecture

Transactions update in real time via a **Socket.IO WebSocket** connection to the `/deposits` namespace:

- `deposit.processed` — pushes the updated transaction directly into the TanStack Query cache (no refetch).
- `deposit.callback_failed` — shows a warning toast.
- On reconnect, all wallet queries are invalidated to reconcile any missed events.
- A **30-second REST fallback** runs in the background to catch any gaps.

The live connection status is shown in the Transactions table header (`Live · WS` / `Connecting…`).
