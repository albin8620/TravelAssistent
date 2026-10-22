import { useState } from 'react';

const SUGGESTIONS = ['Passport / ID', 'Travel insurance', 'Phone charger', 'Medications', 'Local currency', 'Adapter plug'];

export default function ChecklistTab({ trip, save }) {
  const [text, setText] = useState('');
  const list = trip.checklist;

  const add = async (value) => {
    const t = value.trim();
    if (!t) return;
    if (await save({ checklist: [...list, { text: t, done: false }] })) setText('');
  };

  const missing = SUGGESTIONS.filter((s) => !list.some((i) => i.text.toLowerCase() === s.toLowerCase()));
  const pct = list.length ? Math.round((list.filter((i) => i.done).length / list.length) * 100) : 0;

  return (
    <div className="narrow">
      <div className="progress"><div style={{ width: `${pct}%` }} /></div>
      <p className="muted small">{pct}% packed & ready</p>

      <form className="row" onSubmit={(e) => { e.preventDefault(); add(text); }}>
        <input className="grow" placeholder="Add an item…" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn">Add</button>
      </form>

      {missing.length > 0 && (
        <div className="chips">
          {missing.map((s) => <button key={s} className="chip" onClick={() => add(s)}>+ {s}</button>)}
        </div>
      )}

      <ul className="checklist card">
        {list.length === 0 && <li className="muted">Your checklist is empty.</li>}
        {list.map((item) => (
          <li key={item._id} className={item.done ? 'done' : ''}>
            <label className="row">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => save({ checklist: list.map((i) => (i._id === item._id ? { ...i, done: !i.done } : i)) })}
              />
              <span>{item.text}</span>
            </label>
            <button className="icon-btn" onClick={() => save({ checklist: list.filter((i) => i._id !== item._id) })}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
