import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import Alert from '../components/Alert';
import { todayInput } from '../utils';

export default function NewTrip() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', startDate: todayInput(), endDate: todayInput(), travelers: 1, budget: 0, coverImage: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/trips', form);
      navigate(`/trips/${data._id}`);
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <div className="narrow card">
      <h1>Plan a new trip</h1>
      <p className="muted">A day-by-day schedule is created automatically for your dates.</p>
      <Alert>{error}</Alert>
      <form className="form" onSubmit={submit}>
        <label>Trip name<input required placeholder="Summer in Japan" value={form.title} onChange={set('title')} /></label>
        <label>Description<textarea rows={3} value={form.description} onChange={set('description')} /></label>
        <div className="form-row">
          <label>Start date<input type="date" required value={form.startDate} onChange={set('startDate')} /></label>
          <label>End date<input type="date" required min={form.startDate} value={form.endDate} onChange={set('endDate')} /></label>
        </div>
        <div className="form-row">
          <label>Travelers<input type="number" min={1} value={form.travelers} onChange={set('travelers')} /></label>
          <label>Budget (USD)<input type="number" min={0} value={form.budget} onChange={set('budget')} /></label>
        </div>
        <label>Cover image URL (optional)<input type="url" value={form.coverImage} onChange={set('coverImage')} /></label>
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Create trip'}</button>
      </form>
    </div>
  );
}
