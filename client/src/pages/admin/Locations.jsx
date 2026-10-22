import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import Alert from '../../components/Alert';

const EMPTY = { name: '', city: '', country: '', category: 'city', description: '', imageUrl: '', bestTimeToVisit: '' };
const CATEGORIES = ['city', 'beach', 'mountain', 'heritage', 'nature', 'other'];

export default function Locations() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = () => api.get('/locations').then(({ data }) => setItems(data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const reset = () => { setForm(EMPTY); setEditing(null); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) await api.put(`/locations/${editing}`, form);
      else await api.post('/locations', form);
      reset();
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const edit = (l) => {
    setEditing(l._id);
    setForm(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, l[k] ?? ''])));
  };

  const remove = async (l) => {
    if (!window.confirm(`Delete location "${l.name}"?`)) return;
    try {
      await api.delete(`/locations/${l._id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="two-col wide-left">
      <div className="card">
        <Alert>{error}</Alert>
        <table className="table">
          <thead><tr><th>Name</th><th>Country</th><th>Category</th><th /></tr></thead>
          <tbody>
            {items.map((l) => (
              <tr key={l._id}>
                <td><strong>{l.name}</strong><div className="muted small">{l.city}</div></td>
                <td>{l.country}</td>
                <td><span className="tag">{l.category}</span></td>
                <td className="right nowrap">
                  <button className="btn btn-sm btn-ghost" onClick={() => edit(l)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(l)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="card form sticky" onSubmit={submit}>
        <h3>{editing ? 'Edit location' : 'New location'}</h3>
        <label>Name<input required value={form.name} onChange={set('name')} placeholder="Kyoto" /></label>
        <div className="form-row">
          <label>City<input value={form.city} onChange={set('city')} /></label>
          <label>Country<input required value={form.country} onChange={set('country')} /></label>
        </div>
        <label>Category
          <select value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Best time to visit<input value={form.bestTimeToVisit} onChange={set('bestTimeToVisit')} placeholder="Mar – May" /></label>
        <label>Image URL<input type="url" value={form.imageUrl} onChange={set('imageUrl')} /></label>
        <label>Description<textarea rows={3} value={form.description} onChange={set('description')} /></label>
        <div className="row">
          <button className="btn">{editing ? 'Update' : 'Create'}</button>
          {editing && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}
