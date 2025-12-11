# Frontend (React + Vite)

Sales dashboard UI aligned with the provided Figma references.

## Features
- Search by name, phone, or product
- Filters: region, gender, age range, category, tags, payment method, date range
- Sorting on key fields (name, date, total amount, quantity, region)
- Stats cards (total transactions, revenue, items, average order value)
- Paginated table with numbered page chips

## Development
1. `npm install`
2. Ensure the backend is running at `http://localhost:5000`.
3. `npm run dev` and open the printed local URL.

## Configuration
- API base is set in `src/App.jsx` to `http://localhost:5000/api`.
- Tailwind configuration in `tailwind.config.js`.

## Production Build
- `npm run build`
- Optional: `npm run preview`
