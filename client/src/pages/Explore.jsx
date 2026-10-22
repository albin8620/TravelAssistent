import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import Alert from '../components/Alert';
import { FALLBACK_IMG } from '../utils';

const CATEGORIES = ['all', 'city', 'beach', 'mountain', 'heritage', 'nature', 'other'];

export default function Explore() {
  const [templates, setTemplates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [category, setCategory] = useState('all');
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/templates').then(({ data }) => setTemplates(data)).catch((e) => setError(errMsg(e)));
  }, []);

  useEffect(() => {
    const params = {};
    if (category !== 'all') params.category = category;
    if (q.trim()) params.q = q.trim();
    const t = setTimeout(() => {
      api.get('/locations', { params }).then(({ data }) => setLocations(data)).catch((e) => setError(errMsg(e)));
    }, 250);
    return () => clearTimeout(t);
  }, [category, q]);

  const locIds = new Set(locations.map((l) => l._id));
  const visibleTemplates = category === 'all' && !q ? templates : templates.filter((t) => locIds.has(t.location?._id));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Explore destinations</h1>
          <p className="muted">Ready-made itineraries curated by our team. Pick one and make it yours.</p>
        </div>
        <input className="search" placeholder="Search city or country…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="chips">
        {CATEGORIES.map((c) => (
          <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      <Alert>{error}</Alert>

      <section className="section">
        <h2>Itinerary templates</h2>
        {visibleTemplates.length === 0 && <p className="muted">No templates match.</p>}
        <div className="grid">
          {visibleTemplates.map((t) => (
            <Link key={t._id} to={`/explore/${t._id}`} className="card trip-card">
              <img src={t.location?.imageUrl || FALLBACK_IMG} alt="" onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
              <div className="trip-card-body">
                <div className="row between">
                  <h3>{t.title}</h3>
                  <span className="badge">{t.durationDays} days</span>
                </div>
                <p className="muted small">📍 {t.location?.name}, {t.location?.country}</p>
                <p className="small clamp">{t.summary}</p>
                <div className="tags">{t.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Locations</h2>
        <div className="grid grid-sm">
          {locations.map((l) => (
            <div key={l._id} className="card loc-card">
              <img src={l.imageUrl || FALLBACK_IMG} alt="" onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
              <div className="trip-card-body">
                <strong>{l.name}</strong>
                <div className="muted small">{[l.city, l.country].filter(Boolean).join(', ')} · {l.category}</div>
                {l.bestTimeToVisit && <div className="small">🌤️ Best: {l.bestTimeToVisit}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
