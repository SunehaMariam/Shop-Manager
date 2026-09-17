import { useEffect, useState } from 'react';
import api, { getError } from '../api/axios';
import Modal from '../components/Modal.jsx';

const blank = { name: '', email: '', password: '', shop: '' };

export default function Team() {
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    try {
      const [u, s] = await Promise.all([api.get('/users'), api.get('/shops')]);
      setUsers(u.data.users);
      setShops(s.data.shops);
    } catch (e) {
      setError(getError(e));
    }
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/users', form);
      setNotice(`${data.user.name} can now sign in with ${data.user.email}`);
      setForm(blank);
      setOpen(false);
      load();
    } catch (err) {
      setError(getError(err));
    }
  };

  const toggle = async (u) => {
    try {
      await api.put(`/users/${u._id}/toggle`);
      load();
    } catch (err) {
      setError(getError(err));
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      load();
    } catch (err) {
      setError(getError(err));
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Team</h1>
          <p className="page-sub">Staff accounts that work inside this company only.</p>
        </div>
        <button className="btn" onClick={() => { setOpen(true); setError(''); }}>Add staff</button>
      </div>

      {notice && <div className="alert ok">{notice}</div>}
      {error && !open && <div className="alert error">{error}</div>}

      <div className="card">
        <div className="card-head"><h2>{users.length} people</h2></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Shop</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="cell-strong">{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="badge neutral">{u.role}</span></td>
                  <td className="cell-sub">{u.shop?.name || '—'}</td>
                  <td><span className={`badge ${u.isActive ? 'on' : 'off'}`}>{u.isActive ? 'Active' : 'Disabled'}</span></td>
                  <td>
                    {u.role !== 'admin' && (
                      <div className="row" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn ghost sm" onClick={() => toggle(u)}>{u.isActive ? 'Disable' : 'Enable'}</button>
                        <button className="btn danger sm" onClick={() => remove(u)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <Modal
          title="Add staff"
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn" form="staff-form">Create account</button>
            </>
          }
        >
          {error && <div className="alert error">{error}</div>}
          <form id="staff-form" onSubmit={save}>
            <div className="field"><label>Name</label><input value={form.name} onChange={set('name')} required /></div>
            <div className="grid-2">
              <div className="field"><label>Email</label><input type="email" value={form.email} onChange={set('email')} required /></div>
              <div className="field"><label>Password</label><input value={form.password} onChange={set('password')} minLength={6} required /></div>
            </div>
            <div className="field">
              <label>Assign to shop</label>
              <select value={form.shop} onChange={set('shop')}>
                <option value="">No specific shop</option>
                {shops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
