import { useState, useEffect } from 'react';
import { adminService } from '../services/requestService';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cacheMsg, setCacheMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getStatistics(),
      ]);
      setUsers(usersRes.data || []);
      setStats(statsRes.data || {});

      // Fetch actuator health
      try {
        const healthRes = await api.get('/actuator/health');
        setHealth(healthRes.data?.status || 'UP');
      } catch {
        setHealth('UNKNOWN');
      }
    } catch (err) {
      setError('Failed to fetch administrator data.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvictCache = async () => {
    try {
      await api.post('/admin/cache/evict');
      setCacheMsg('Cache evicted successfully! Next stats call will re-compute from database.');
      const statsRes = await adminService.getStatistics();
      setStats(statsRes.data || {});
      setTimeout(() => setCacheMsg(''), 4000);
    } catch (err) {
      alert('Failed to clear cache.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin & System Monitoring</h1>
          <p style={{ color: '#718096' }}>
            System overview, Spring Actuator health, and cached metrics
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleEvictCache}>
          🧹 Evict Stats Cache (@CacheEvict)
        </button>
      </div>

      <ErrorMessage message={error} />
      {cacheMsg && (
        <div style={{ background: '#ebf8ff', border: '1px solid #bee3f8', color: '#2b6cb0', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px' }}>
          ℹ️ {cacheMsg}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Fetching admin metrics and users..." />
      ) : (
        <>
          {/* Actuator & Statistics */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number" style={{ color: health === 'UP' ? '#38a169' : '#e53e3e' }}>
                {health || 'UP'}
              </div>
              <div className="stat-label">Actuator Health</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalUsers ?? 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalDonations ?? 0}</div>
              <div className="stat-label">Total Donations</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.availableDonations ?? 0}</div>
              <div className="stat-label">Available Donations</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalRequests ?? 0}</div>
              <div className="stat-label">Total Requests</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.acceptedRequests ?? 0}</div>
              <div className="stat-label">Accepted Requests</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.deliveredDonations ?? 0}</div>
              <div className="stat-label">Delivered Food</div>
            </div>
          </div>

          {/* User Management Table */}
          <div className="card">
            <h2 className="card-title">Registered Users</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td>
                        <span className="badge badge-assigned">{u.role}</span>
                      </td>
                      <td>
                        <StatusBadge status={u.status} />
                      </td>
                      <td>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
