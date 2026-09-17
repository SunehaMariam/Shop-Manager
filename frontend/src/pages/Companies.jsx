import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getError } from '../api/axios';
import Modal from '../components/Modal.jsx';

const blank = {
  name: '', businessType: '', phone: '', address: '',
  adminName: '', adminEmail: '', adminPassword: ''
};

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async (q = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/companies', { params: { search: q } });
      setCompanies(data.companies);
    } catch (e) {
      setError(getError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/companies', form);
      setNotice(`${data.company.name} created. Its admin signs in with ${data.admin.email}`);
      setForm(blank);
      setOpen(false);
      load(search);
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (c) => {
    await api.put(`/companies/${c._id}`, { ...c, isActive: !c.isActive });
    load(search);
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete ${c.name} with all of its shops, areas and users?`)) return;
    await api.delete(`/companies/${c._id}`);
    setNotice(`${c.name} deleted`);
    load(search);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Companies</h1>
          <p className="page-sub">Each company gets its own admin and its own separate data.</p>
        </div>
        <button className="btn" onClick={() => { setOpen(true); setError(''); }}>Add a company</button>
      </div>

      {notice && <div className="alert ok">{notice}</div>}
      {error && !open && <div className="alert error">{error}</div>}

      <div className="card">
        <div className="card-head">
          <h2>{companies.length} on the platform</h2>
          <form
            className="row"
            onSubmit={(e) => { e.preventDefault(); load(search); }}
            style={{ maxWidth: 320, width: '100%' }}
          >
            <input placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn ghost sm">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="empty">Loading…</div>
        ) : companies.length === 0 ? (
          <div className="empty">
            <h3>No companies yet</h3>
            <p>Add a company and set up its admin in one step.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Company</th><th>Admin</th><th>Shops</th><th>Production areas</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="cell-strong">{c.name}</div>
                      <div className="cell-sub">{c.businessType || 'General'}</div>
                    </td>
                    <td>
                      {c.admin ? (
                        <>
                          <div>{c.admin.name}</div>
                          <div className="cell-sub">{c.admin.email}</div>
                        </>
                      ) : (
                        <span className="badge neutral">No admin</span>
                      )}
                    </td>
                    <td>{c.counts.shops}</td>
                    <td>{c.counts.areas}</td>
                    <td><span className={`badge ${c.isActive ? 'on' : 'off'}`}>{c.isActive ? 'Active' : 'Suspended'}</span></td>
                    <td>
                      <div className="row" style={{ justifyContent: 'flex-end' }}>
                        <Link className="btn ghost sm" to={`/companies/${c._id}`}>Open</Link>
                        <button className="btn ghost sm" onClick={() => toggleActive(c)}>
                          {c.isActive ? 'Suspend' : 'Activate'}
                        </button>
                        <button className="btn danger sm" onClick={() => remove(c)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <Modal
          title="Add a company"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn" form="company-form" disabled={busy}>
                {busy ? 'Creating…' : 'Create company'}
              </button>
            </>
          }
        >
          {error && <div className="alert error">{error}</div>}
          <form id="company-form" onSubmit={create}>
            <div className="field">
              <label>Company name</label>
              <input value={form.name} onChange={set('name')} required />
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Business type</label>
                <input value={form.businessType} onChange={set('businessType')} placeholder="Textile, food, retail…" />
              </div>
              <div className="field">
                <label>Phone</label>
                <input value={form.phone} onChange={set('phone')} />
              </div>
            </div>
            <div className="field">
              <label>Address</label>
              <input value={form.address} onChange={set('address')} />
            </div>

            <h3 style={{ margin: '18px 0 10px' }}>Admin for this company</h3>
            <div className="field">
              <label>Admin name</label>
              <input value={form.adminName} onChange={set('adminName')} required />
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Admin email</label>
                <input type="email" value={form.adminEmail} onChange={set('adminEmail')} required />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="text" value={form.adminPassword} onChange={set('adminPassword')} minLength={6} required />
              </div>
            </div>
            <p className="cell-sub">Share these sign-in details with the company admin.</p>
          </form>
        </Modal>
      )}
    </div>
  );
}
