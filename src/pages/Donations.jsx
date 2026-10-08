import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { donationService } from '../services/donationService';
import { requestService } from '../services/requestService';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Donations() {
  const { user, role } = useAuth();
  const [donations, setDonations] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);
  const [sortBy, setSortBy] = useState('createdAt');
  const [direction, setDirection] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit Modal State
  const [editItem, setEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    foodName: '',
    foodCategory: '',
    quantity: '',
    description: '',
    pickupAddress: '',
    availableUntil: '',
  });

  // Delete Modal State
  const [deleteItem, setDeleteItem] = useState(null);

  // Request Food Modal State (for NGO)
  const [requestItem, setRequestItem] = useState(null);
  const [requestQty, setRequestQty] = useState('');
  const [requestMsg, setRequestMsg] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, [currentPage, sortBy, direction, role]);

  const fetchDonations = async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (role === 'DONOR') {
        // If donor wants paginated view of their own, or we can fetch all or paged
        res = await donationService.getAll(currentPage, pageSize, sortBy, direction);
      } else if (role === 'NGO') {
        res = await donationService.getAvailable(currentPage, pageSize, sortBy, direction);
      } else {
        res = await donationService.getAll(currentPage, pageSize, sortBy, direction);
      }
      setDonations(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      setError('Failed to fetch donations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setDirection('asc');
    }
    setCurrentPage(0);
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditItem(item);
    setEditFormData({
      foodName: item.foodName,
      foodCategory: item.foodCategory,
      quantity: item.quantity,
      description: item.description || '',
      pickupAddress: item.pickupAddress,
      availableUntil: item.availableUntil ? item.availableUntil.substring(0, 16) : '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await donationService.update(editItem.id, {
        ...editFormData,
        quantity: parseInt(editFormData.quantity, 10),
      });
      setEditItem(null);
      fetchDonations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update donation.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setActionLoading(true);
    try {
      await donationService.delete(deleteItem.id);
      setDeleteItem(null);
      fetchDonations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete donation.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Request Food (NGO)
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await requestService.create({
        donationId: requestItem.id,
        requestedQuantity: parseInt(requestQty, 10),
        message: requestMsg,
      });
      setRequestItem(null);
      setRequestQty('');
      setRequestMsg('');
      alert('Request submitted successfully!');
      fetchDonations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request food.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {role === 'NGO' ? 'Available Surplus Food' : 'Food Donations'}
          </h1>
          <p style={{ color: '#718096' }}>
            Sorted by <strong>{sortBy}</strong> ({direction.toUpperCase()})
          </p>
        </div>
        {role === 'DONOR' && (
          <Link to="/add-donation" className="btn btn-primary">
            + Post New Donation
          </Link>
        )}
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner message="Fetching food donations..." />
      ) : donations.length === 0 ? (
        <div className="empty-state">
          <h3>No donations found.</h3>
          <p>Check back later or post a new donation.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('foodName')}>
                    Food Name {sortBy === 'foodName' && (direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Category</th>
                  <th onClick={() => handleSort('quantity')}>
                    Quantity {sortBy === 'quantity' && (direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Address</th>
                  <th onClick={() => handleSort('availableUntil')}>
                    Valid Until {sortBy === 'availableUntil' && (direction === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.foodName}</strong></td>
                    <td>{item.foodCategory}</td>
                    <td>{item.quantity}</td>
                    <td>{item.pickupAddress}</td>
                    <td>
                      {item.availableUntil
                        ? new Date(item.availableUntil).toLocaleString()
                        : 'N/A'}
                    </td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <div className="row">
                        {role === 'DONOR' && item.donor?.email === user?.email && (
                          <>
                            {item.status === 'AVAILABLE' && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => openEditModal(item)}
                              >
                                Edit
                              </button>
                            )}
                            {item.status === 'AVAILABLE' && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => setDeleteItem(item)}
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}

                        {role === 'NGO' && item.status === 'AVAILABLE' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setRequestItem(item);
                              setRequestQty(item.quantity);
                            }}
                          >
                            Request Food
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  className={currentPage === index ? 'active' : ''}
                  onClick={() => setCurrentPage(index)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit Donation Modal */}
      {editItem && (
        <Modal
          title="Edit Donation"
          onClose={() => setEditItem(null)}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditItem(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-form"
                className="btn btn-primary"
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form id="edit-form" onSubmit={handleEditSubmit}>
            <div className="form-group">
              <label>Food Name</label>
              <input
                type="text"
                required
                value={editFormData.foodName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, foodName: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Food Category</label>
              <input
                type="text"
                required
                value={editFormData.foodCategory}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, foodCategory: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={editFormData.quantity}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, quantity: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Pickup Address</label>
              <input
                type="text"
                required
                value={editFormData.pickupAddress}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, pickupAddress: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Available Until</label>
              <input
                type="datetime-local"
                required
                value={editFormData.availableUntil}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, availableUntil: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, description: e.target.value })
                }
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteItem && (
        <Modal
          title="Confirm Delete"
          onClose={() => setDeleteItem(null)}
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteItem(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </>
          }
        >
          <p>
            Are you sure you want to delete the donation <strong>{deleteItem.foodName}</strong>?
            This action cannot be undone.
          </p>
        </Modal>
      )}

      {/* Request Food Modal (NGO) */}
      {requestItem && (
        <Modal
          title={`Request Food: ${requestItem.foodName}`}
          onClose={() => setRequestItem(null)}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRequestItem(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="request-form"
                className="btn btn-primary"
                disabled={actionLoading}
              >
                {actionLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </>
          }
        >
          <form id="request-form" onSubmit={handleRequestSubmit}>
            <div className="form-group">
              <label>Requested Quantity (Available: {requestItem.quantity})</label>
              <input
                type="number"
                min="1"
                max={requestItem.quantity}
                required
                value={requestQty}
                onChange={(e) => setRequestQty(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Note / Message</label>
              <textarea
                placeholder="Mention beneficiary details or pickup preferences..."
                value={requestMsg}
                onChange={(e) => setRequestMsg(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
