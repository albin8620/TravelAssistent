import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewTrip from './pages/NewTrip';
import TripDetail from './pages/TripDetail';
import Explore from './pages/Explore';
import TemplateView from './pages/TemplateView';
import Admin from './pages/admin/Admin';

function Protected({ children, admin = false }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="center muted">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/:id" element={<TemplateView />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/trips/new" element={<Protected><NewTrip /></Protected>} />
          <Route path="/trips/:id" element={<Protected><TripDetail /></Protected>} />
          <Route path="/admin/*" element={<Protected admin><Admin /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
