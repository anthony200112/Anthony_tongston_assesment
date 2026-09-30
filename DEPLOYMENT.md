# Deployment Guide — Tongston T-World

This guide walks you through deploying the backend to Render.com, the frontend to Vercel, and setting up MongoDB Atlas.

---

## Step 1: Create a MongoDB Atlas Cluster

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account.
2. Create a **free M0 cluster** (choose a cloud provider and region close to your users).
3. Under **Database Access**, create a user:
   - Username: `tongston`
   - Password: (choose a strong password, save it)
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere — fine for development).
5. Click **Connect → Drivers** and copy the connection string:
   ```
   mongodb+srv://tongston:<password>@cluster0.xxxxx.mongodb.net/tongston_t_world?retryWrites=true&w=majority
   ```
   Replace `<password>` with your database user password.
6. The database `tongston_t_world` and its collections (`content_items`, `users`, `ai_runs`, `token_transactions`, `contract_conversions`) are created automatically by Mongoose on first connection.

---

## Step 2: Deploy the Backend to Render.com

1. Push your code to a GitHub repository.
2. Go to [render.com](https://render.com) and sign up / log in.
3. Click **New + → Web Service**.
4. Connect your GitHub account and select the repository.
5. Configure the service:
   - **Name:** `tongston-t-world-api`
   - **Region:** (choose one)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
6. Add environment variables (under **Advanced → Environment Variables**):

   | Key              | Value                                              |
   |-------------------|----------------------------------------------------|
   | `MONGODB_URI`     | `mongodb+srv://tongston:<pass>@cluster.../tongston_t_world?retryWrites=true&w=majority` |
   | `JWT_SECRET`      | (generate a random 32+ char string)                |
   | `NODE_ENV`        | `production`                                       |
   | `PORT`            | `5000` (Render auto-detects, but set for clarity)  |
   | `FRONTEND_URL`    | `https://your-app.vercel.app` (set after Step 3)   |
   | `ADMIN_EMAIL`     | `admin@tongston.com`                               |
   | `ADMIN_PASSWORD`  | `Admin123!`                                        |

7. Click **Create Web Service**. Render will build and deploy.
8. Once deployed, note your backend URL: `https://tongston-t-world-api.onrender.com`.
9. Test the health check:
   ```bash
   curl https://tongston-t-world-api.onrender.com/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

---

## Step 3: Deploy the Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up / log in.
2. Click **Add New → Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (repository root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add environment variables:

   | Key             | Value                                              |
   |------------------|----------------------------------------------------|
   | `VITE_API_URL`   | `https://tongston-t-world-api.onrender.com`        |

6. Click **Deploy**.
7. Once deployed, note your frontend URL: `https://your-app.vercel.app`.
8. **Go back to Render** and update the `FRONTEND_URL` environment variable to your Vercel URL, then redeploy the backend.

---

## Step 4: Test All Endpoints

Test from the deployed backend URL:

```bash
# Health check
curl https://<BACKEND_URL>/health

# Login as admin
curl -X POST https://<BACKEND_URL>/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tongston.com","password":"Admin123!"}'

# Create content
curl -X POST https://<BACKEND_URL>/content \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Article","body":"This is a test article body for deployment verification.","tags":["test"]}'

# List content
curl https://<BACKEND_URL>/content

# Run AI summarization (replace CONTENT_ID)
curl -X POST https://<BACKEND_URL>/content/CONTENT_ID/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{"tone":"professional","length":"medium"}'

# Check token balance
curl https://<BACKEND_URL>/tokens/balance

# Convert tokens
curl -X POST https://<BACKEND_URL>/tokens/convert \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"toAsset":"MOCK_USDT"}'

# View transaction history
curl https://<BACKEND_URL>/tokens/history
```

Test the frontend:
1. Open your Vercel URL in a browser.
2. Navigate to **Content** — should show content from the backend.
3. Navigate to **AI Runner** — select content and run summarization.
4. Navigate to **Tokens** — verify balance increased by 5 tokens after AI run.
5. Navigate to **Admin** — see all content and transaction ledger.

---

## Step 5: Final Deployed URLs

After deployment, fill in these URLs for your submission:

- **Backend (Render):** `https://tongston-t-world-api.onrender.com`
- **Frontend (Vercel):** `https://your-app.vercel.app`
- **MongoDB Atlas:** `mongodb+srv://tongston:<password>@cluster0.xxxxx.mongodb.net/tongston_t_world`

---

## Troubleshooting

| Issue                          | Solution                                                    |
|--------------------------------|-------------------------------------------------------------|
| Backend won't start            | Check `MONGODB_URI` is correct and network access is `0.0.0.0/0` |
| CORS errors in browser         | Ensure `FRONTEND_URL` on Render matches your Vercel URL    |
| Frontend shows mock data       | Ensure `VITE_API_URL` is set in Vercel env vars and redeployed |
| 401 Unauthorized               | Auth is optional; if sending a token, make sure it's valid  |
| Render free tier cold starts   | First request after idle may take ~30s — this is expected   |
