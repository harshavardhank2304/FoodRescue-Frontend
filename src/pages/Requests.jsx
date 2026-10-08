import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestService, adminService } from '../services/requestService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Requests() {
  const { role } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [role]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (role === 'DONOR') {
        res = await requestService.getDonorRequests();
      } else if (role === 'NGO') {
        res = await requestService.getMy();
      } else if (role === 'ADMIN') {
        res = await adminService.getRequests();
      } else {
        res = { data: [] };
      }
      setRequests(res.data || []);
    } catch (err) {
      setError('Failed to fetch food requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setActionLoading(true);
    try {
      await requestService.accept(id);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      await requestService.reject(id);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {role === 'DONOR' ? 'Incoming Food Requests' : 'My Food Requests'}
          </h1>
          <p style={{ color: '#718096' }}>
            {role === 'DONOR'
              ? 'Review and approve requests from verified NGOs'
              : 'Track the approval and delivery status of your requests'}
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner message="Fetching food requests..." />
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <h3>No requests found.</h3>
          <p>
            {role === 'DONOR'
              ? 'No NGO has requested your donations yet.'
              : 'You have not submitted any food requests yet.'}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Food Item</th>
                  <th>Quantity</th>
                  {role === 'DONOR' ? <th>Requested By (NGO)</th> : <th>Donor Name</th>}
                  <th>Message / Notes</th>
                  <th>Status</th>
                  <th>Created At</th>
                  {role === 'DONOR' && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>#{req.id}</td>
                    <td>
                      <strong>{req.donation?.foodName || 'Donation Item'}</strong>
                    </td>
                    <td>{req.requestedQuantity}</td>
                    <td>
                      {role === 'DONOR'
                        ? req.requester?.name || req.requester?.email
                        : req.donation?.donor?.name || 'Donor'}
                    </td>
                    <td>{req.message || '—'}</td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td>
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    {role === 'DONOR' && (
                      <td>
                        {req.status === 'PENDING' && (
                          <div className="row">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAccept(req.id)}
                              disabled={actionLoading}
                            >
                              Accept
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleReject(req.id)}
                              disabled={actionLoading}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
