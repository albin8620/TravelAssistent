import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import Alert from '../components/Alert';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-card card">
      <h1>Create your account</h1>
      <p className="muted">Build day-by-day schedules and keep every booking in one place.</p>
      <Alert>{error}</Alert>
      <form onSubmit={submit} className="form">
        <label>Name<input required value={form.name} onChange={set('name')} /></label>
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Password<input type="password" minLength={6} required value={form.password} onChange={set('password')} /></label>
        <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
      </form>
      <p className="muted small">Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
