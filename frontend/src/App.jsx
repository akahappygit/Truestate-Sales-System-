import { useState, useEffect, useMemo } from 'react';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [sortBy, setSortBy] = useState('CustomerName');
  const [sortDir, setSortDir] = useState('asc');

  const [region, setRegion] = useState([]);
  const [gender, setGender] = useState([]);
  const [category, setCategory] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [tags, setTags] = useState([]);
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [meta, setMeta] = useState({ regions: [], genders: [], categories: [], paymentMethods: [], tags: [] });

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/transactions/meta')
      .then(r => r.json())
      .then(j => { if (j.success) setMeta(j.data); });
  }, []);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    p.set('page', String(page));
    p.set('perPage', String(perPage));
    if (search) p.set('search', search);
    if (region.length) p.set('region', region.join(','));
    if (gender.length) p.set('gender', gender.join(','));
    if (category.length) p.set('category', category.join(','));
    if (paymentMethod.length) p.set('paymentMethod', paymentMethod.join(','));
    if (tags.length) p.set('tags', tags.join(','));
    if (ageMin) p.set('ageMin', String(ageMin));
    if (ageMax) p.set('ageMax', String(ageMax));
    if (dateFrom) p.set('dateFrom', dateFrom);
    if (dateTo) p.set('dateTo', dateTo);
    p.set('sortBy', sortBy);
    p.set('sortDir', sortDir);
    return p.toString();
  }, [page, perPage, search, region, gender, category, paymentMethod, tags, ageMin, ageMax, dateFrom, dateTo, sortBy, sortDir]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://127.0.0.1:5000/api/transactions?${query}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTransactions(data.data || []);
          setCount(data.count || 0);
        } else {
          setError('Failed to load data.');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Backend not reachable');
        setLoading(false);
      });
  }, [query]);

  const setMulti = (setter) => (e) => setter(Array.from(e.target.selectedOptions).map(o => o.value));
  const v = (obj, keys) => keys.find(k => obj[k] !== undefined) ? obj[keys.find(k => obj[k] !== undefined)] : '';

  const totalPages = Math.max(1, Math.ceil(count / perPage));

  return (
    <div className="container">
      <header className="topbar">
        <div className="title">Sales Management System</div>
        <input className="search" type="text" placeholder="Name, Phone no." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </header>

      {error && <div className="error-box">{error}</div>}

      <div className="filters">
        <select multiple value={region} onChange={setMulti(setRegion)}>
          <option disabled>Customer Region</option>
          {meta.regions.map(r => (<option key={r} value={r}>{r}</option>))}
        </select>
        <select multiple value={gender} onChange={setMulti(setGender)}>
          <option disabled>Gender</option>
          {meta.genders.map(g => (<option key={g} value={g}>{g}</option>))}
        </select>
        <div className="range">
          <input type="number" placeholder="Age min" value={ageMin} onChange={(e)=>setAgeMin(e.target.value)} />
          <input type="number" placeholder="Age max" value={ageMax} onChange={(e)=>setAgeMax(e.target.value)} />
        </div>
        <select multiple value={category} onChange={setMulti(setCategory)}>
          <option disabled>Product Category</option>
          {meta.categories.map(c => (<option key={c} value={c}>{c}</option>))}
        </select>
        <select multiple value={tags} onChange={setMulti(setTags)}>
          <option disabled>Tags</option>
          {meta.tags.map(t => (<option key={t} value={t}>{t}</option>))}
        </select>
        <select multiple value={paymentMethod} onChange={setMulti(setPaymentMethod)}>
          <option disabled>Payment Method</option>
          {meta.paymentMethods.map(p => (<option key={p} value={p}>{p}</option>))}
        </select>
        <div className="range">
          <input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
          <input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
        </div>
        <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)}>
          <option value="CustomerName">Sort by: Customer Name (A–Z)</option>
          <option value="Date">Sort by: Date</option>
          <option value="Quantity">Sort by: Quantity</option>
          <option value="TotalAmount">Sort by: Total Amount</option>
        </select>
        <select value={sortDir} onChange={(e)=>setSortDir(e.target.value)}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading…</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Customer ID</th>
                <th>Customer name</th>
                <th>Phone Number</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Product Category</th>
                <th>Quantity</th>
                <th>Total Amount</th>
                <th>Customer region</th>
                <th>Product ID</th>
                <th>Employee name</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length ? transactions.map((t) => (
                <tr key={t._id || v(t,['Transaction ID'])}>
                  <td>{v(t,['Transaction ID','TransactionID'])}</td>
                  <td>{v(t,['Date']) ? new Date(v(t,['Date'])).toISOString().slice(0,10) : ''}</td>
                  <td>{v(t,['Customer ID','CustomerID'])}</td>
                  <td>{v(t,['Customer Name','CustomerName'])}</td>
                  <td>{v(t,['Phone Number','PhoneNumber'])}</td>
                  <td>{v(t,['Gender'])}</td>
                  <td>{v(t,['Age'])}</td>
                  <td>{v(t,['Product Category','ProductCategory'])}</td>
                  <td>{v(t,['Quantity'])}</td>
                  <td>{v(t,['Total Amount','TotalAmount'])}</td>
                  <td>{v(t,['Customer Region','CustomerRegion'])}</td>
                  <td>{v(t,['Product ID','ProductID'])}</td>
                  <td>{v(t,['Employee Name','EmployeeName'])}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="13" className="empty">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button className="btn" disabled={page===1} onClick={()=>setPage(page-1)}>Prev</button>
        <div className="pages">
          {Array.from({length: totalPages}).map((_,i)=> (
            <button key={i} className={i+1===page? 'page active':'page'} onClick={()=>setPage(i+1)}>{i+1}</button>
          ))}
        </div>
        <button className="btn" disabled={page===totalPages} onClick={()=>setPage(page+1)}>Next</button>
      </div>
    </div>
  );
}

export default App;
