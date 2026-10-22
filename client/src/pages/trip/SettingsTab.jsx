import { useState } from 'react';
import { toDateInput } from '../../utils';

export default function SettingsTab({ trip, save, onDelete }) {
  const [form, setForm] = useState({
    title: trip.title,
    description: trip.description || '',
    startDate: toDateInput(trip.startDate),
    endDate: toDateInput(trip.endDate),
    travelers: trip.travelers,
    budget: trip.budget,
    status: trip.status,
    coverImage: trip.coverImage || '',
  });
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => { setSaved(false); setForm({ ...form, [k]: e.target.value }); };

  const submit = async (e) => {
    e.preventDefault();
    const shrinking = form.startDate > toDateInput(trip.startDate) || form.endDate < toDateInput(trip.endDate);
    if (shrinking && !window.confirm('Shortening the trip removes activities on days outside the new range. Continue?')) return;
    setSaved(await save(form));
  };

  return (
    <div className="narrow">
      <form className="card form" onSubmit={submit}>
        <label>Trip name<input required value={form.title} onChange={set('title')} /></label>
        <label>Description<textarea rows={3} value={form.description} onChange={set('description')} /></label>
        <div className="form-row">
          <label>Start date<input type="date" required value={form.startDate} onChange={set('startDate')} /></label>
          <label>End date<input type="date" required min={form.startDate} value={form.endDate} onChange={set('endDate')} /></label>
        </div>
        <div className="form-row">
          <label>Travelers<input type="number" min={1} value={form.travelers} onChange={set('travelers')} /></label>
          <label>Budget (USD)<input type="number" min={0} value={form.budget} onChange={set('budget')} /></label>
          <label>Status
            <select value={form.status} onChange={set('status')}>
              <option value="planning">Planning</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>
        <label>Cover image URL<input type="url" value={form.coverImage} onChange={set('coverImage')} /></label>
        <div className="row between">
          <button className="btn">Save changes</button>
          {saved && <span className="muted small">✓ Saved</span>}
        </div>
      </form>

      <div className="card danger-zone">
        <div>
          <strong>Delete trip</strong>
          <p className="muted small">Permanently removes this trip and its schedule.</p>
        </div>
        <button className="btn btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
