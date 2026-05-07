# Design Decisions

**Feature-based folder structure** — Code is organised by domain (`auth`, `wallets`, `deposits`, `transactions`) rather than by type (components/, hooks/). Each feature is self-contained with its own components, hooks, and barrel export.

**TanStack Query for server state** — Handles caching, background refetching, and loading/error states without a global Redux-style store. WebSocket events write directly into the cache via `setQueryData`, keeping REST and WebSocket state in sync.

**Socket.IO singleton** — A single socket instance is created at module level (`src/lib/socket.ts`) and shared across the app. This prevents duplicate connections when components re-render.

**Native `<select>` over shadcn Select** — The `@base-ui/react` Select component renders into a portal that caused the page to freeze on interaction. Replaced with a styled native `<select>` to avoid the issue.

**String Zod schema for amount** — The deposit amount field uses `z.string().refine(...)` instead of `z.number()` to give full control over validation messaging and avoid browser number-input coercion quirks.

**API key in `localStorage`** — Suitable for a development/demo tool. The key is never sent except as an HTTP header on API requests and is cleared automatically on 401.
