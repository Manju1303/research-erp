# Scriptara ERP — Production Cloud Publishing Guide

This guide walks you through publishing the **Scriptara Research Publication Management ERP** live to the web using the recommended enterprise stack:
- **Frontend**: [Vercel](https://vercel.com) (Next.js 14 edge hosting, global CDN, instant preview deployments)
- **Backend**: [Render](https://render.com) or [Railway](https://railway.app) (NestJS 10 container / web service)
- **Database**: Managed PostgreSQL 16 (with connection pooling and automatic SSL)

---

## Architecture at a Glance

```
  [ Vercel CDN ]  <--- Users & Researchers
  https://research-erp-frontend.vercel.app
         │
         │  (HTTPS REST calls with JWT Bearer Auth)
         ▼
  [ Render / Railway ]  <--- NestJS 10 API
  https://inzovate-backend.onrender.com/api/v1
         │
         │  (Internal SSL Connection)
         ▼
  [ Managed PostgreSQL 16 ]  <--- 19 Relational Entities
```

---

## ⚡ Step 1: Deploy Backend & Database on Render (5 Minutes)

We have provided a pre-configured Infrastructure-as-Code blueprint (`render.yaml`) that creates both the PostgreSQL database and the NestJS web service in a single click.

1. **Sign in to Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com) and log in with your GitHub account.

2. **Create New Blueprint Instance**:
   - In the top right, click **New +** $\rightarrow$ select **Blueprint**.
   - Connect your GitHub repository: `Manju1303/research-erp`.
   - Render will detect `render.yaml` automatically.

3. **Verify Detected Resources**:
   - **`inzovate-db`**: Managed PostgreSQL Database.
   - **`inzovate-backend`**: Web Service running NestJS.
   - Click **Apply**.

4. **Automated Build & Migration**:
   - Render will:
     1. Provision the PostgreSQL instance.
     2. Build the NestJS backend and generate Prisma Client.
     3. Run database migrations (`npx prisma migrate deploy`).
     4. Seed the database with all 9 roles, users, journals, and projects (`npm run db:seed`).
     5. Start the backend on port 10000.

5. **Copy Your Live Backend URL**:
   - When deployment completes, copy your live backend URL from the top of the Render dashboard (e.g. `https://inzovate-backend.onrender.com`).
   - Verify it is live by visiting: `https://your-backend.onrender.com/api/docs` (Interactive Swagger UI).

---

## ⚡ Step 2: Deploy Frontend on Vercel (3 Minutes)

1. **Sign in to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub.

2. **Import Repository**:
   - Click **Add New...** $\rightarrow$ select **Project**.
   - Select **`Manju1303/research-erp`**.

3. **Configure Project Settings**:
   - **Framework Preset**: Next.js (automatically detected).
   - **Root Directory**: Click *Edit* and select **`apps/frontend`**.

4. **Add Environment Variables**:
   Under **Environment Variables**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com/api/v1` | **Replace with your Render backend URL from Step 1** |

5. **Deploy**:
   - Click **Deploy**.
   - In ~60 seconds, Vercel will build and publish your Next.js 14 application!
   - You will receive a live URL (e.g. `https://research-erp-manju1303.vercel.app`).

---

## ⚡ Step 3: Link Frontend Domain in Backend CORS (1 Minute)

To allow the frontend to communicate with your backend securely without browser CORS errors:

1. In your **Render Dashboard**, open your **`inzovate-backend`** service.
2. Go to **Environment** tab.
3. Update the `FRONTEND_URL` variable:
   ```env
   FRONTEND_URL=https://your-app.vercel.app,http://localhost:3000
   ```
4. Click **Save Changes** (Render will redeploy automatically in ~15 seconds).

*(Note: Our backend code already dynamically permits any `*.vercel.app` origin by default!)*

---

## 🔐 Step 4: Login to Your Live Production ERP

Once published, visit your Vercel URL and log in using any of the 9 pre-configured enterprise accounts:

- **Universal Password**: `Password123!`
- **Sample Accounts**:
  - **Super Administrator**: `admin@inzovate.com`
  - **Research Manager**: `elena.r@inzovate.com`
  - **Research Staff**: `sarah.c@inzovate.com`
  - **Quality Analyst (QC)**: `marcus.v@inzovate.com`
  - **Publication Executive**: `priya.s@inzovate.com`
  - **Client / Author (Stanford)**: `reynolds@stanford.edu`

---

## 🚂 Alternative Option: Deploying on Railway

If you prefer Railway over Render:

1. Visit [railway.app](https://railway.app) $\rightarrow$ **New Project** $\rightarrow$ **Deploy from GitHub repo**.
2. Select `Manju1303/research-erp`.
3. Click **+ New** $\rightarrow$ **Database** $\rightarrow$ **Add PostgreSQL**.
4. In your Web Service settings:
   - Root Directory: Leave as `/` (monorepo root).
   - Build Command: `npm install && npx prisma generate --schema=apps/backend/prisma/schema.prisma && npm run build --prefix apps/backend`
   - Start Command: `npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma && npm run db:seed --prefix apps/backend && npm run start --prefix apps/backend`
5. Connect `DATABASE_URL` from the PostgreSQL service.
6. Copy the public Railway domain generated for your web service and set it as `NEXT_PUBLIC_API_URL` on Vercel.

---

## ✅ Post-Publishing Health Checklist

| Check | Expected Result |
| :--- | :--- |
| **API Health** | `GET https://your-backend.onrender.com/api/v1/dashboard/overview` returns status `200` |
| **Swagger UI** | `https://your-backend.onrender.com/api/docs` opens API explorer |
| **Frontend App** | `https://your-app.vercel.app` loads dark-mode dashboard without errors |
| **Live Database** | Login with `admin@inzovate.com` and verify the 5 seeded projects in `/projects` |
| **QC Gate** | Open `/qc` and verify the 10-point checklist for project `INZ-2026-001` |
| **HTTPS SSL** | Both Vercel and Render automatically provide valid SSL/TLS certificates |
