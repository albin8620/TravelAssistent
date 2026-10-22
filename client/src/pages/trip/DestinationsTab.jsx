import { useEffect, useState } from 'react';
import api from '../../api';
import { fmtDate, toDateInput } from '../../utils';

export default function DestinationsTab({ trip, save }) {
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    location: '', name: '', arrivalDate: toDateInput(trip.startDate), departureDate: toDateInput(trip.endDate), notes: '',
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    api.get('/locations').then(({ data }) => setLocations(data)).catch(() => {});
  }, []);

  const pickLocation = (e) => {
    const loc = locations.find((l) => l._id === e.target.value);
    setForm({ ...form, location: e.target.value, name: loc ? `${loc.name}, ${loc.country}` : form.name });
  };

  const add = async (e) => {
    e.preventDefault();
    const entry = { ...form, location: form.location || undefined };
    if (await save({ destinations: [...trip.destinations, entry] })) {
      setForm({ ...form, location: '', name: '', notes: '' });
    }
  };

  const remove = (id) => save({ destinations: trip.destinations.filter((d) => d._id !== id) });

  return (
    <div className="two-col">
      <div>
        {trip.destinations.length === 0 && <p className="muted">No destinations yet. Add the places you'll visit.</p>}
        <ol className="route">
          {trip.destinations.map((d) => (
            <li key={d._id} className="card route-stop">
              {d.location?.imageUrl && <img src={d.location.imageUrl} alt="" />}
              <div className="grow">
                <strong>{d.name}</strong>
                <div className="muted small">
                  {d.arrivalDate ? fmtDate(d.arrivalDate) : '?'} → {d.departureDate ? fmtDate(d.departureDate) : '?'}
                </div>
                {d.notes && <div className="small">{d.notes}</div>}
              </div>
              <button className="icon-btn" onClick={() => remove(d._id)} title="Remove">✕</button>
            </li>
          ))}
        </ol>
      </div>

      <form className="card form" onSubmit={add}>
        <h3>Add destination</h3>
        <label>From curated locations
          <select value={form.location} onChange={pickLocation}>
            <option value="">— Custom place —</option>
            {locations.map((l) => <option key={l._id} value={l._id}>{l.name}, {l.country}</option>)}
          </select>
        </label>
        <label>Name<input required value={form.name} onChange={set('name')} placeholder="Kyoto, Japan" /></label>
        <div className="form-row">
          <label>Arrive<input type="date" value={form.arrivalDate} onChange={set('arrivalDate')} /></label>
          <label>Depart<input type="date" value={form.departureDate} onChange={set('departureDate')} /></label>
        </div>
        <label>Notes<textarea rows={2} value={form.notes} onChange={set('notes')} /></label>
        <button className="btn">Add destination</button>
      </form>
    </div>
  );
}
