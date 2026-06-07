import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ManageCourts = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/courts')
      .then(res => setCourts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading courts...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>All Courts</h2>
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Location</th>
              <th style={{ padding: '1rem' }}>Sport</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem' }}>Owner</th>
            </tr>
          </thead>
          <tbody>
            {courts.map(court => (
              <tr key={court.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>{court.name}</td>
                <td style={{ padding: '1rem' }}>{court.city}, {court.state}</td>
                <td style={{ padding: '1rem' }}>{court.sportType}</td>
                <td style={{ padding: '1rem' }}>₹{court.pricePerHour}/hr</td>
                <td style={{ padding: '1rem' }}>{court.owner?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCourts;
