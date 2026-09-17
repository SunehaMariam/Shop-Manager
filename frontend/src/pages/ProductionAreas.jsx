import { useEffect, useState } from 'react';
import api, { getError } from '../api/axios';
import Modal from '../components/Modal.jsx';

const blank = { name: '', industryType: '', location: '', capacityPerDay: 0 };

export default function ProductionAreas() {
  const [areas, setAreas] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/production-areas');
      setAreas(data.productionAreas);
    } catch (e) {
      setError(getError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const startAdd = () => { setEditing(null); setForm(blank); setError(''); setOpen(true); };
  const startEdit = (a) => {
    setEditing(a);
    setForm({
      name: a.name, industryType: a.industryType || '', location: a.location || '',
      capacityPerDay: a.capacityPerDay || 0
    });
    setError('');
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/production-areas/${editing._id}`, form);
      else await api.post('/production-areas', form);
      setOpen(false);
      load();
    } catch (err) {
      setError(getError(err));
    }
  };

  const remove = async (a) => {
    if (!window.confirm(`Delete ${a.name}?`)) return;
    await api.delete(`/production-areas/${a._id}`);
    load();
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Production areas</h1>
          <p className="page-sub">Units and industries where your goods are made.</p>
        </div>
        <button className="btn" onClick={startAdd}>Add a production area</button>
      </div>

      {error && !open && <div className="alert error">{error}</div>}

      <div className="card">
        <div className="card-head"><h2>{areas.length} areas</h2></div>
        {loading ? (
          <div className="empty">Loading…</div>
        ) : areas.length === 0 ? (
          <div className="empty">
            <h3>Nothing registered yet</h3>
            <p>Add a production unit to link it with the products you make.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Area</th><th>Industry</th><th>Location</th><th>Daily capacity</th><th></th></tr></thead>
              <tbody>
                {areas.map((a) => (
                  <tr key={a._id}>
                    <td className="cell-strong">{a.name}</td>
                    <td>{a.industryType || '—'}</td>
                    <td className="cell-sub">{a.location || '—'}</td>
                    <td>{a.capacityPerDay}</td>
                    <td>
                      <div className="row" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn ghost sm" onClick={() => startEdit(a)}>Edit</button>
                        <button className="btn danger sm" onClick={() => remove(a)}>Delete</button>
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
          title={editing ? 'Edit production area' : 'Add a production area'}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn" form="area-form">{editing ? 'Save changes' : 'Add area'}</button>
            </>
          }
        >
          {error && <div className="alert error">{error}</div>}
          <form id="area-form" onSubmit={save}>
            <div className="field"><label>Area name</label><input value={form.name} onChange={set('name')} required /></div>
            <div className="grid-2">
              <div className="field">
                <label>Industry type</label>
                <input value={form.industryType} onChange={set('industryType')} placeholder="Textile, food, plastic…" />
              </div>
              <div className="field">
                <label>Daily capacity</label>
                <input type="number" min="0" value={form.capacityPerDay} onChange={set('capacityPerDay')} />
              </div>
            </div>
            <div className="field"><label>Location</label><input value={form.location} onChange={set('location')} /></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
