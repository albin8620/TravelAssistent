import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import Alert from '../components/Alert';
import { FALLBACK_IMG, fmtDate, money, tripLength } from '../utils';
import ScheduleTab from './trip/ScheduleTab';
import DestinationsTab from './trip/DestinationsTab';
import LogisticsTab from './trip/LogisticsTab';
import ChecklistTab from './trip/ChecklistTab';
import SettingsTab from './trip/SettingsTab';

const TABS = [
  ['schedule', '🗓️ Schedule'],
  ['destinations', '📍 Destinations'],
  ['logistics', '🧳 Logistics'],
  ['checklist', '✅ Checklist'],
  ['settings', '⚙️ Trip details'],
];

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [tab, setTab] = useState('schedule');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const latest = useRef(null);
  const queue = useRef(Promise.resolve());
  const load = (data) => {
    latest.current = data;
    setTrip(data);
  };

  useEffect(() => {
    api.get(`/trips/${id}`).then(({ data }) => load(data)).catch((e) => setError(errMsg(e)));
  }, [id]);

  // Persists a partial update and replaces local state with the server's copy.
  // Saves run one at a time; pass a function to build the patch from the latest trip
  // so a quick second edit can't overwrite one that is still saving.
  const save = (patch) => (queue.current = queue.current.then(async () => {
    setSaving(true);
    setError('');
    try {
      if (typeof patch === 'function') patch = patch(latest.current);
      if (patch.destinations) {
        patch.destinations = patch.destinations.map((d) => ({ ...d, location: d.location?._id || d.location }));
      }
      const { data } = await api.put(`/trips/${id}`, patch);
      load(data);
      return true;
    } catch (e) {
      setError(errMsg(e));
      return false;
    } finally {
      setSaving(false);
    }
  }));

  const remove = async () => {
    if (!window.confirm(`Delete "${trip.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/trips/${id}`);
      navigate('/');
    } catch (e) {
      setError(errMsg(e));
    }
  };

  if (!trip) return error ? <Alert>{error}</Alert> : <p className="muted">Loading trip…</p>;

  const activityCount = trip.days.reduce((n, d) => n + d.activities.length, 0);
  const checklistDone = trip.checklist.filter((c) => c.done).length;

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${trip.coverImage || FALLBACK_IMG})` }}>
        <div className="hero-overlay">
          <span className={`badge badge-${trip.status}`}>{trip.status}</span>
          <h1>{trip.title}</h1>
          <p>{fmtDate(trip.startDate)} – {fmtDate(trip.endDate)} · {tripLength(trip.startDate, trip.endDate)} days · {trip.travelers} traveler(s)</p>
        </div>
      </section>

      <div className="stats">
        <Stat label="Destinations" value={trip.destinations.length} />
        <Stat label="Activities" value={activityCount} />
        <Stat label="Checklist" value={`${checklistDone}/${trip.checklist.length}`} />
        <Stat
          label="Booked / budget"
          value={`${money(trip.spent)} / ${money(trip.budget)}`}
          warn={trip.budget > 0 && trip.spent > trip.budget}
        />
      </div>

      <div className="tabs">
        {TABS.map(([key, label]) => (
          <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
        {saving && <span className="muted small saving">Saving…</span>}
      </div>

      <Alert>{error}</Alert>

      {tab === 'schedule' && <ScheduleTab trip={trip} save={save} />}
      {tab === 'destinations' && <DestinationsTab trip={trip} save={save} />}
      {tab === 'logistics' && <LogisticsTab trip={trip} save={save} />}
      {tab === 'checklist' && <ChecklistTab trip={trip} save={save} />}
      {tab === 'settings' && <SettingsTab trip={trip} save={save} onDelete={remove} />}
    </>
  );
}

function Stat({ label, value, warn }) {
  return (
    <div className={`card stat ${warn ? 'stat-warn' : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="muted small">{label}</div>
    </div>
  );
}
