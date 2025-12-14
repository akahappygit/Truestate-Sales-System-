TruEstate Sales System — Backend

Setup
- Prerequisites: Node.js 18+, npm, MongoDB running and accessible
- Install: `npm install`

Run
- `npm run start` → http://localhost:5000

Endpoints
- `GET /api/transactions` list with filters
  - query: `page`, `perPage`, `search`, `region`, `gender`, `category`, `paymentMethod`, `tags`, `ageMin`, `ageMax`, `dateFrom`, `dateTo`, `sortBy`, `sortDir`
- `GET /api/transactions/meta` dropdown values
- `GET /api/transactions/stats` aggregate totals

Filters
- Multi-select: Region, Gender, Category, Tags, Payment Method
- Age: exact (single value) or range (min and max)
- Transaction Date: from/to

Notes
- Handles dataset keys with spaces and camelCase
