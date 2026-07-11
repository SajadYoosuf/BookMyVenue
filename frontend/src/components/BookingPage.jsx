import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchVenueDetail, bookVenue } from '../api/api';
import './BookingPage.css';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const venueId = searchParams.get('venueId');
  const navigate = useNavigate();

  const [venue, setVenue] = useState(null);
  const [date, setDate] = useState('');
  const [hours, setHours] = useState(4);
  const [guestCount, setGuestCount] = useState(50);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch real venue details from Django
  useEffect(() => {
    if (venueId) {
      fetchVenueDetail(venueId).then(data => {
        if (data.venueID) {
          setVenue(data);
        } else {
          setError('Venue not found.');
        }
      });
    } else {
      setError('No venue selected. Please go back and select a venue.');
    }
  }, [venueId]);

  const baseTotal   = venue ? venue.price * hours : 0;
  const serviceFee  = Math.round(baseTotal * 0.08);
  const totalAmount = baseTotal + serviceFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await bookVenue(venueId, date);

      if (data.error) {
        if (data.error === 'Login required') {
          navigate('/login');
          return;
        }
        setError(data.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);

    } catch (err) {
      setError('Booking failed. Please try again.');
    }

    setLoading(false);
  };

  // Loading state while fetching venue
  if (!venue && !error) {
    return <p style={{ padding: '2rem' }}>Loading venue details...</p>;
  }

  return (
    <div className="booking-page-container">

      {/* Left Column */}
      <main className="booking-form-section">
        <h2>Confirm Your Booking</h2>
        <p className="booking-subtitle">
          Fill in your reservation details below.
        </p>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        {success && (
          <p style={{ color: 'green', marginBottom: '1rem' }}>
            Booking confirmed! Redirecting to home...
          </p>
        )}

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-card-section">
            <h3>1. Date & Time</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Event Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (Hours)</label>
                <input
                  type="number"
                  min="2" max="24"
                  value={hours}
                  onChange={(e) => setHours(Math.max(2, Number(e.target.value)))}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expected Guests</label>
                <input
                  type="number"
                  min="1"
                  max={venue ? venue.capacity : 200}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value)))}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-confirm-payment"
            disabled={loading || success}
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </main>

      {/* Right Column — Real Venue Data */}
      <aside className="booking-summary-sidebar">
        <div className="summary-sticky-card">
          <div className="summary-venue-preview">
            <div>
              <h4>{venue?.name}</h4>
              <p>📍 {venue?.location}</p>
              <p>{venue?.category}</p>
              <p>Capacity: {venue?.capacity} guests</p>
            </div>
          </div>

          <div className="pricing-breakdown">
            <h3>Price Summary</h3>
            <div className="pricing-row">
              <span>₹{venue?.price} × {hours} hours</span>
              <span>₹{baseTotal}</span>
            </div>
            <div className="pricing-row">
              <span>Service Fee (8%)</span>
              <span>₹{serviceFee}</span>
            </div>
            <hr className="summary-divider" />
            <div className="pricing-row total-row">
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          <div className="guarantee-badge">
            <span className="shield-icon">🛡️</span>
            <p>
              <strong>BookMyVenue Guarantee.</strong> Your payment is
              kept safe until your event finishes successfully.
            </p>
          </div>
        </div>
      </aside>

    </div>
  );
}