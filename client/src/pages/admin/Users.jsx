import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import Alert from '../../components/Alert';
import { useAuth } from '../../context/AuthContext';
import { fmtDate } from '../../utils';

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/admin/users').then(({ data }) => setUsers(data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const toggleRole = async (u) => {
    const role = u.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Make ${u.name} ${role === 'admin' ? 'an admin' : 'a regular user'}?`)) return;
    try {
      await api.patch(`/admin/users/${u._id}/role`, { role });
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <div className="card">
      <Alert>{error}</Alert>
      <table className="table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Trips</th><th>Joined</th><th /></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td><span className={`badge ${u.role === 'admin' ? 'badge-booked' : ''}`}>{u.role}</span></td>
              <td>{u.tripCount}</td>
              <td>{fmtDate(u.createdAt)}</td>
              <td className="right">
                {u._id !== me.id && (
                  <button className="btn btn-sm btn-ghost" onClick={() => toggleRole(u)}>
                    {u.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
