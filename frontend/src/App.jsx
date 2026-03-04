import { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';

function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const toggle = (value) => {
    const next = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(next);
  };
  return (
    <div className="ms">
      <button type="button" className="ms-trigger" onClick={() => setOpen(o => !o)}>
        {label}{selected.length ? ` (${selected.length})` : ''}
      </button>
      {open && (
        <div className="ms-menu">
          <div className="ms-list">
            {options.map(opt => (
              <label key={opt} className="ms-item">
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
          <div className="ms-actions">
            <button type="button" className="btn" onClick={() => setOpen(false)}>Done</button>
            <button type="button" className="btn ghost" onClick={() => onChange([])}>Clear</button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [transactions, setTransactions] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [sortBy, setSortBy] = useState('Date');
  const [sortDir, setSortDir] = useState('desc');

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
  const [reconnectTrigger, setReconnectTrigger] = useState(0);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000';

  const fetchWithRetry = (url, opts = {}, retries = 3, delay = 2000) => {
    return fetch(url, opts)
      .then(res => res.ok ? res : Promise.reject(new Error(res.statusText)))
      .catch(err => {
        if (retries <= 0) return Promise.reject(err);
        return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
          fetchWithRetry(url, opts, retries - 1, delay)
        );
      });
  };

  useEffect(() => {
    fetchWithRetry(`${API_BASE}/api/transactions/meta`)
      .then(r => r.json())
      .then(j => { if (j.success) setMeta(j.data); })
      .catch(() => {});
  }, [API_BASE]);

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
    if (ageMin && !ageMax) { p.set('ageMin', String(ageMin)); p.set('ageMax', String(ageMin)); }
    else if (ageMax && !ageMin) { p.set('ageMin', String(ageMax)); p.set('ageMax', String(ageMax)); }
    else {
      if (ageMin) p.set('ageMin', String(ageMin));
      if (ageMax) p.set('ageMax', String(ageMax));
    }
    if (dateFrom) p.set('dateFrom', dateFrom);
    if (dateTo) p.set('dateTo', dateTo);
    p.set('sortBy', sortBy);
    p.set('sortDir', sortDir);
    return p.toString();
  }, [page, perPage, search, region, gender, category, paymentMethod, tags, ageMin, ageMax, dateFrom, dateTo, sortBy, sortDir]);

  const reconnectRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchWithRetry(`${API_BASE}/api/transactions?${query}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data.success) {
          const rows = data.data || [];
          setTransactions(rows);
          setCount(data.count || rows.length || 0);
        } else {
          setError('Failed to load data.');
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError('Backend not reachable. Retrying…');
        setLoading(false);
        if (reconnectRef.current) clearInterval(reconnectRef.current);
        reconnectRef.current = setInterval(() => {
          fetch(`${API_BASE}/health`)
            .then(r => r.json())
            .then(h => {
              if (h.ok && h.backend === 'reachable') {
                if (reconnectRef.current) clearInterval(reconnectRef.current);
                reconnectRef.current = null;
                setError(null);
                setReconnectTrigger(t => t + 1);
              }
            })
            .catch(() => {});
        }, 4000);
      });
    return () => {
      cancelled = true;
      if (reconnectRef.current) clearInterval(reconnectRef.current);
    };
  }, [query, API_BASE, reconnectTrigger]);

  const setMulti = (setter) => (e) => setter(Array.from(e.target.selectedOptions).map(o => o.value));
  const v = (obj, keys) => keys.find(k => obj[k] !== undefined) ? obj[keys.find(k => obj[k] !== undefined)] : '';

  const today = useMemo(() => new Date(), []);
  const setDatePreset = (preset) => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    let from = '';
    let to = todayStr;
    if (preset === 'last7') {
      const past = new Date(today);
      past.setDate(past.getDate() - 6);
      from = past.toISOString().slice(0, 10);
    } else if (preset === 'last30') {
      const past = new Date(today);
      past.setDate(past.getDate() - 29);
      from = past.toISOString().slice(0, 10);
    } else if (preset === 'thisMonth') {
      from = `${y}-${m}-01`;
    } else if (preset === 'thisYear') {
      from = `${y}-01-01`;
    } else if (preset === 'all') {
      from = '';
      to = '';
    }
    setDateFrom(from);
    setDateTo(preset === 'all' ? '' : to);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(count / perPage));
  const pageWindow = useMemo(() => {
    const max = 10;
    const start = Math.max(1, Math.min(page - Math.floor(max/2), Math.max(1, totalPages - (max - 1))));
    const end = Math.min(totalPages, start + (max - 1));
    return { start, end };
  }, [page, totalPages]);

  return (
    <div className="container">
      <header className="topbar">
        <div className="title">Sales Management System</div>
        <input className="search" type="text" placeholder="Name, Phone no." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </header>

      {error && <div className="error-box">{error}</div>}

      <div className="filters">
        <MultiSelect label="Customer Region" options={meta.regions} selected={region} onChange={setRegion} />
        <MultiSelect label="Gender" options={meta.genders} selected={gender} onChange={setGender} />
        <div className="range">
          <input type="number" placeholder="Age min" value={ageMin} onChange={(e)=>setAgeMin(e.target.value)} />
          <input type="number" placeholder="Age max" value={ageMax} onChange={(e)=>setAgeMax(e.target.value)} />
        </div>
        <MultiSelect label="Product Category" options={meta.categories} selected={category} onChange={setCategory} />
        <MultiSelect label="Tags" options={meta.tags} selected={tags} onChange={setTags} />
        <MultiSelect label="Payment Method" options={meta.paymentMethods} selected={paymentMethod} onChange={setPaymentMethod} />
        <div className="date-range-block">
          <span className="date-range-label">Date range</span>
          <div className="date-range-inputs">
            <label className="date-input-wrap">
              <span className="date-input-label">From</span>
              <input type="date" value={dateFrom} onChange={(e)=>{ setDateFrom(e.target.value); setPage(1); }} aria-label="Date from" />
            </label>
            <label className="date-input-wrap">
              <span className="date-input-label">To</span>
              <input type="date" value={dateTo} onChange={(e)=>{ setDateTo(e.target.value); setPage(1); }} aria-label="Date to" />
            </label>
          </div>
          <div className="date-presets">
            <button type="button" className="preset-btn" onClick={()=>setDatePreset('last7')}>Last 7 days</button>
            <button type="button" className="preset-btn" onClick={()=>setDatePreset('last30')}>Last 30 days</button>
            <button type="button" className="preset-btn" onClick={()=>setDatePreset('thisMonth')}>This month</button>
            <button type="button" className="preset-btn" onClick={()=>setDatePreset('thisYear')}>This year</button>
            <button type="button" className="preset-btn" onClick={()=>setDatePreset('all')}>All time</button>
          </div>
        </div>
        <div className="sort-block">
          <span className="sort-label">Sort by</span>
          <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} aria-label="Sort by">
            <option value="Date">Date</option>
            <option value="CustomerName">Customer name</option>
            <option value="Quantity">Quantity</option>
            <option value="TotalAmount">Total amount</option>
          </select>
          <select value={sortDir} onChange={(e)=>setSortDir(e.target.value)} aria-label="Order">
            {sortBy === 'Date' && (
              <>
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </>
            )}
            {sortBy === 'CustomerName' && (
              <>
                <option value="asc">A → Z</option>
                <option value="desc">Z → A</option>
              </>
            )}
            {(sortBy === 'Quantity' || sortBy === 'TotalAmount') && (
              <>
                <option value="desc">High → Low</option>
                <option value="asc">Low → High</option>
              </>
            )}
          </select>
        </div>
        <button className="btn clear-btn" type="button" onClick={()=>{ setRegion([]); setGender([]); setCategory([]); setTags([]); setPaymentMethod([]); setAgeMin(''); setAgeMax(''); setDateFrom(''); setDateTo(''); setPage(1); }}>Clear filters</button>
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
          {Array.from({length: pageWindow.end - pageWindow.start + 1}).map((_,i)=> {
            const p = pageWindow.start + i;
            return (
              <button key={p} className={p===page? 'page active':'page'} onClick={()=>setPage(p)}>{p}</button>
            );
          })}
        </div>
        <button className="btn" disabled={page===totalPages} onClick={()=>setPage(page+1)}>Next</button>
      </div>
    </div>
  );
}

export default App;
