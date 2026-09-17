import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getError } from '../api/axios';
import Modal from '../components/Modal.jsx';

export default function CompanyDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pwOpen, setPwOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const load = () =>
    api.get(`/companies/${id}`).then(({ data }) => setData(data)).catch((e) => setError(getError(e)));

  useEffect(() => { load(); }, [id]);

  const resetPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/companies/${id}/admin-password`, { newPassword });
      setNotice(data.message);
      setPwOpen(false);
      setNewPassword('');
    } catch (err) {
      setError(getError(err));
    }
  };

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <p className="page-sub">Loading…</p>;

  const { company, users, shops, productionAreas, productCount } = data;

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <Link to="/companies" className="cell-sub">← Back to companies</Link>
          <h1 style={{ marginTop: 6 }}>{company.name}</h1>
          <p className="page-sub">
            {company.businessType || 'General'} · {company.phone || 'no phone'} · {company.address || 'no address'}
          </p>
        </div>
        <button className="btn ghost" onClick={() => setPwOpen(true)}>Reset admin password</button>
      </div>

      {notice && <div className="alert ok">{notice}</div>}

      <div className="stat-grid">
        <div className="stat accent"><div className="stat-value">{shops.length}</div><div className="stat-label">Shops</div></div>
        <div className="stat"><div className="stat-value">{productionAreas.length}</div><div className="stat-label">Production areas</div></div>
        <div className="stat"><div className="stat-value">{productCount}</div><div className="stat-label">Products</div></div>
        <div className="stat"><div className="stat-value">{users.length}</div><div className="stat-label">Users</div></div>
      </div>

      <div className="card">
        <div className="card-head"><h2>Users</h2></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="cell-strong">{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="badge neutral">{u.role}</span></td>
                  <td><span className={`badge ${u.isActive ? 'on' : 'off'}`}>{u.isActive ? 'Active' : 'Disabled'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><h2>Shops</h2></div>
        {shops.length === 0 ? (
          <div className="empty">This company has not opened any shops yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Shop</th><th>Code</th><th>Address</th><th>Status</th></tr></thead>
              <tbody>
                {shops.map((s) => (
                  <tr key={s._id}>
                    <td className="cell-strong">{s.name}</td>
                    <td>{s.code || '—'}</td>
                    <td className="cell-sub">{s.address || '—'}</td>
                    <td><span className={`badge ${s.isActive ? 'on' : 'off'}`}>{s.isActive ? 'Active' : 'Closed'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head"><h2>Production areas</h2></div>
        {productionAreas.length === 0 ? (
          <div className="empty">No production areas registered.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Area</th><th>Industry</th><th>Location</th><th>Daily capacity</th></tr></thead>
              <tbody>
                {productionAreas.map((a) => (
                  <tr key={a._id}>
                    <td className="cell-strong">{a.name}</td>
                    <td>{a.industryType}</td>
                    <td className="cell-sub">{a.location || '—'}</td>
                    <td>{a.capacityPerDay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pwOpen && (
        <Modal
          title="Reset admin password"
          onClose={() => setPwOpen(false)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setPwOpen(false)}>Cancel</button>
              <button className="btn" form="pw-form">Reset password</button>
            </>
          }
        >
          <form id="pw-form" onSubmit={resetPassword}>
            <div className="field">
              <label>New password</label>
              <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required />
            </div>
            <p className="cell-sub">The company admin will need this to sign in.</p>
          </form>
        </Modal>
      )}
    </div>
  );
}
