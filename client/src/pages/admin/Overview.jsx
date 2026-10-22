import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import Alert from '../../components/Alert';

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (!stats) return error ? <Alert>{error}</Alert> : <p className="muted">Loading…</p>;

  return (
    <>
      <div className="stats">
        {['users', 'trips', 'locations', 'templates'].map((k) => (
          <div key={k} className="card stat">
            <div className="stat-value">{stats[k]}</div>
            <div className="muted small">{k}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3>Most-used templates</h3>
        {stats.topTemplates.length === 0 && <p className="muted small">No templates yet.</p>}
        <table className="table">
          <tbody>
            {stats.topTemplates.map((t) => (
              <tr key={t._id}><td>{t.title}</td><td className="right">{t.timesUsed} trip(s)</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
