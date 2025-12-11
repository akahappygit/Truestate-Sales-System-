import { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState({ regions: [], genders: [], categories: [], paymentMethods: [], tags: [] });
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    region: '',
    gender: '',
    ageMin: '',
    ageMax: '',
    category: '',
    tags: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'Date',
    sortDir: 'desc',
  });

  const perPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, [page, search, filters]);

  useEffect(() => {
    fetchStatistics();
    fetchMeta();
  }, []);

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set('page', page);
    params.set('perPage', perPage);
    if (search) params.set('search', search);
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) params.set(k, v);
    });
    return params.toString();
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/transactions?${buildQuery()}`);
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data || []);
        setTotalCount(data.count || 0);
      } else {
        setError('Failed to load transactions.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError("Error: Backend is not running! Make sure 'npm start' is running in the backend folder.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const fetchMeta = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/meta`);
      const json = await res.json();
      if (json.success) setMeta(json.data);
    } catch (err) {
      console.error('Meta fetch error:', err);
    }
  };

  const clearFilters = () => {
    setFilters({
      region: '',
      gender: '',
      ageMin: '',
      ageMax: '',
      category: '',
      tags: '',
      paymentMethod: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'Date',
      sortDir: 'desc',
    });
    setPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '' && v !== 'Date' && v !== 'desc').length;

  const totalPages = Math.ceil(totalCount / perPage);

  const getRegionColor = (region) => {
    const colors = {
      'North': 'bg-blue-100 text-blue-800',
      'South': 'bg-green-100 text-green-800',
      'East': 'bg-yellow-100 text-yellow-800',
      'West': 'bg-purple-100 text-purple-800',
      'Central': 'bg-pink-100 text-pink-800',
    };
    return colors[region] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      'UPI': '💳',
      'Credit Card': '💳',
      'Debit Card': '💳',
      'Wallet': '👛',
      'Cash': '💵',
      'Net Banking': '🏦',
    };
    return icons[method] || '💳';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TruEstate Sales Dashboard
              </h1>
              <p className="text-gray-500 mt-1">Comprehensive sales analytics and transaction management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Name, Phone or Product..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full md:w-96 px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-white text-blue-600 rounded-full px-2 py-0.5 text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Filter Options</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Region</label>
                  <select
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    value={filters.region}
                    onChange={(e) => { setFilters(f => ({ ...f, region: e.target.value })); setPage(1); }}
                  >
                    <option value="">All Regions</option>
                    {meta.regions?.map(r => (<option key={r} value={r}>{r}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    value={filters.gender}
                    onChange={(e) => { setFilters(f => ({ ...f, gender: e.target.value })); setPage(1); }}
                  >
                    <option value="">All Genders</option>
                    {meta.genders?.map(g => (<option key={g} value={g}>{g}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
                  <select
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    value={filters.category}
                    onChange={(e) => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }}
                  >
                    <option value="">All Categories</option>
                    {meta.categories?.map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                    value={filters.paymentMethod}
                    onChange={(e) => { setFilters(f => ({ ...f, paymentMethod: e.target.value })); setPage(1); }}
                  >
                    <option value="">All Payment Methods</option>
                    {meta.paymentMethods?.map(p => (<option key={p} value={p}>{p}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-1/2 px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={filters.ageMin}
                      onChange={(e) => { setFilters(f => ({ ...f, ageMin: e.target.value })); setPage(1); }}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-1/2 px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={filters.ageMax}
                      onChange={(e) => { setFilters(f => ({ ...f, ageMax: e.target.value })); setPage(1); }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={filters.dateFrom}
                    onChange={(e) => { setFilters(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={filters.dateTo}
                    onChange={(e) => { setFilters(f => ({ ...f, dateTo: e.target.value })); setPage(1); }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      value={filters.sortBy}
                      onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
                    >
                      <option value="Date">Date</option>
                      <option value="CustomerName">Customer Name</option>
                      <option value="TotalAmount">Amount</option>
                      <option value="Quantity">Quantity</option>
                      <option value="CustomerRegion">Region</option>
                    </select>
                    <select
                      className="px-3 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      value={filters.sortDir}
                      onChange={(e) => setFilters(f => ({ ...f, sortDir: e.target.value }))}
                    >
                      <option value="asc">↑ Asc</option>
                      <option value="desc">↓ Desc</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-md">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <strong>{error}</strong>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90 mb-1">Total Transactions</div>
                  <div className="text-3xl font-bold">{stats.totalTransactions?.toLocaleString('en-IN') || totalCount.toLocaleString('en-IN')}</div>
                </div>
                <div className="text-4xl opacity-20">📊</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90 mb-1">Total Revenue</div>
                  <div className="text-3xl font-bold">₹{stats.totalRevenue?.toLocaleString('en-IN') || '0'}</div>
                </div>
                <div className="text-4xl opacity-20">💰</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90 mb-1">Items Sold</div>
                  <div className="text-3xl font-bold">{stats.totalItems?.toLocaleString('en-IN') || '0'}</div>
                </div>
                <div className="text-4xl opacity-20">🛍️</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90 mb-1">Avg Order Value</div>
                  <div className="text-3xl font-bold">₹{Math.round(stats.avgOrderValue || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="text-4xl opacity-20">📈</div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        ) : !error && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Gender</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.length > 0 ? (
                    transactions.map((t) => (
                      <tr key={t._id} className="hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.TransactionID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(t.Date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{t.CustomerName}</div>
                          <div className="text-xs text-gray-500">{t.PhoneNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRegionColor(t.CustomerRegion)}`}>
                            {t.CustomerRegion}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            t.Gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {t.Gender}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{t.ProductName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                            {t.ProductCategory}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{t.Quantity || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          ₹{t.TotalAmount?.toLocaleString('en-IN') || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span>{getPaymentMethodIcon(t.PaymentMethod)}</span>
                            <span className="text-sm text-gray-700">{t.PaymentMethod}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            t.OrderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                            t.OrderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {t.OrderStatus || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="px-6 py-12 text-center text-gray-500">
                        <div className="text-4xl mb-2">🔍</div>
                        <div className="text-lg font-medium">No transactions found</div>
                        <div className="text-sm mt-1">Try adjusting your filters or search query</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!error && totalCount > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 rounded-xl shadow-md border border-gray-100 gap-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-semibold text-blue-600">{(page - 1) * perPage + 1}</span> to{' '}
              <span className="font-semibold text-blue-600">{Math.min(page * perPage, totalCount)}</span> of{' '}
              <span className="font-semibold text-blue-600">{totalCount.toLocaleString('en-IN')}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {[...Array(Math.min(totalPages, 10))].map((_, i) => {
                  const pageNum = i + 1;
                  if (totalPages > 10) {
                    if (page <= 5 && pageNum <= 7) return null;
                    if (page > 5 && page < totalPages - 4 && (pageNum < page - 2 || pageNum > page + 2)) return null;
                    if (page >= totalPages - 4 && pageNum <= totalPages - 7) return null;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 text-sm rounded-lg border-2 transition-colors ${
                        page === pageNum
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
