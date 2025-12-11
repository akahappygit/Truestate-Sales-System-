import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Reset loading state when fetching new data
    setLoading(true);
    setError(null);

    // Fetch data with Search AND Pagination
    fetch(`http://127.0.0.1:5000/api/transactions?page=${page}&search=${search}`)
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setTransactions(data.data);
          setError(null);
        } else {
          setError("Failed to load data.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError("Error: Backend is not running! Make sure 'npm start' is running in the backend folder.");
        setLoading(false);
      });
  }, [page, search]);

  return (
    <div className="container">
      <header>
        <h1>TruEstate Dashboard</h1>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search by Customer..." 
            value={search}
            onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to page 1 when searching
            }}
          />
        </div>
      </header>

      {/* Show RED Error Box if Backend is down */}
      {error && (
        <div style={{color: 'red', padding: '15px', border: '2px solid red', marginBottom: '20px', borderRadius: '8px'}}>
            <strong>⚠️ {error}</strong>
        </div>
      )}

      {loading ? (
        <h2>Loading Data...</h2>
      ) : (
        !error && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Region</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t._id}>
                      <td>{t.TransactionID}</td>
                      <td>{new Date(t.Date).toLocaleDateString()}</td>
                      <td>{t.CustomerName}</td>
                      <td>{t.ProductName}</td>
                      <td>₹{t.TotalAmount}</td>
                      <td>{t.CustomerRegion}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{textAlign: "center"}}>No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      )}

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export default App;