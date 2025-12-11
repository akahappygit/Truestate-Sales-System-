# TruEstate Sales System

A comprehensive MERN stack application for managing and analyzing sales transactions with advanced filtering, statistics, and a modern dashboard interface.

## 🚀 Features

### Frontend
- **Modern Dashboard UI** with Tailwind CSS
- **Advanced Filtering System**:
  - Filter by Customer Region, Gender, Product Category, Payment Method
  - Age range filtering
  - Date range filtering
  - Search by Customer Name, Phone, or Product
  - Sort by multiple fields (Date, Customer Name, Amount, Quantity, Region)
- **Real-time Statistics**:
  - Total Transactions
  - Total Revenue
  - Total Items Sold
  - Average Order Value
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Color-coded Badges** for regions, genders, categories, and order status
- **Pagination** with page numbers

### Backend
- **RESTful API** built with Express.js
- **MongoDB Integration** with Mongoose
- **Advanced Query System**:
  - Pagination support
  - Multi-field search
  - Complex filtering
  - Sorting capabilities
- **Statistics Endpoint** for dashboard metrics
- **Meta Endpoint** for filter options (regions, genders, categories, etc.)
- **CSV Data Seeding** utility

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/akahappygit/Truestate-Sales-System-.git
cd TruEstate-Sales-System
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string_here
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Seed Database

To import the CSV data into MongoDB:

```bash
cd backend
node src/utils/seedData.js
```

This will:
- Connect to MongoDB
- Read `truestate_assignment_dataset.csv`
- Clear existing transactions
- Insert all records from the CSV

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

The backend will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (or the next available port)

## 📁 Project Structure

```
TruEstate-Sales-System/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions (seedData.js)
│   ├── index.js             # Entry point
│   ├── package.json
│   └── truestate_assignment_dataset.csv
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Transactions

- `GET /api/transactions` - Get all transactions with pagination and filters
  - Query Parameters:
    - `page` - Page number (default: 1)
    - `perPage` - Items per page (default: 10)
    - `search` - Search by Customer Name, Phone, or Product
    - `region` - Filter by Customer Region
    - `gender` - Filter by Gender
    - `category` - Filter by Product Category
    - `paymentMethod` - Filter by Payment Method
    - `ageMin` - Minimum age
    - `ageMax` - Maximum age
    - `dateFrom` - Start date (YYYY-MM-DD)
    - `dateTo` - End date (YYYY-MM-DD)
    - `sortBy` - Sort field (Date, CustomerName, TotalAmount, Quantity, CustomerRegion)
    - `sortDir` - Sort direction (asc, desc)

- `GET /api/transactions/stats` - Get statistics (revenue, items sold, etc.)

- `GET /api/transactions/meta` - Get filter options (regions, genders, categories, payment methods)

### Example Request

```bash
GET http://localhost:5000/api/transactions?page=1&perPage=10&region=North&gender=Female&sortBy=Date&sortDir=desc
```

## 📊 Data Model

### Transaction Schema

- TransactionID
- Date
- CustomerID
- CustomerName
- PhoneNumber
- Gender
- Age
- CustomerRegion
- CustomerType
- ProductID
- ProductName
- Brand
- ProductCategory
- Tags
- Quantity
- PricePerUnit
- DiscountPercentage
- TotalAmount
- FinalAmount
- PaymentMethod
- OrderStatus
- DeliveryType
- StoreID
- StoreLocation
- SalespersonID
- EmployeeName

## 🎨 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client (optional)

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **csv-parser** - CSV parsing
- **Helmet** - Security
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

## 🔒 Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

## 📝 Scripts

### Backend
- `npm start` - Start the server

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Troubleshooting

### Backend Issues

1. **MongoDB Connection Failed**
   - Check your `MONGO_URI` in `.env`
   - Ensure MongoDB Atlas allows your IP address
   - Verify username and password are correct

2. **Port Already in Use**
   - Change `PORT` in `.env` file
   - Or kill the process using port 5000

### Frontend Issues

1. **Cannot Connect to Backend**
   - Ensure backend is running on `http://localhost:5000`
   - Check CORS settings in backend

2. **Filters Not Showing**
   - Check if `/api/transactions/meta` endpoint is working
   - Verify backend is connected to MongoDB

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Ayush Kumar Anand (akahappygit)**

- GitHub: [@akahappygit](https://github.com/akahappygit)

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Tailwind CSS for beautiful UI components
- React team for the amazing framework

---

**Note**: The CSV file (`truestate_assignment_dataset.csv`) is excluded from git tracking due to its large size (223MB). Make sure to have it in the `backend` folder for seeding the database.

