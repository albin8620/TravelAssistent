import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import Alert from '../components/Alert';
import { FALLBACK_IMG, fmtDate, toDateInput, todayInput, tripLength } from '../utils';

const FILTERS = ['all', 'planning', 'booked', 'completed'];

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get('/trips', { params: filter === 'all' ? {} : { status: filter } })
      .then(({ data }) => setTrips(data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [filter]);

  // Compare calendar dates so a trip ending today still counts as ongoing.
  const today = todayInput();
  const upcoming = trips.filter((t) => toDateInput(t.endDate) >= today);
  const past = trips.filter((t) => toDateInput(t.endDate) < today);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My Trips</h1>
          <p className="muted">Plan schedules, destinations and logistics for every journey.</p>
        </div>
        <div className="row">
          <Link to="/explore" className="btn btn-ghost">Browse templates</Link>
          <Link to="/trips/new" className="btn">+ New trip</Link>
        </div>
      </div>

      <div className="chips">
        {FILTERS.map((f) => (
          <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <Alert>{error}</Alert>
      {loading ? (
        <p className="muted">Loading trips…</p>
      ) : trips.length === 0 ? (
        <div className="empty card">
          <h3>No trips yet</h3>
          <p className="muted">Start from scratch or pick a curated destination template.</p>
          <div className="row center-row">
            <Link to="/trips/new" className="btn">Create a trip</Link>
            <Link to="/explore" className="btn btn-ghost">Explore templates</Link>
          </div>
        </div>
      ) : (
        <>
          <TripGrid title="Upcoming & ongoing" trips={upcoming} />
          <TripGrid title="Past trips" trips={past} />
        </>
      )}
    </>
  );
}

function TripGrid({ title, trips }) {
  if (!trips.length) return null;
  return (
    <section className="section">
      <h2>{title}</h2>
      <div className="grid">
        {trips.map((t) => (
          <Link key={t._id} to={`/trips/${t._id}`} className="card trip-card">
            <img src={t.coverImage || FALLBACK_IMG} alt="" onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
            <div className="trip-card-body">
              <div className="row between">
                <h3>{t.title}</h3>
                <span className={`badge badge-${t.status}`}>{t.status}</span>
              </div>
              <p className="muted small">
                {fmtDate(t.startDate)} – {fmtDate(t.endDate)} · {tripLength(t.startDate, t.endDate)} days
              </p>
              {t.destinations?.length > 0 && (
                <p className="small">📍 {t.destinations.map((d) => d.name).join(' → ')}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
