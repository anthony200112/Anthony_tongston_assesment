# MongoDB Database Schema — Tongston T-World

## Database

```
Database name: tongston_t_world
Connection string: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/tongston_t_world?retryWrites=true&w=majority
```

Collections are created automatically by Mongoose on first connection.

---

## Collections

### 1. `users`

Stores user accounts, roles, and token balances.

| Field           | Type      | Constraints                              | Description                        |
|-----------------|-----------|------------------------------------------|------------------------------------|
| `_id`           | ObjectId  | Primary key, auto-generated              | Unique document ID                 |
| `email`         | String    | Required, unique, lowercase, trimmed     | User email — used for login        |
| `passwordHash`  | String    | Required                                 | bcrypt-hashed password (10 rounds) |
| `role`          | String    | Enum: `admin`, `user` — default: `user`  | Authorization role                 |
| `tokenBalance`  | Number    | Default: 0, min: 0                       | Current token balance              |
| `createdAt`     | Date      | Auto (timestamps)                        | Account creation time              |
| `updatedAt`     | Date      | Auto (timestamps)                        | Last modification time             |

**Indexes:** `email` (unique)

**Mongoose model:** `backend/src/models/User.js`

---

### 2. `contents`

Stores content items created by users for AI summarization.

| Field       | Type      | Constraints                              | Description                        |
|-------------|-----------|------------------------------------------|------------------------------------|
| `_id`       | ObjectId  | Primary key, auto-generated              | Unique document ID                 |
| `title`     | String    | Required, trimmed, 3–200 chars           | Content title                      |
| `body`      | String    | Required, min 10 chars                   | Content body text                  |
| `tags`      | Array     | Items: String (trimmed, lowercase)       | Category tags for filtering        |
| `createdBy` | ObjectId  | Required, ref: `users`                   | Author reference                   |
| `createdAt` | Date      | Auto (timestamps)                        | Creation time                      |
| `updatedAt` | Date      | Auto (timestamps)                        | Last modification time             |

**Indexes:**
- Text index on `title` + `body` (supports `$text` search)
- `tags` (ascending) — for tag filter queries
- `createdAt` (descending) — for chronological sorting

**Mongoose model:** `backend/src/models/Content.js`

---

### 3. `airruns`

Records every AI summarization execution with metrics and token rewards.

| Field           | Type      | Constraints                                      | Description                        |
|-----------------|-----------|--------------------------------------------------|------------------------------------|
| `_id`           | ObjectId  | Primary key, auto-generated                      | Unique document ID                 |
| `contentId`     | ObjectId  | Required, ref: `contents`                        | Content that was summarized        |
| `userId`        | ObjectId  | Required, ref: `users`                           | User who triggered the run         |
| `promptVersion` | String    | Default: `mock-summarizer-v1`                    | Version of the AI prompt/engine    |
| `tone`          | String    | Enum: `neutral`, `professional`, `casual`, `academic` | Tone parameter passed to AI   |
| `length`        | String    | Enum: `short`, `medium`, `long`                  | Length parameter passed to AI      |
| `status`        | String    | Enum: `success`, `failed`, `timeout`             | Run outcome                        |
| `output`        | String    | Default: `''`                                    | Generated summary text             |
| `latencyMs`     | Number    | Default: 0                                       | Execution time in milliseconds     |
| `tokensAwarded` | Number    | Default: 0                                       | Tokens earned (5 on success)       |
| `errorMessage`  | String    | Default: null                                    | Error details if status is failed  |
| `createdAt`     | Date      | Auto (timestamps)                                | Run timestamp                      |
| `updatedAt`     | Date      | Auto (timestamps)                                | Last modification time             |

**Indexes:**
- `userId` + `createdAt` (descending) — user's run history
- `contentId` — find all runs for a content item

**Mongoose model:** `backend/src/models/AIRun.js`

---

### 4. `tokentransactions`

Immutable ledger of every token movement. One row per credit or debit — never updated, only appended.

| Field            | Type      | Constraints                                      | Description                        |
|------------------|-----------|--------------------------------------------------|------------------------------------|
| `_id`            | ObjectId  | Primary key, auto-generated                      | Unique document ID                 |
| `userId`         | ObjectId  | Required, ref: `users`                           | User whose balance changed         |
| `type`           | String    | Enum: `EARN`, `CONVERT`, `WITHDRAW` — required   | Type of transaction                |
| `source`         | String    | Enum: `AI_USAGE`, `MANUAL` — default: `AI_USAGE` | What triggered the transaction     |
| `amount`         | Number    | Required                                         | Tokens moved (positive = earn, negative = spend) |
| `balanceAfter`   | Number    | Required, min: 0                                 | Balance snapshot after this tx     |
| `referenceId`    | ObjectId  | refPath: `referenceModel`                        | Linked document (AIRun or Conversion) |
| `referenceModel` | String    | Enum: `AIRun`, `ContractConversion`              | Which collection referenceId points to |
| `createdAt`      | Date      | Auto (timestamps)                                | Transaction timestamp              |
| `updatedAt`      | Date      | Auto (timestamps)                                | Last modification time             |

**Indexes:**
- `userId` + `createdAt` (descending) — user's transaction history

**Mongoose model:** `backend/src/models/TokenTransaction.js`

---

### 5. `contractconversions`

Records token-to-mock-asset conversions with simulated on-chain transaction hashes.

| Field        | Type      | Constraints                                      | Description                        |
|--------------|-----------|--------------------------------------------------|------------------------------------|
| `_id`        | ObjectId  | Primary key, auto-generated                      | Unique document ID                 |
| `userId`     | ObjectId  | Required, ref: `users`                           | User who initiated the conversion  |
| `fromToken`  | String    | Default: `TWD`                                   | Source token symbol                |
| `toAsset`    | String    | Enum: `MOCK_USDT`, `MOCK_ETH` — required         | Target mock asset                  |
| `amount`     | Number    | Required, min: 1                                 | Tokens converted                   |
| `exchangeRate` | Number  | Required                                         | Tokens per unit of target asset    |
| `amountOut`  | Number    | Required                                         | Target asset received              |
| `txHashMock` | String    | Required                                         | Simulated EVM tx hash (0x + 64 hex)|
| `status`     | String    | Enum: `pending`, `completed`, `failed` — default: `completed` | Conversion status |
| `createdAt`  | Date      | Auto (timestamps)                                | Conversion timestamp               |
| `updatedAt`  | Date      | Auto (timestamps)                                | Last modification time             |

**Indexes:**
- `userId` + `createdAt` (descending) — user's conversion history

**Mongoose model:** `backend/src/models/ContractConversion.js`

---

## Relationships

```
users (1) ──── (N) contents        [content.createdBy → users._id]
users (1) ──── (N) aurruns         [airrun.userId → users._id]
users (1) ──── (N) tokentransactions [tokentransaction.userId → users._id]
users (1) ──── (N) contractconversions [contractconversion.userId → users._id]
contents (1) ── (N) aurruns        [airrun.contentId → contents._id]
airruns (1) ─── (1) tokentransactions [tokentransaction.referenceId → aurruns._id, referenceModel: 'AIRun']
contractconversions (1) ── (1) tokentransactions [tokentransaction.referenceId → contractconversions._id, referenceModel: 'ContractConversion']
```

## Token Flow

1. User runs AI summarization → `airruns` row created with `status: success`, `tokensAwarded: 5`
2. User's `users.tokenBalance` incremented by 5
3. `tokentransactions` row created: `type: EARN`, `source: AI_USAGE`, `amount: +5`, `balanceAfter: <new balance>`, `referenceId: <airrun._id>`, `referenceModel: 'AIRun'`
4. User converts tokens → `contractconversions` row created with mock tx hash
5. User's `tokenBalance` decremented
6. `tokentransactions` row created: `type: CONVERT`, `amount: -<amount>`, `referenceId: <conversion._id>`, `referenceModel: 'ContractConversion'`

## Conversion Rates

| From          | To          | Rate                          |
|---------------|-------------|-------------------------------|
| 100 TWD       | 1 MOCK_USDT | 100 tokens per USDT           |
| 200 TWD       | 0.01 MOCK_ETH | 20000 tokens per 1 ETH      |
