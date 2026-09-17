import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getError } from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/company').then(({ data }) => setData(data)).catch((e) => setError(getError(e)));
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <p className="page-sub">Loading…</p>;

  const s = data.stats;

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>{user?.company?.name}</h1>
          <p className="page-sub">Your shops, production areas and stock at a glance.</p>
        </div>
        <Link to="/shops" className="btn">Open shops</Link>
      </div>

      <div className="stat-grid">
        <div className="stat accent"><div className="stat-value">{s.shops}</div><div className="stat-label">Shops</div></div>
        <div className="stat"><div className="stat-value">{s.activeShops}</div><div className="stat-label">Active shops</div></div>
        <div className="stat"><div className="stat-value">{s.productionAreas}</div><div className="stat-label">Production areas</div></div>
        <div className="stat"><div className="stat-value">{s.products}</div><div className="stat-label">Products</div></div>
        <div className="stat"><div className="stat-value">{s.totalStock}</div><div className="stat-label">Units in stock</div></div>
        <div className="stat"><div className="stat-value">{Math.round(s.stockValue).toLocaleString()}</div><div className="stat-label">Stock value</div></div>
      </div>

      <div className="card">
        <div className="card-head"><h2>Recently opened shops</h2></div>
        {data.recentShops.length === 0 ? (
          <div className="empty">
            <h3>No shops yet</h3>
            <p>Open your first shop to start adding products.</p>
            <Link to="/shops" className="btn" style={{ marginTop: 14, display: 'inline-block' }}>Open a shop</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Shop</th><th>Code</th><th>Opened</th></tr></thead>
              <tbody>
                {data.recentShops.map((s2) => (
                  <tr key={s2._id}>
                    <td className="cell-strong">{s2.name}</td>
                    <td>{s2.code || '—'}</td>
                    <td className="cell-sub">{new Date(s2.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
