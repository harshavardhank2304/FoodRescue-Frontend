import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">🌿 FoodRescue</span>
      <div className="navbar-right">
        {user && (
          <>
            <span className="navbar-user">
              {user.name} · <strong>{user.role}</strong>
            </span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
