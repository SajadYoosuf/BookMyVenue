import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchVenues } from '../api/api';
import './VenueListing.css';

export default function VenueListing() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxPrice, setMaxPrice] = useState(500000);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('useEffect triggered');
    setLoading(true);
    const filters = {};
    if (selectedCategory !== 'all') filters.category = selectedCategory;
    filters.max_price = maxPrice;

    console.log('Fetching with filters:', filters);  
    fetchVenues(filters)
      .then(data => {
        console.log('API response:', data); 
        if (Array.isArray(data)) {
          setVenues(data);
        } else {
          setError('Failed to load venues.');
        }
        setLoading(false);
      })
      .catch(() => {
        console.log('Fetch error:', err);
        setError('Could not connect to server.');
        setLoading(false);
      });
  }, [selectedCategory, maxPrice]);

  return (
    <div className="listing-page-container">

      <aside className="filter-sidebar">
        <h3>Filter Spaces</h3>

        <div className="filter-group">
          <label className="filter-label">Event Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="wedding">Weddings</option>
            <option value="corporate">Meetings & Corporate</option>
            <option value="party">Parties & Galas</option>
            <option value="workshop">Workshops</option>
          </select>
        </div>

        <div className="filter-group">
          <div className="price-label-row">
            <label className="filter-label">Max Hourly Price</label>
            <span className="price-display">₹{maxPrice}/hr</span>
          </div>
          <input
            type="range" min="1000" max="500000" step="100"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="price-slider"
          />
        </div>
      </aside>

      <main className="results-container">
        <div className="results-header">
          <h2>Available Venues</h2>
          <p>{venues.length} spaces found</p>
        </div>

        {loading ? (
          <p>Loading venues...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : venues.length === 0 ? (
          <div className="no-results">
            <p>No venues match your filters. Try adjusting!</p>
          </div>
        ) : (
          <div className="listing-grid">
            {venues.map((venue) => (
              <div
                key={venue.venueID}
                className="listing-card"
                onClick={() => navigate(`/book?venueId=${venue.venueID}`)}
              >
                <div className="listing-details">
                  <div className="listing-title-row">
                    <h4>{venue.name}</h4>
                    <span className="listing-price">₹{venue.price}/hr</span>
                  </div>
                  <p className="listing-location">📍 {venue.location}</p>
                  <p>{venue.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  );
}