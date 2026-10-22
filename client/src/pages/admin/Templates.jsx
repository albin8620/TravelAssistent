import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import Alert from '../../components/Alert';

const EMPTY = { title: '', summary: '', location: '', durationDays: 3, tags: '', isPublished: true, days: [] };

// Admins write activities one per line: "09:00 | Title | Place | category"
const activitiesToText = (acts) =>
  acts.map((a) => [a.time, a.title, a.place, a.category].map((v) => v || '').join(' | ')).join('\n');

const textToActivities = (text) =>
  text
    .split('\n')
    .map((line) => line.split('|').map((s) => s.trim()))
    .filter(([, title]) => title)
    .map(([time, title, place, category]) => ({ time, title, place, category: category || 'sightseeing' }));

export default function Templates() {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [dayTexts, setDayTexts] = useState([]); // [{ title, text }]
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const load = () => api.get('/templates', { params: { all: true } }).then(({ data }) => setItems(data)).catch((e) => setError(errMsg(e)));
  useEffect(() => {
    load();
    api.get('/locations').then(({ data }) => setLocations(data));
  }, []);

  // Keep one day editor per day of the template's duration.
  const duration = Math.max(1, Math.min(60, Number(form.durationDays) || 1));
  const days = Array.from({ length: duration }, (_, i) => dayTexts[i] || { title: '', text: '' });
  const setDay = (i, k, v) => {
    const next = [...days];
    next[i] = { ...next[i], [k]: v };
    setDayTexts(next);
  };

  const reset = () => { setForm(EMPTY); setDayTexts([]); setEditing(null); };

  const edit = (t) => {
    setEditing(t._id);
    setForm({ ...t, location: t.location?._id || '', tags: t.tags.join(', ') });
    const sorted = [...t.days].sort((a, b) => a.dayNumber - b.dayNumber);
    setDayTexts(Array.from({ length: t.durationDays }, (_, i) => {
      const d = sorted.find((x) => x.dayNumber === i + 1);
      return { title: d?.title || '', text: d ? activitiesToText(d.activities) : '' };
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      title: form.title,
      summary: form.summary,
      location: form.location,
      durationDays: duration,
      isPublished: form.isPublished,
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      days: days.map((d, i) => ({ dayNumber: i + 1, title: d.title, activities: textToActivities(d.text) })),
    };
    try {
      if (editing) await api.put(`/templates/${editing}`, payload);
      else await api.post('/templates', payload);
      reset();
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete template "${t.title}"?`)) return;
    try {
      await api.delete(`/templates/${t._id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const togglePublish = async (t) => {
    await api.put(`/templates/${t._id}`, { isPublished: !t.isPublished }).catch((e) => setError(errMsg(e)));
    load();
  };

  return (
    <>
      <form className="card form" onSubmit={submit}>
        <h3>{editing ? 'Edit template' : 'New destination template'}</h3>
        <Alert>{error}</Alert>
        {locations.length === 0 && <Alert type="info">Create a location first — every template belongs to one.</Alert>}
        <div className="form-row">
          <label className="grow">Title<input required value={form.title} onChange={set('title')} placeholder="3 Days in Kyoto" /></label>
          <label>Location
            <select required value={form.location} onChange={set('location')}>
              <option value="">Select…</option>
              {locations.map((l) => <option key={l._id} value={l._id}>{l.name}, {l.country}</option>)}
            </select>
          </label>
          <label>Days<input type="number" min={1} max={60} value={form.durationDays} onChange={set('durationDays')} /></label>
        </div>
        <label>Summary<textarea rows={2} value={form.summary} onChange={set('summary')} /></label>
        <div className="form-row">
          <label className="grow">Tags (comma separated)<input value={form.tags} onChange={set('tags')} placeholder="culture, food" /></label>
          <label className="check"><input type="checkbox" checked={form.isPublished} onChange={set('isPublished')} /> Published</label>
        </div>

        <p className="muted small">One activity per line: <code>09:00 | Fushimi Inari | Fushimi | sightseeing</code> (category: sightseeing, food, transport, stay, activity, other)</p>
        <div className="day-editors">
          {days.map((d, i) => (
            <div key={i} className="day-editor">
              <input placeholder={`Day ${i + 1} title`} value={d.title} onChange={(e) => setDay(i, 'title', e.target.value)} />
              <textarea rows={4} value={d.text} onChange={(e) => setDay(i, 'text', e.target.value)} />
            </div>
          ))}
        </div>
        <div className="row">
          <button className="btn">{editing ? 'Update template' : 'Create template'}</button>
          {editing && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <div className="card section">
        <table className="table">
          <thead><tr><th>Template</th><th>Location</th><th>Days</th><th>Used</th><th>Status</th><th /></tr></thead>
          <tbody>
            {items.map((t) => (
              <tr key={t._id}>
                <td><strong>{t.title}</strong></td>
                <td>{t.location?.name}</td>
                <td>{t.durationDays}</td>
                <td>{t.timesUsed}</td>
                <td>
                  <button className={`badge ${t.isPublished ? 'badge-booked' : 'badge-planning'}`} onClick={() => togglePublish(t)}>
                    {t.isPublished ? 'published' : 'draft'}
                  </button>
                </td>
                <td className="right nowrap">
                  <button className="btn btn-sm btn-ghost" onClick={() => edit(t)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(t)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
