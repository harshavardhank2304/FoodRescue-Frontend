import StatusBadge from './StatusBadge';

export default function DonationCard({ donation, actions }) {
  const until = donation.availableUntil
    ? new Date(donation.availableUntil).toLocaleDateString()
    : 'N/A';

  return (
    <div className="donation-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3>{donation.foodName}</h3>
        <StatusBadge status={donation.status} />
      </div>
      <p>📦 {donation.foodCategory} · {donation.quantity} units</p>
      <p>📍 {donation.pickupAddress}</p>
      {donation.description && <p>📝 {donation.description}</p>}
      <p>⏳ Available until: {until}</p>
      {actions && <div className="donation-card-footer">{actions}</div>}
    </div>
  );
}
