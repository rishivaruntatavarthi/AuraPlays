import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const city = searchParams.get('city') || '';
    const sport = searchParams.get('sport') || '';
    
    api.get(`/courts/search?city=${city}&sport=${sport}`)
      .then(res => setCourts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Search Results</h2>
      {loading ? (
        <p>Loading...</p>
      ) : courts.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {courts.map(court => (
            <div key={court.id} style={{ backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'transform 0.2s' }}
                 onClick={() => navigate(`/courts/${court.id}`)}>
              <div style={{ height: '200px', backgroundColor: 'var(--bg-secondary)', backgroundImage: `url(${court.images?.[0]?.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{court.name}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{court.city}, {court.state}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500', color: 'var(--accent)' }}>{court.sportType}</span>
                  <span style={{ fontWeight: '600' }}>₹{court.pricePerHour}/hr</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No courts match your search criteria.</p>
      )}
    </div>
  );
};

export default Search;
