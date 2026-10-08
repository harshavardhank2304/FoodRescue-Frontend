import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { donationService } from '../services/donationService';
import { requestService, volunteerService, adminService } from '../services/requestService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Dashboard() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      if (role === 'DONOR') {
        const res = await donationService.getMy();
        const donations = res.data || [];
        setStats({
          total: donations.length,
          available: donations.filter((d) => d.status === 'AVAILABLE').length,
          delivered: donations.filter((d) => d.status === 'DELIVERED').length,
        });
      } else if (role === 'NGO') {
        const [donationsRes, requestsRes] = await Promise.all([
          donationService.getAvailable(0, 1),
          requestService.getMy(),
        ]);
        setStats({
          availableFood: donationsRes.data.totalElements || 0,
          myRequests: requestsRes.data.length || 0,
          acceptedRequests: requestsRes.data.filter((r) => r.status === 'ACCEPTED').length || 0,
        });
      } else if (role === 'VOLUNTEER') {
        const res = await volunteerService.getTasks();
        const tasks = res.data || [];
        setStats({
          assignedTasks: tasks.filter((t) => t.status === 'ASSIGNED').length,
          pickedUp: tasks.filter((t) => t.status === 'PICKED_UP').length,
          delivered: tasks.filter((t) => t.status === 'DELIVERED').length,
        });
      } else if (role === 'ADMIN') {
        const res = await adminService.getStatistics();
        setStats(res.data || {});
      }
    } catch (err) {
      setError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name}!</h1>
          <p style={{ color: '#718096' }}>Role: <strong>{role}</strong></p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner message="Loading dashboard statistics..." />
      ) : (
        <>
          <div className="stats-grid">
            {role === 'DONOR' && (
              <>
                <div className="stat-card">
                  <div className="stat-number">{stats.total ?? 0}</div>
                  <div className="stat-label">Total Donations</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.available ?? 0}</div>
                  <div className="stat-label">Available Donations</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.delivered ?? 0}</div>
                  <div className="stat-label">Delivered Donations</div>
                </div>
              </>
            )}

            {role === 'NGO' && (
              <>
                <div className="stat-card">
                  <div className="stat-number">{stats.availableFood ?? 0}</div>
                  <div className="stat-label">Available Food Listings</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.myRequests ?? 0}</div>
                  <div className="stat-label">Total Requests Placed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.acceptedRequests ?? 0}</div>
                  <div className="stat-label">Approved Requests</div>
                </div>
              </>
            )}

            {role === 'VOLUNTEER' && (
              <>
                <div className="stat-card">
                  <div className="stat-number">{stats.assignedTasks ?? 0}</div>
                  <div className="stat-label">Assigned Tasks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.pickedUp ?? 0}</div>
                  <div className="stat-label">In-Transit (Picked Up)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.delivered ?? 0}</div>
                  <div className="stat-label">Completed Deliveries</div>
                </div>
              </>
            )}

            {role === 'ADMIN' && (
              <>
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
              </>
            )}
          </div>

          <div className="card">
            <h2 className="card-title">Quick Actions</h2>
            <div className="row" style={{ marginTop: '12px' }}>
              {role === 'DONOR' && (
                <>
                  <Link to="/add-donation" className="btn btn-primary">
                    + Create Food Donation
                  </Link>
                  <Link to="/donations" className="btn btn-secondary">
                    View My Donations
                  </Link>
                  <Link to="/requests" className="btn btn-outline">
                    Check Requests
                  </Link>
                </>
              )}
              {role === 'NGO' && (
                <>
                  <Link to="/donations" className="btn btn-primary">
                    Browse Surplus Food
                  </Link>
                  <Link to="/requests" className="btn btn-secondary">
                    View My Requests
                  </Link>
                </>
              )}
              {role === 'VOLUNTEER' && (
                <Link to="/volunteer" className="btn btn-primary">
                  View Assigned Tasks
                </Link>
              )}
              {role === 'ADMIN' && (
                <>
                  <Link to="/admin" className="btn btn-primary">
                    Open Administration Panel
                  </Link>
                  <Link to="/donations" className="btn btn-secondary">
                    Monitor Donations
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
