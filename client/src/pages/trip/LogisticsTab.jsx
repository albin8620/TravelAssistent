import { useState } from 'react';
import { TRANSPORT_ICONS, fmtDateTime, money } from '../../utils';

const EMPTY_TRANSPORT = { mode: 'flight', from: '', to: '', departAt: '', arriveAt: '', bookingRef: '', cost: 0 };
const EMPTY_STAY = { name: '', address: '', checkIn: '', checkOut: '', bookingRef: '', cost: 0 };

export default function LogisticsTab({ trip, save }) {
  const [transport, setTransport] = useState(EMPTY_TRANSPORT);
  const [stay, setStay] = useState(EMPTY_STAY);
  const setT = (k) => (e) => setTransport({ ...transport, [k]: e.target.value });
  const setS = (k) => (e) => setStay({ ...stay, [k]: e.target.value });

  const addTransport = async (e) => {
    e.preventDefault();
    if (await save({ transport: [...trip.transport, transport] })) setTransport(EMPTY_TRANSPORT);
  };
  const addStay = async (e) => {
    e.preventDefault();
    if (await save({ stays: [...trip.stays, stay] })) setStay(EMPTY_STAY);
  };

  const byTime = (key) => (a, b) => new Date(a[key] || 0) - new Date(b[key] || 0);

  return (
    <div className="two-col">
      <section>
        <h2>Transport</h2>
        {trip.transport.length === 0 && <p className="muted small">No transport booked yet.</p>}
        {[...trip.transport].sort(byTime('departAt')).map((t) => (
          <div key={t._id} className="card logistic">
            <span className="big-icon">{TRANSPORT_ICONS[t.mode]}</span>
            <div className="grow">
              <strong>{t.from || '?'} → {t.to || '?'}</strong>
              <div className="muted small">{fmtDateTime(t.departAt)}{t.arriveAt && ` → ${fmtDateTime(t.arriveAt)}`}</div>
              <div className="small">{t.bookingRef && `Ref: ${t.bookingRef} · `}{money(t.cost)}</div>
            </div>
            <button className="icon-btn" onClick={() => save({ transport: trip.transport.filter((x) => x._id !== t._id) })}>✕</button>
          </div>
        ))}
        <form className="card form" onSubmit={addTransport}>
          <h3>Add transport</h3>
          <div className="form-row">
            <label>Mode
              <select value={transport.mode} onChange={setT('mode')}>
                {Object.keys(TRANSPORT_ICONS).map((m) => <option key={m} value={m}>{TRANSPORT_ICONS[m]} {m}</option>)}
              </select>
            </label>
            <label>From<input required value={transport.from} onChange={setT('from')} /></label>
            <label>To<input required value={transport.to} onChange={setT('to')} /></label>
          </div>
          <div className="form-row">
            <label>Departs<input type="datetime-local" value={transport.departAt} onChange={setT('departAt')} /></label>
            <label>Arrives<input type="datetime-local" value={transport.arriveAt} onChange={setT('arriveAt')} /></label>
          </div>
          <div className="form-row">
            <label>Booking ref<input value={transport.bookingRef} onChange={setT('bookingRef')} /></label>
            <label>Cost (USD)<input type="number" min={0} value={transport.cost} onChange={setT('cost')} /></label>
          </div>
          <button className="btn btn-sm">Add transport</button>
        </form>
      </section>

      <section>
        <h2>Accommodation</h2>
        {trip.stays.length === 0 && <p className="muted small">No stays booked yet.</p>}
        {[...trip.stays].sort(byTime('checkIn')).map((s) => (
          <div key={s._id} className="card logistic">
            <span className="big-icon">🏨</span>
            <div className="grow">
              <strong>{s.name}</strong>
              {s.address && <div className="muted small">{s.address}</div>}
              <div className="muted small">{fmtDateTime(s.checkIn)}{s.checkOut && ` → ${fmtDateTime(s.checkOut)}`}</div>
              <div className="small">{s.bookingRef && `Ref: ${s.bookingRef} · `}{money(s.cost)}</div>
            </div>
            <button className="icon-btn" onClick={() => save({ stays: trip.stays.filter((x) => x._id !== s._id) })}>✕</button>
          </div>
        ))}
        <form className="card form" onSubmit={addStay}>
          <h3>Add stay</h3>
          <label>Name<input required value={stay.name} onChange={setS('name')} placeholder="Hotel Sakura" /></label>
          <label>Address<input value={stay.address} onChange={setS('address')} /></label>
          <div className="form-row">
            <label>Check-in<input type="datetime-local" value={stay.checkIn} onChange={setS('checkIn')} /></label>
            <label>Check-out<input type="datetime-local" value={stay.checkOut} onChange={setS('checkOut')} /></label>
          </div>
          <div className="form-row">
            <label>Booking ref<input value={stay.bookingRef} onChange={setS('bookingRef')} /></label>
            <label>Cost (USD)<input type="number" min={0} value={stay.cost} onChange={setS('cost')} /></label>
          </div>
          <button className="btn btn-sm">Add stay</button>
        </form>
      </section>
    </div>
  );
}
