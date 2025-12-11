# TruEstate Sales System Architecture

## Backend Architecture
- Entry: `backend/index.js` initializes Express, applies security (`helmet`), logging (`morgan`), CORS, JSON parsing, and connects to MongoDB via Mongoose.
- Routing: `backend/src/routes/transactions.js` mounts `GET /` for paginated list and `GET /stats` for aggregates; server also exposes `GET /api/transactions/meta` for distinct filter values.
- Controllers: `backend/src/controllers/transactionController.js` builds dynamic MongoDB queries and aggregates statistics.
- Models: `backend/src/models/Transaction.js` defines the `transactions` collection schema used by controllers.

## Frontend Architecture
- React + Vite application with Tailwind styling.
- Primary view `frontend/src/App.jsx` renders:
  - Header with search input
  - Filters for region, gender, age range, category, tags, payment method, date range, and sort controls
  - Stats cards (total transactions, revenue, items, average order)
  - Paginated data table aligned to the Figma layout
- Data fetching uses `fetch` to call backend endpoints and composes query params based on UI state.

## Data Flow
1. User inputs search/filter/sort in the frontend.
2. Frontend builds query string and calls `GET /api/transactions`.
3. Backend parses params, constructs MongoDB query, sorts, paginates, and returns JSON `{ success, count, data }`.
4. Frontend renders rows and pagination UI using `count`.
5. Stats cards call `GET /api/transactions/stats` and filter controls populate from `GET /api/transactions/meta`.

## Folder Structure
- `backend/`
  - `index.js` (Express app entry)
  - `src/controllers/transactionController.js`
  - `src/models/Transaction.js`
  - `src/routes/transactions.js`
  - `src/utils/seedData.js`
- `frontend/`
  - `src/App.jsx`, `src/main.jsx`, `src/index.css`
  - `tailwind.config.js`, `vite.config.js`
- `docs/architecture.md`
- `README.md`

## Module Responsibilities
- Controller: translate UI query params into MongoDB queries and return responses.
- Model: define schema and indexes for efficient querying.
- Route: map HTTP endpoints to controller handlers.
- Seed script: import CSV into MongoDB for local development.
- Frontend App: manage UI state, build requests, render results, and handle pagination.


