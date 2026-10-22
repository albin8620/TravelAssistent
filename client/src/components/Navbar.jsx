import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">🧭 Itinerary<span>Maker</span></Link>
        <nav>
          {user && <NavLink to="/" end>My Trips</NavLink>}
          <NavLink to="/explore">Explore</NavLink>
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
          {user ? (
            <>
              <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/login'); }}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/register" className="btn btn-sm">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
