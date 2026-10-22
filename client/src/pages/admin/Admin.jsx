import { NavLink, Route, Routes } from 'react-router-dom';
import Overview from './Overview';
import Locations from './Locations';
import Templates from './Templates';
import Users from './Users';

export default function Admin() {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Admin console</h1>
          <p className="muted">Curate public destination templates and manage locations.</p>
        </div>
      </div>
      <div className="tabs">
        <NavLink end to="/admin" className="tab">📊 Overview</NavLink>
        <NavLink to="/admin/locations" className="tab">📍 Locations</NavLink>
        <NavLink to="/admin/templates" className="tab">🗺️ Templates</NavLink>
        <NavLink to="/admin/users" className="tab">👥 Users</NavLink>
      </div>
      <Routes>
        <Route index element={<Overview />} />
        <Route path="locations" element={<Locations />} />
        <Route path="templates" element={<Templates />} />
        <Route path="users" element={<Users />} />
      </Routes>
    </>
  );
}
