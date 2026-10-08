import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationService } from '../services/donationService';
import ErrorMessage from '../components/ErrorMessage';

export default function AddDonation() {
  const [formData, setFormData] = useState({
    foodName: '',
    foodCategory: 'Prepared Meals',
    quantity: '',
    description: '',
    pickupAddress: '',
    availableUntil: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await donationService.create({
        ...formData,
        quantity: parseInt(formData.quantity, 10),
      });
      navigate('/donations');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).join(', ') : null) ||
        'Failed to create donation.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Post Surplus Food Donation</h1>
      </div>

      <ErrorMessage message={error} />

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="foodName">Food Name *</label>
            <input
              id="foodName"
              name="foodName"
              type="text"
              required
              placeholder="e.g. Fresh Vegetable Biryani"
              value={formData.foodName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="foodCategory">Category *</label>
            <select
              id="foodCategory"
              name="foodCategory"
              value={formData.foodCategory}
              onChange={handleChange}
            >
              <option value="Prepared Meals">Prepared Meals</option>
              <option value="Bakery & Bread">Bakery & Bread</option>
              <option value="Fruits & Vegetables">Fruits & Vegetables</option>
              <option value="Dairy Products">Dairy Products</option>
              <option value="Packaged Foods">Packaged Foods</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity (portions / kg) *</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              required
              placeholder="e.g. 25"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="pickupAddress">Pickup Address *</label>
            <input
              id="pickupAddress"
              name="pickupAddress"
              type="text"
              required
              placeholder="e.g. 12 Green Park, Community Center"
              value={formData.pickupAddress}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="availableUntil">Available Until *</label>
            <input
              id="availableUntil"
              name="availableUntil"
              type="datetime-local"
              required
              value={formData.availableUntil}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Additional Notes / Allergen Info</label>
            <textarea
              id="description"
              name="description"
              placeholder="e.g. Packed hygienically, vegetarian, freshly prepared today at 1 PM."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="row" style={{ marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/donations')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Donation...' : 'Publish Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
