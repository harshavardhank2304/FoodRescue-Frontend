import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { volunteerService } from '../services/requestService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function VolunteerTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await volunteerService.getTasks();
      setTasks(res.data || []);
    } catch (err) {
      setError('Failed to fetch volunteer delivery tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    setActionLoading(true);
    try {
      await volunteerService.updateStatus(taskId, newStatus);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignSelf = async (taskId) => {
    setActionLoading(true);
    try {
      await volunteerService.assignToSelf(taskId);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim task.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Volunteer Delivery Tasks</h1>
          <p style={{ color: '#718096' }}>
            Coordinate surplus food pickups from donors and drop-offs to NGOs
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner message="Fetching delivery tasks..." />
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <h3>No delivery tasks assigned yet.</h3>
          <p>Once a donor approves a food request, tasks will appear here.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Food Item</th>
                  <th>Quantity</th>
                  <th>Pickup Address</th>
                  <th>Volunteer</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>#{task.id}</td>
                    <td>
                      <strong>
                        {task.request?.donation?.foodName || 'Food Item'}
                      </strong>
                    </td>
                    <td>{task.request?.requestedQuantity || '—'} units</td>
                    <td>{task.request?.donation?.pickupAddress || 'Address not listed'}</td>
                    <td>{task.volunteer ? task.volunteer.name : 'Unassigned'}</td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td>
                      <div className="row">
                        {!task.volunteer && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAssignSelf(task.id)}
                            disabled={actionLoading}
                          >
                            Claim Task
                          </button>
                        )}

                        {task.volunteer?.email === user?.email && task.status === 'ASSIGNED' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUpdateStatus(task.id, 'PICKED_UP')}
                            disabled={actionLoading}
                          >
                            Mark Picked Up
                          </button>
                        )}

                        {task.volunteer?.email === user?.email && task.status === 'PICKED_UP' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleUpdateStatus(task.id, 'DELIVERED')}
                            disabled={actionLoading}
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </td>
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
