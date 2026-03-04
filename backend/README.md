TruEstate Sales Dashboard

Overview
- Full‑stack sales dashboard with filtering, sorting, search, and pagination.
- Clean separation: backend API (Express + MongoDB), frontend UI (Vite + React).
- Supports multi‑select filters and exact/range age + date range.

Tech Stack
- Backend: Node.js, Express, MongoDB
- Frontend: React (Vite), CSS
- Deployment: Netlify or Vercel (frontend), Render/Railway (backend)

Search Implementation Summary
- Case‑insensitive search matches name and phone.
- Parameter: `search` on `GET /api/transactions`.

Filter Implementation Summary
- Multi‑select: `region`, `gender`, `category`, `paymentMethod`, `tags` (comma‑separated).
- Age: exact age with a single value, range with min+max.
- Date: from/to range using native date inputs.
- Dropdown options from `GET /api/transactions/meta`.

Sorting Implementation Summary
- Sort by `Date`, `Customer Name`, `Quantity`, `Total Amount`.
- Direction `asc` or `desc`. Default is `Date desc`.

Pagination Implementation Summary
- `page` and `perPage` parameters.
- UI shows up to 10 page chips with a sliding window.

Setup Instructions
- Clone repo and install:
  - `cd backend && npm install`
  - `cd frontend && npm install`
- Backend `.env` must include `MONGO_URI`.

If you get **querySrv ENOTFOUND** (MongoDB not reachable) on Windows:
- The app tries Google/Cloudflare DNS first. If it still fails, use Atlas **Direct connection**:
  1. In MongoDB Atlas: your cluster → **Connect** → **Drivers** → choose **Node.js**.
  2. Copy the **"Direct connection"** string (starts with `mongodb://`, not `mongodb+srv://`).
  3. In `backend/.env` set: `MONGO_URI_DIRECT=<paste that string>` (and keep or remove `MONGO_URI`).
  4. Restart the backend.

Run Locally
- Backend: `cd backend && npm run start` → `http://localhost:5000`
- Frontend: `cd frontend && npm run dev` → `http://localhost:5174`

Deploy — Frontend
- Netlify or Vercel
- Base/Root directory: `frontend`
- Build command: `npm run build`
- Publish/Output directory: `dist`
- Environment: `VITE_API_BASE=https://YOUR-BACKEND-URL`
- Netlify SPA: `frontend/public/_redirects` should contain `/* /index.html 200`.

Deploy — Backend
- Render or Railway
- Start command: `node index.js`
- Environment: `MONGO_URI`

Paths To Note
- Backend filters and meta: `backend/src/controllers/transactionController.js`
- Backend routes: `backend/src/routes/transactions.js`
- Frontend filters + table: `frontend/src/App.jsx`

Contact
- Email: work.ayushkumar

Credits
- CrediAtlas — project context

Dataset
- Link: (to be added)
