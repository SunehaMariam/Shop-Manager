import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getError } from '../api/axios';

export default function SuperDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/super').then(({ data }) => setData(data)).catch((e) => setError(getError(e)));
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <p className="page-sub">Loading…</p>;

  const s = data.stats;

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Platform overview</h1>
          <p className="page-sub">Everything running across all companies.</p>
        </div>
        <Link to="/companies" className="btn">Manage companies</Link>
      </div>

      <div className="stat-grid">
        <div className="stat accent"><div className="stat-value">{s.companies}</div><div className="stat-label">Companies</div></div>
        <div className="stat"><div className="stat-value">{s.activeCompanies}</div><div className="stat-label">Active companies</div></div>
        <div className="stat"><div className="stat-value">{s.admins}</div><div className="stat-label">Company admins</div></div>
        <div className="stat"><div className="stat-value">{s.shops}</div><div className="stat-label">Shops</div></div>
        <div className="stat"><div className="stat-value">{s.productionAreas}</div><div className="stat-label">Production areas</div></div>
        <div className="stat"><div className="stat-value">{s.products}</div><div className="stat-label">Products</div></div>
      </div>

      <div className="card">
        <div className="card-head"><h2>Recently added companies</h2></div>
        {data.recentCompanies.length === 0 ? (
          <div className="empty">
            <h3>No companies yet</h3>
            <p>Add the first company and its admin to get started.</p>
            <Link to="/companies" className="btn" style={{ marginTop: 14, display: 'inline-block' }}>Add a company</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Company</th><th>Status</th><th>Created</th><th></th></tr></thead>
              <tbody>
                {data.recentCompanies.map((c) => (
                  <tr key={c._id}>
                    <td className="cell-strong">{c.name}</td>
                    <td><span className={`badge ${c.isActive ? 'on' : 'off'}`}>{c.isActive ? 'Active' : 'Suspended'}</span></td>
                    <td className="cell-sub">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}><Link className="btn ghost sm" to={`/companies/${c._id}`}>Open</Link></td>
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
