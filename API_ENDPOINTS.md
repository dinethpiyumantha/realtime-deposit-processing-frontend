# Realtime Deposit Processing API - Frontend Integration Guide

## Base URLs
- API Base URL: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api/docs`

## Authentication
All endpoints require this header:

```http
x-api-key: dev-api-key
```

Notes:
- The API key is validated by `ApiKeyGuard`.
- Key source: `API_KEY` env var (defaults to `dev-api-key` in local/dev when not set).

Unauthorized response:

```json
{
  "statusCode": 401,
  "message": "Invalid or missing x-api-key header",
  "error": "Unauthorized"
}
```

---

## Response/Validation Behavior
- Global validation is enabled (`whitelist`, `forbidNonWhitelisted`, `transform`).
- Unknown body fields are rejected.
- Validation errors return `400 Bad Request`.
- Standard NestJS error shape:

```json
{
  "statusCode": 400,
  "message": "string or string[]",
  "error": "Bad Request"
}
```

---

## Data Models

### Wallet
| Field | Type | Description |
|---|---|---|
| `address` | `string` | Primary key, unique wallet identifier |
| `createdAt` | `string (ISO datetime)` | Creation timestamp |

### Transaction
| Field | Type | Description |
|---|---|---|
| `id` | `string` | CUID transaction id |
| `walletAddress` | `string` | FK to `Wallet.address` |
| `transactionHash` | `string` | Unique transaction hash |
| `amount` | `string` | Decimal(20,8), returned as string by Prisma serialization |
| `status` | `"PENDING" | "PROCESSED" | "FAILED"` | Processing status |
| `createdAt` | `string (ISO datetime)` | Created timestamp |
| `updatedAt` | `string (ISO datetime)` | Last update timestamp |

---

## Endpoints

## 1) Register Wallet
### `POST /wallets`
Create a wallet if the address does not already exist.

Headers:

```http
x-api-key: dev-api-key
Content-Type: application/json
```

Request body:

```json
{
  "address": "wallet-abc123"
}
```

Field constraints:
- `address`:
  - required
  - string
  - regex: `^[a-zA-Z0-9_-]{1,100}$`
  - only alphanumeric, `_`, `-`

Success (`201 Created`):

```json
{
  "address": "wallet-abc123",
  "createdAt": "2026-05-06T11:50:59.000Z"
}
```

Errors:
- `409 Conflict` (duplicate)

```json
{
  "statusCode": 409,
  "message": "Wallet address 'wallet-abc123' is already registered",
  "error": "Conflict"
}
```

- `400 Bad Request` (validation)

```json
{
  "statusCode": 400,
  "message": [
    "address must be alphanumeric (hyphens and underscores allowed)"
  ],
  "error": "Bad Request"
}
```

---

## 2) List Wallets
### `GET /wallets`
Return all wallets ordered by `createdAt desc`.

Headers:

```http
x-api-key: dev-api-key
```

Success (`200 OK`):

```json
[
  {
    "address": "wallet-abc123",
    "createdAt": "2026-05-06T11:50:59.000Z"
  },
  {
    "address": "wallet-xyz789",
    "createdAt": "2026-05-06T10:00:00.000Z"
  }
]
```

Possible empty result:

```json
[]
```

---

## 3) Get Wallet by Address (with Transactions)
### `GET /wallets/:address`
Return wallet and nested transactions ordered by `createdAt desc`.

Headers:

```http
x-api-key: dev-api-key
```

Path params:
- `address` (string)

Success (`200 OK`):

```json
{
  "address": "wallet-abc123",
  "createdAt": "2026-05-06T11:50:59.000Z",
  "transactions": [
    {
      "id": "cmabc123xyz",
      "walletAddress": "wallet-abc123",
      "transactionHash": "0xabc123def456",
      "amount": "1.50000000",
      "status": "PROCESSED",
      "createdAt": "2026-05-06T12:00:00.000Z",
      "updatedAt": "2026-05-06T12:00:01.000Z"
    }
  ]
}
```

Error:
- `404 Not Found`

```json
{
  "statusCode": 404,
  "message": "Wallet 'wallet-abc123' not found",
  "error": "Not Found"
}
```

---

## 4) Ingest Deposit (Idempotent)
### `POST /deposits`
Ingest deposit request and enqueue async processing.

Behavior:
- Verifies `walletAddress` exists.
- Checks `transactionHash` uniqueness for idempotency.
- If hash already exists: returns existing transaction with `idempotent: true`.
- If new: creates transaction with `status = PENDING`, enqueues background job, returns immediately with `idempotent: false`.

Headers:

```http
x-api-key: dev-api-key
Content-Type: application/json
```

Request body:

```json
{
  "walletAddress": "wallet-abc123",
  "transactionHash": "0xabc123def456",
  "amount": 1.5
}
```

Field constraints:
- `walletAddress`: required string
- `transactionHash`: required string, max length 255
- `amount`: required positive number, max 8 decimal places

Success (`201 Created`) - new transaction:

```json
{
  "idempotent": false,
  "transaction": {
    "id": "cmabc123xyz",
    "walletAddress": "wallet-abc123",
    "transactionHash": "0xabc123def456",
    "amount": "1.50000000",
    "status": "PENDING",
    "createdAt": "2026-05-06T12:00:00.000Z",
    "updatedAt": "2026-05-06T12:00:00.000Z"
  }
}
```

Success (`201 Created`) - duplicate hash (idempotent):

```json
{
  "idempotent": true,
  "transaction": {
    "id": "cmabc123xyz",
    "walletAddress": "wallet-abc123",
    "transactionHash": "0xabc123def456",
    "amount": "1.50000000",
    "status": "PROCESSED",
    "createdAt": "2026-05-06T12:00:00.000Z",
    "updatedAt": "2026-05-06T12:00:01.000Z"
  }
}
```

Errors:
- `400 Bad Request` if wallet is not registered

```json
{
  "statusCode": 400,
  "message": "Wallet 'wallet-abc123' is not registered",
  "error": "Bad Request"
}
```

- `400 Bad Request` validation errors

```json
{
  "statusCode": 400,
  "message": [
    "walletAddress should not be empty",
    "amount must be a positive number"
  ],
  "error": "Bad Request"
}
```

---

## Async Processing + Callback Details (important for FE expectations)

After `POST /deposits` returns:
- A BullMQ job is queued (`deposit-processing`, job `process`).
- Worker loads transaction by id.
- If status is not `PENDING`, worker skips.
- Otherwise worker simulates delay and updates status to `PROCESSED` inside a serializable DB transaction.
- Then it sends callback HTTP POST to `CALLBACK_URL`.

Callback payload:

```json
{
  "walletAddress": "wallet-abc123",
  "amount": "1.50000000",
  "transactionHash": "0xabc123def456"
}
```

Callback retry policy:
- Max attempts: 3
- Exponential backoff between attempts (2s, 4s, 8s pattern in callback retry function)
- Logs failures using Nest Logger

Queue retry policy (job level):
- Attempts: 3
- Backoff: exponential, base delay 1000ms

Note for frontend:
- Deposit endpoint is asynchronous. Immediate response does not guarantee `PROCESSED` yet.
- To reflect final status, frontend should either:
  - poll an endpoint (not implemented yet), or
  - rely on downstream callback-driven updates in your integration architecture.

---

## Environment Variables Relevant to Frontend Integration
- `API_KEY` - value expected in `x-api-key`
- `CALLBACK_URL` - backend callback target after processing
- `REDIS_HOST`, `REDIS_PORT` - queue backend
- `DATABASE_URL` - PostgreSQL

---

## Quick Frontend Examples

### Register wallet

```bash
curl -X POST http://localhost:3000/wallets \
  -H "x-api-key: dev-api-key" \
  -H "Content-Type: application/json" \
  -d '{"address":"wallet-abc123"}'
```

### Ingest deposit

```bash
curl -X POST http://localhost:3000/deposits \
  -H "x-api-key: dev-api-key" \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"wallet-abc123","transactionHash":"0xabc123def456","amount":1.5}'
```

### List wallets

```bash
curl -X GET http://localhost:3000/wallets \
  -H "x-api-key: dev-api-key"
```
