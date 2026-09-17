import { useEffect, useState } from 'react';
import api, { getError } from '../api/axios';
import Modal from '../components/Modal.jsx';

const blank = { name: '', sku: '', price: 0, stock: 0, shop: '', productionArea: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [areas, setAreas] = useState([]);
  const [shopFilter, setShopFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (shopId = shopFilter) => {
    setLoading(true);
    try {
      const [p, s, a] = await Promise.all([
        api.get('/products', { params: shopId ? { shopId } : {} }),
        api.get('/shops'),
        api.get('/production-areas')
      ]);
      setProducts(p.data.products);
      setShops(s.data.shops);
      setAreas(a.data.productionAreas);
    } catch (e) {
      setError(getError(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const startAdd = () => { setEditing(null); setForm({ ...blank, shop: shops[0]?._id || '' }); setError(''); setOpen(true); };
  const startEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, sku: p.sku || '', price: p.price, stock: p.stock,
      shop: p.shop?._id || '', productionArea: p.productionArea?._id || ''
    });
    setError('');
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/products/${editing._id}`, form);
      else await api.post('/products', form);
      setOpen(false);
      load();
    } catch (err) {
      setError(getError(err));
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    await api.delete(`/products/${p._id}`);
    load();
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <p className="page-sub">What each shop sells, and where it was produced.</p>
        </div>
        <button className="btn" onClick={startAdd} disabled={shops.length === 0}>Add a product</button>
      </div>

      {error && !open && <div className="alert error">{error}</div>}
      {shops.length === 0 && !loading && (
        <div className="alert error">Open a shop first — every product belongs to a shop.</div>
      )}

      <div className="card">
        <div className="card-head">
          <h2>{products.length} products</h2>
          <select
            style={{ maxWidth: 240 }}
            value={shopFilter}
            onChange={(e) => { setShopFilter(e.target.value); load(e.target.value); }}
          >
            <option value="">All shops</option>
            {shops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="empty">Loading…</div>
        ) : products.length === 0 ? (
          <div className="empty">
            <h3>No products listed</h3>
            <p>Add a product to track its price and stock.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Product</th><th>Shop</th><th>Produced at</th><th>Price</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="cell-strong">{p.name}</div>
                      <div className="cell-sub">{p.sku || '—'}</div>
                    </td>
                    <td>{p.shop?.name || '—'}</td>
                    <td className="cell-sub">{p.productionArea?.name || '—'}</td>
                    <td>{p.price}</td>
                    <td>{p.stock}</td>
                    <td>
                      <div className="row" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn ghost sm" onClick={() => startEdit(p)}>Edit</button>
                        <button className="btn danger sm" onClick={() => remove(p)}>Delete</button>
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
          title={editing ? 'Edit product' : 'Add a product'}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn" form="product-form">{editing ? 'Save changes' : 'Add product'}</button>
            </>
          }
        >
          {error && <div className="alert error">{error}</div>}
          <form id="product-form" onSubmit={save}>
            <div className="field"><label>Product name</label><input value={form.name} onChange={set('name')} required /></div>
            <div className="grid-2">
              <div className="field"><label>SKU</label><input value={form.sku} onChange={set('sku')} /></div>
              <div className="field"><label>Price</label><input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} /></div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Shop</label>
                <select value={form.shop} onChange={set('shop')} required>
                  <option value="">Select a shop</option>
                  {shops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Stock</label><input type="number" min="0" value={form.stock} onChange={set('stock')} /></div>
            </div>
            <div className="field">
              <label>Production area</label>
              <select value={form.productionArea} onChange={set('productionArea')}>
                <option value="">Not linked</option>
                {areas.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
