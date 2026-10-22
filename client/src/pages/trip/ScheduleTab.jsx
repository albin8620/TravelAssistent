import { useState } from 'react';
import { CATEGORY_ICONS, fmtDate } from '../../utils';

const EMPTY = { time: '', title: '', place: '', category: 'sightseeing', notes: '' };

export default function ScheduleTab({ trip, save }) {
  const updateDay = (dayId, changes) =>
    save((latest) => ({ days: latest.days.map((d) => (d._id === dayId ? { ...d, ...changes } : d)) }));

  return (
    <div className="timeline">
      {trip.days.map((day, i) => (
        <DayCard key={day._id} index={i} day={day} onChange={(changes) => updateDay(day._id, changes)} />
      ))}
    </div>
  );
}

function DayCard({ day, index, onChange }) {
  const [title, setTitle] = useState(day.title || '');
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const activities = [...day.activities].sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));

  const addActivity = async (e) => {
    e.preventDefault();
    const ok = await onChange({ activities: [...day.activities, form] });
    if (ok) {
      setForm(EMPTY);
      setOpen(false);
    }
  };

  const patchActivity = (id, changes) =>
    onChange({ activities: day.activities.map((a) => (a._id === id ? { ...a, ...changes } : a)) });

  const removeActivity = (id) => onChange({ activities: day.activities.filter((a) => a._id !== id) });

  return (
    <div className="card day">
      <div className="day-head">
        <div className="day-num">Day {index + 1}</div>
        <div className="grow">
          <div className="muted small">{fmtDate(day.date, { weekday: 'long' })}</div>
          <input
            className="inline-input"
            placeholder="Give this day a theme…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title !== (day.title || '') && onChange({ title })}
          />
        </div>
        <button className="btn btn-sm btn-ghost" onClick={() => setOpen(!open)}>{open ? 'Cancel' : '+ Activity'}</button>
      </div>

      {activities.length === 0 && !open && <p className="muted small">Nothing planned yet — free day!</p>}

      <ul className="activities">
        {activities.map((a) => (
          <li key={a._id} className={a.done ? 'done' : ''}>
            <input type="checkbox" checked={a.done} onChange={() => patchActivity(a._id, { done: !a.done })} />
            <span className="time">{a.time || '—'}</span>
            <span className="icon">{CATEGORY_ICONS[a.category]}</span>
            <div className="grow">
              <strong>{a.title}</strong>
              {a.place && <span className="muted"> · {a.place}</span>}
              {a.notes && <div className="muted small">{a.notes}</div>}
            </div>
            <button className="icon-btn" title="Remove" onClick={() => removeActivity(a._id)}>✕</button>
          </li>
        ))}
      </ul>

      {open && (
        <form className="form inline-form" onSubmit={addActivity}>
          <div className="form-row">
            <label>Time<input type="time" value={form.time} onChange={set('time')} /></label>
            <label className="grow">Activity<input required value={form.title} onChange={set('title')} placeholder="Visit the old town" /></label>
          </div>
          <div className="form-row">
            <label className="grow">Place<input value={form.place} onChange={set('place')} /></label>
            <label>Category
              <select value={form.category} onChange={set('category')}>
                {Object.keys(CATEGORY_ICONS).map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
              </select>
            </label>
          </div>
          <label>Notes<input value={form.notes} onChange={set('notes')} /></label>
          <button className="btn btn-sm">Add to Day {index + 1}</button>
        </form>
      )}
    </div>
  );
}
