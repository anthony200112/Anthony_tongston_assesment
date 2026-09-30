# Tongston T-World Module

A production-ready content management, AI summarization, and tokenized rewards platform. Users create content, run AI-powered summarization, earn tokens for each successful AI run, and convert those tokens into mock on-chain assets (MOCK_USDT / MOCK_ETH) with simulated transaction hashes.

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Backend     | Node.js 18+, Express.js                         |
| Database    | MongoDB Atlas (Mongoose ODM)                    |
| Frontend    | React 18, Vite, TypeScript, Tailwind CSS        |
| Validation  | Joi                                             |
| Logging     | winston                                         |
| Auth        | JWT (bcrypt password hashing)                   |
| Storage     | Mock Cloudinary + AWS S3 (code structure ready) |
| Deployment  | Render.com (backend), Vercel (frontend)         |

---

## Project Structure

```
tongston-t-world/
├── backend/
│   ├── src/
│   │   ├── config/         # env + database connection
│   │   ├── models/         # Content, User, AIRun, TokenTransaction, ContractConversion
│   │   ├── routes/         # content, ai, tokens, media, auth
│   │   ├── controllers/    # business logic per resource
│   │   ├── middleware/     # auth (JWT), validation (Joi), error handler
│   │   ├── utils/          # logger, tokenCalculator, mockAI
│   │   └── app.js          # Express app composition
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── src/                    # Frontend (React + Vite + Tailwind)
│   ├── components/         # ContentList, AIRunner, TokenDashboard, TokenConverter, Navigation
│   ├── pages/              # Home, ContentPage, AIPage, TokensPage, Admin
│   ├── hooks/              # useApi (data fetching)
│   ├── services/           # api.ts (API client with mock fallback)
│   └── App.tsx
├── README.md
├── DEPLOYMENT.md
└── postman_collection.json
```

> The frontend lives at the repository root (Vite project). The backend is in `backend/`.

---

## Setup Instructions

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier) — or use the connection string format below
- npm

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev   # starts on http://localhost:5000
```

Required environment variables (see `backend/.env.example`):

| Variable        | Description                              | Example                                      |
|-----------------|------------------------------------------|----------------------------------------------|
| `MONGODB_URI`   | MongoDB Atlas connection string          | `mongodb+srv://user:pass@cluster.../db`     |
| `JWT_SECRET`    | Secret used to sign JWTs                 | `any-long-random-string`                     |
| `NODE_ENV`      | Environment                              | `development` or `production`                |
| `PORT`          | Backend port                             | `5000`                                       |
| `FRONTEND_URL`  | Allowed CORS origin                      | `http://localhost:5173`                      |
| `ADMIN_EMAIL`   | Default admin email (seeded on boot)     | `admin@tongston.com`                         |
| `ADMIN_PASSWORD`| Default admin password (seeded on boot)  | `Admin123!`                                  |

On first boot, a default admin user is automatically created with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

### 2. Frontend

```bash
# From the repository root
npm install
cp .env.example .env   # set VITE_API_URL to your backend URL
npm run dev            # starts on http://localhost:5173
```

If `VITE_API_URL` is not set, the frontend runs in **mock mode** — all API calls are simulated in-browser with seed data, so you can explore the full UI without a backend.

---

## API Endpoints

### Auth

| Method | Route             | Description                     |
|--------|-------------------|---------------------------------|
| POST   | `/auth/register`  | Register a new user             |
| POST   | `/auth/login`     | Login and receive a JWT         |

### Content

| Method | Route                          | Description                                  |
|--------|--------------------------------|----------------------------------------------|
| POST   | `/content`                     | Create content (title, body, tags)           |
| GET    | `/content?tag=&q=&page=&limit=`| List content with filters and pagination     |
| GET    | `/content/:id`                 | Get single content                           |

### AI

| Method | Route                              | Description                                       |
|--------|------------------------------------|---------------------------------------------------|
| POST   | `/content/:id/ai/summarize`        | Run AI summarization (tone, length), award tokens |

### Tokens

| Method | Route              | Description                                     |
|--------|--------------------|-------------------------------------------------|
| GET    | `/tokens/balance`  | Get current token balance                       |
| GET    | `/tokens/history`  | Get transaction ledger (paginated)              |
| POST   | `/tokens/convert`  | Convert tokens to MOCK_USDT or MOCK_ETH         |
| POST   | `/tokens/withdraw` | Simulate token withdrawal                       |

### Media

| Method | Route               | Description                      |
|--------|---------------------|----------------------------------|
| POST   | `/media/upload`     | Mock Cloudinary upload           |
| POST   | `/media/:id/promote`| Mock promote to S3               |

### Health

| Method | Route     | Description         |
|--------|-----------|---------------------|
| GET    | `/health` | Health check        |

---

## curl Examples

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tongston.com","password":"Admin123!"}'

# Create content (use token from login)
curl -X POST http://localhost:5000/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{"title":"My Article","body":"This is the content body with enough text to pass validation.","tags":["ai","education"]}'

# List content
curl http://localhost:5000/content

# Get single content
curl http://localhost:5000/content/<CONTENT_ID>

# Run AI summarization
curl -X POST http://localhost:5000/content/<CONTENT_ID>/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{"tone":"professional","length":"medium"}'

# Get token balance
curl http://localhost:5000/tokens/balance

# Get token history
curl http://localhost:5000/tokens/history

# Convert tokens to MOCK_USDT
curl -X POST http://localhost:5000/tokens/convert \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"toAsset":"MOCK_USDT"}'

# Convert tokens to MOCK_ETH
curl -X POST http://localhost:5000/tokens/convert \
  -H "Content-Type: application/json" \
  -d '{"amount":200,"toAsset":"MOCK_ETH"}'

# Withdraw tokens
curl -X POST http://localhost:5000/tokens/withdraw \
  -H "Content-Type: application/json" \
  -d '{"amount":50,"address":"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"}'

# Upload media (mock)
curl -X POST http://localhost:5000/media/upload \
  -H "Content-Type: application/json" \
  -d '{"fileName":"photo.jpg","contentType":"image/jpeg"}'

# Promote media to S3 (mock)
curl -X POST http://localhost:5000/media/<MEDIA_ID>/promote
```

> **Note:** Auth is optional. If no `Authorization` header is sent, the API automatically uses the first admin user so all endpoints are testable without login.

---

## Token System

- **Earning:** Users earn **5 tokens** per successful AI summarization run.
- **Conversion rates:**
  - 100 Tokens = 1 MOCK_USDT
  - 200 Tokens = 0.01 MOCK_ETH
- **Ledger:** Every token movement (earn, convert, withdraw) is recorded as an immutable `TokenTransaction` with a `balanceAfter` snapshot.
- **Transaction hashes:** Mock EVM-style hashes (`0x` + 64 hex chars) are generated for conversions and withdrawals.

---

## What's Mocked vs Real

| Component             | Status  | Notes                                                        |
|-----------------------|---------|--------------------------------------------------------------|
| AI summarization      | Mocked  | Extractive summary from content body (no LLM API call)       |
| Cloudinary storage    | Mocked  | Returns fake Cloudinary URLs, stored in memory               |
| AWS S3 promotion      | Mocked  | Returns fake S3 URLs                                         |
| Token conversion      | Mocked  | Simulated rates and transaction hashes                       |
| Token withdrawal      | Mocked  | Simulated on-chain withdrawal with mock hash                 |
| MongoDB               | Real    | Requires MongoDB Atlas connection string                     |
| JWT authentication    | Real    | Real bcrypt hashing + JWT signing                            |
| Input validation      | Real    | Joi schemas on every endpoint                                |
| Error handling        | Real    | Centralized middleware, no stack trace leaks in production   |
| Logging               | Real    | winston logger for all key operations                        |

---

## Assumptions

1. Auth is optional — the API works without a JWT by defaulting to the first admin user, making it easy to test with curl/Postman.
2. The AI summarizer is intentionally mocked so the full pipeline is testable without API keys. Swapping in a real LLM is a single-function change in `utils/mockAI.js`.
3. Media storage is mocked in-memory; the code structure mirrors real Cloudinary/S3 integration points.
4. Token conversion rates are fixed and mock — no real blockchain interaction occurs.
5. The frontend uses `HashRouter` so it works on static hosts (Vercel, GitHub Pages) without server-side routing config.

---

## Test Credentials

A default admin account is seeded on first boot:

- **Email:** `admin@tongston.com`
- **Password:** `Admin123!`

Override these with `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables.

---

## Postman Collection

Import `postman_collection.json` into Postman for all pre-configured requests.

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step Render + Vercel + MongoDB Atlas setup.
