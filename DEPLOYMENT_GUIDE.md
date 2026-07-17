# 🚀 Deploying InsiderJobs (MERN + Vite + Clerk)

This guide provides step-by-step instructions to deploy your full-stack application. For the best performance and ease of use, we recommend a **Split Deployment**:
*   **Backend (Express API)**: Hosted on **Render** (Web Service).
*   **Frontend (Vite + React)**: Hosted on **Vercel** or **Netlify** (Static hosting, optimized for frontend).
*   **Database**: Hosted on **MongoDB Atlas** (already configured).

---

## 🛠️ Step 1: Prepare the Code for Production

Before pushing your code, make sure the frontend builds correctly and references the production backend URL.

### 1. Build Verification
Test your frontend build locally to ensure there are no compilation errors:
```bash
cd client
npm install
npm run build
```

### 2. `.gitignore` Check
Ensure that your `.env` files and `node_modules` are excluded from Git:
```git
# client/.gitignore & server/.gitignore
.env
.env.local
node_modules/
dist/
```

---

## 2️⃣ Step 2: Deploy the Backend to Render

[Render](https://render.com/) is a cloud platform that offers free hosting for Web Services.

### 1. Create a New Web Service
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository: `github.com/chetankhurana/job-portal-updated`.
4. Choose the repository and branch (usually `main`).

### 2. Configure the Service Settings
*   **Name**: `insider-jobs-backend`
*   **Language**: `Node`
*   **Region**: Select the region closest to your users.
*   **Branch**: `main`
*   **Build Command**: `cd server && npm install`
*   **Start Command**: `cd server && node server.js`
*   **Plan**: `Free`

### 3. Add Environment Variables
Scroll down to the **Environment Variables** section and add the values from your `server/.env` file:

| Key | Example Value / Source |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` *(Render sets this automatically, but good to define)* |
| `MONGODB_URI` | `mongodb+srv://...` *(Your Atlas connection string)* |
| `JWT_SECRET` | `your-secure-random-jwt-key` |
| `CLERK_PUBLISHABLE_KEY` | *(From your Clerk Dashboard)* |
| `CLERK_SECRET_KEY` | *(From your Clerk Dashboard)* |
| `CLERK_WEBHOOK_SECRET` | *(From your Clerk Webhooks page)* |
| `CLOUDINARY_NAME` | *(From your Cloudinary Dashboard)* |
| `CLOUDINARY_API_KEY` | *(From your Cloudinary Dashboard)* |
| `CLOUDINARY_SECRET_KEY` | *(From your Cloudinary Dashboard)* |
| `EMAIL_SERVICE` | `gmail` |
| `EMAIL_USER` | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | `xxxx xxxx xxxx xxxx` *(Gmail 16-character App Password)* |
| `EMAIL_FROM` | `InsiderJobs <your-email@gmail.com>` |
| `FRONTEND_URL` | `https://your-frontend-domain.vercel.app` *(Get this after Step 3)* |

4. Click **Deploy Web Service**.
5. Once deployed, Render will provide you with a URL (e.g., `https://insider-jobs-backend.onrender.com`). **Save this URL; you'll need it in the next step.**

---

## 3️⃣ Step 3: Deploy the Frontend to Vercel

[Vercel](https://vercel.com/) is the optimal host for Vite/React applications.

### 1. Import Repository
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** → **Project**.
3. Import your GitHub repository: `job-portal-updated`.

### 2. Configure Project Settings
*   **Framework Preset**: `Vite`
*   **Root Directory**: Click *Edit* and select **`client`**.
*   **Build & Development Settings**: Keep defaults (Build Command: `vite build`, Output Directory: `dist`).

### 3. Set Environment Variables
Add your client-side environment variables:

| Key | Value |
| :--- | :--- |
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_...` *(Must match the key on the backend)* |
| `VITE_BACKEND_URL` | `https://insider-jobs-backend.onrender.com` *(The URL you got from Render)* |

### 4. Deploy
1. Click **Deploy**.
2. Once complete, copy your newly created frontend deployment URL (e.g., `https://job-portal-updated.vercel.app`).
3. **Crucial:** Go back to Render, open your Web Service's environment variables, and update `FRONTEND_URL` to match this frontend URL. Redeploy the backend to apply changes.

---

## 4️⃣ Step 4: Configure Clerk for Production

Since the application uses Clerk for candidate sign-ins, you must ensure redirect links and webhooks are updated.

### 1. Clerk Webhooks
If you use Clerk webhooks (via `svix`) to sync users to MongoDB:
1. Go to **Clerk Dashboard** → **Webhooks**.
2. Update the webhook endpoint URL to: `https://insider-jobs-backend.onrender.com/webhooks`.
3. Make sure the secret matches your `CLERK_WEBHOOK_SECRET` environment variable in the backend.

### 2. Redirect URLs
1. In Clerk Dashboard under **Configure** → **Paths**:
   *   Verify sign-in, sign-up, and profile paths match your React router paths.
2. In production, Clerk will run on your production domain instead of `localhost`.

---

## 💡 Troubleshooting & Tips

### 😴 Render Free Tier Spin-up Delay
On Render's Free tier, services spin down after 15 minutes of inactivity. When a request is sent after spin-down, it can take 30-50 seconds to boot.
*   **Tip**: In `AppContext.jsx`, we display cached/seeded offline jobs if the backend is slow or loading, providing a seamless fallback.
*   **Solution**: Upgrade Render's Web Service to the Starter tier ($7/month) to keep it warm 24/7.

### 🔒 CORS Configuration
If you experience CORS errors, ensure `FRONTEND_URL` in the backend matches the exact origin (including `https://` and without trailing slash) of your Vercel frontend.
