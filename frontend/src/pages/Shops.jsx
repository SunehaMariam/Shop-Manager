import { useEffect, useState } from 'react';
import api, { getError } from '../api/axios';
import Modal from '../components/Modal.jsx';

const blank = { name: '', code: '', phone: '', address: '' };

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/shops');
      setShops(data.shops);
    } catch (e) {
      setError(getError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const startAdd = () => { setEditing(null); setForm(blank); setError(''); setOpen(true); };
  const startEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, code: s.code || '', phone: s.phone || '', address: s.address || '' });
    setError('');
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) await api.put(`/shops/${editing._id}`, form);
      else await api.post('/shops', form);
      setOpen(false);
      load();
    } catch (err) {
      setError(getError(err));
    }
  };

  const toggle = async (s) => {
    await api.put(`/shops/${s._id}`, { ...s, isActive: !s.isActive });
    load();
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete ${s.name} and its products?`)) return;
    await api.delete(`/shops/${s._id}`);
    load();
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Shops</h1>
          <p className="page-sub">Every outlet where you sell.</p>
        </div>
        <button className="btn" onClick={startAdd}>Open a shop</button>
      </div>

      {error && !open && <div className="alert error">{error}</div>}

      <div className="card">
        <div className="card-head"><h2>{shops.length} shops</h2></div>
        {loading ? (
          <div className="empty">Loading…</div>
        ) : shops.length === 0 ? (
          <div className="empty">
            <h3>No shops yet</h3>
            <p>Open your first shop and start listing products.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Shop</th><th>Code</th><th>Contact</th><th>Products</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {shops.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="cell-strong">{s.name}</div>
                      <div className="cell-sub">{s.address || '—'}</div>
                    </td>
                    <td>{s.code || '—'}</td>
                    <td className="cell-sub">{s.phone || '—'}</td>
                    <td>{s.productCount}</td>
                    <td><span className={`badge ${s.isActive ? 'on' : 'off'}`}>{s.isActive ? 'Active' : 'Closed'}</span></td>
                    <td>
                      <div className="row" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn ghost sm" onClick={() => startEdit(s)}>Edit</button>
                        <button className="btn ghost sm" onClick={() => toggle(s)}>{s.isActive ? 'Close' : 'Reopen'}</button>
                        <button className="btn danger sm" onClick={() => remove(s)}>Delete</button>
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
          title={editing ? 'Edit shop' : 'Open a shop'}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn" form="shop-form">{editing ? 'Save changes' : 'Open shop'}</button>
            </>
          }
        >
          {error && <div className="alert error">{error}</div>}
          <form id="shop-form" onSubmit={save}>
            <div className="field"><label>Shop name</label><input value={form.name} onChange={set('name')} required /></div>
            <div className="grid-2">
              <div className="field"><label>Code</label><input value={form.code} onChange={set('code')} placeholder="SHOP-01" /></div>
              <div className="field"><label>Phone</label><input value={form.phone} onChange={set('phone')} /></div>
            </div>
            <div className="field"><label>Address</label><input value={form.address} onChange={set('address')} /></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
