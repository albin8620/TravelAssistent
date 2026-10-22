import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_ICONS, FALLBACK_IMG, todayInput } from '../utils';

export default function TemplateView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tpl, setTpl] = useState(null);
  const [startDate, setStartDate] = useState(todayInput());
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/templates/${id}`).then(({ data }) => { setTpl(data); setTitle(data.title); }).catch((e) => setError(errMsg(e)));
  }, [id]);

  const useTemplate = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post(`/trips/from-template/${id}`, { startDate, title });
      navigate(`/trips/${data._id}`);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  if (!tpl) return error ? <Alert>{error}</Alert> : <p className="muted">Loading…</p>;
  const loc = tpl.location;

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${loc?.imageUrl || FALLBACK_IMG})` }}>
        <div className="hero-overlay">
          <span className="badge">{tpl.durationDays} days</span>
          <h1>{tpl.title}</h1>
          <p>📍 {loc?.name}, {loc?.country}{loc?.bestTimeToVisit && ` · Best time: ${loc.bestTimeToVisit}`}</p>
        </div>
      </section>

      <div className="two-col wide-left">
        <div>
          <p>{tpl.summary}</p>
          {loc?.description && <p className="muted">{loc.description}</p>}
          <div className="timeline">
            {[...tpl.days].sort((a, b) => a.dayNumber - b.dayNumber).map((d) => (
              <div key={d._id} className="card day">
                <div className="day-head">
                  <div className="day-num">Day {d.dayNumber}</div>
                  <strong className="grow">{d.title}</strong>
                </div>
                <ul className="activities">
                  {d.activities.map((a) => (
                    <li key={a._id}>
                      <span className="time">{a.time || '—'}</span>
                      <span className="icon">{CATEGORY_ICONS[a.category]}</span>
                      <div className="grow"><strong>{a.title}</strong>{a.place && <span className="muted"> · {a.place}</span>}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <aside className="card form sticky">
          <h3>Use this template</h3>
          <Alert>{error}</Alert>
          {user ? (
            <form className="form" onSubmit={useTemplate}>
              <label>Trip name<input required value={title} onChange={(e) => setTitle(e.target.value)} /></label>
              <label>Start date<input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
              <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Add to my trips'}</button>
              <p className="muted small">You can edit every day after it's copied.</p>
            </form>
          ) : (
            <p><Link to="/login">Log in</Link> to copy this itinerary into your trips.</p>
          )}
        </aside>
      </div>
    </>
  );
}
