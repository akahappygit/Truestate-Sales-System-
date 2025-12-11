# TruEstate Sales System

A single-repository full‑stack implementation of a Sales Management System. The backend exposes transaction search, filtering, sorting, pagination, and statistics over a MongoDB dataset. The frontend renders a Figma‑inspired dashboard with filter chips, metrics cards, a paginated table, and client‑side query composition.

## Tech Stack
- Backend: Node.js, Express, Mongoose, Helmet, CORS, Morgan
- Database: MongoDB Atlas
- Frontend: React + Vite, Tailwind CSS

## Search Implementation Summary
- Server supports text search across `CustomerName`, `PhoneNumber`, and `ProductName` via a regex `$or` query constructed from `search`.
- Reference: `backend/src/controllers/transactionController.js:25`.

## Filter Implementation Summary
- Supported filters mapped to MongoDB query fields:
  - `region` → `CustomerRegion`
  - `gender` → `Gender`
  - `ageMin`/`ageMax` → range on `Age`
  - `category` → `ProductCategory`
  - `tags` (comma‑separated) → `{ $in: Tags }`
  - `paymentMethod` → `PaymentMethod`
  - `dateFrom`/`dateTo` → range on `Date`
- Reference: query building in `backend/src/controllers/transactionController.js:33` and `backend/src/controllers/transactionController.js:44` and `backend/src/controllers/transactionController.js:51`.

## Sorting Implementation Summary
- Sorts by one of: `Date`, `CustomerName`, `ProductName`, `TotalAmount`, `Quantity`, `CustomerRegion` with `sortDir` of `asc` or `desc`.
- Reference: `backend/src/controllers/transactionController.js:57`.

## Pagination Implementation Summary
- Accepts `page` and `perPage` query params.
- Applies `.skip((page-1)*perPage).limit(perPage)` on the MongoDB cursor and returns `count` for total items.
- Reference: `backend/src/controllers/transactionController.js:64` and `backend/src/controllers/transactionController.js:67`.

## Setup Instructions
1. Prerequisites: Node.js 18+, MongoDB Atlas project or URI.
2. Environment: Create `backend/.env` with `MONGO_URI=<your_mongo_uri>`.
3. Install dependencies:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
4. Import dataset locally (optional, large files are git‑ignored):
   - Place `truestate_assignment_dataset.csv` at repo root (ignored by Git).
   - Run `node backend/src/utils/seedData.js` to populate `transactions`.
5. Start backend: `cd backend && npm run start` (listens on `http://localhost:5000`).
   - Endpoints: `GET /api/transactions`, `GET /api/transactions/stats`, `GET /api/transactions/meta`.
6. Start frontend: `cd frontend && npm run dev` and open the printed `http://localhost:<port>/`.

## Project Structure
- `backend/` controllers, models, routes, utils; entry at `backend/index.js`.
- `frontend/` React application; entry at `frontend/src/main.jsx` and `frontend/src/App.jsx`.
- `docs/architecture.md` with backend/front‑end architecture, data flow, folder structure, and module responsibilities.

