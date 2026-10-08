import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = {
  DONOR: [
    { to: '/dashboard', label: '📊 Dashboard' },
    { to: '/donations', label: '🍱 My Donations' },
    { to: '/requests', label: '📋 Requests' },
  ],
  NGO: [
    { to: '/dashboard', label: '📊 Dashboard' },
    { to: '/donations', label: '🍱 Browse Food' },
    { to: '/requests', label: '📋 My Requests' },
  ],
  VOLUNTEER: [
    { to: '/dashboard', label: '📊 Dashboard' },
    { to: '/volunteer', label: '🚚 My Tasks' },
  ],
  ADMIN: [
    { to: '/dashboard', label: '📊 Dashboard' },
    { to: '/donations', label: '🍱 Donations' },
    { to: '/requests', label: '📋 Requests' },
    { to: '/volunteer', label: '🚚 Tasks' },
    { to: '/admin', label: '⚙️ Admin' },
  ],
};

export default function Sidebar() {
  const { role } = useAuth();
  const roleLinks = links[role] || [];

  return (
    <aside className="sidebar">
      {roleLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}
