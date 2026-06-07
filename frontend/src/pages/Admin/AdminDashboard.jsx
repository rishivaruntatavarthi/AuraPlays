import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <Link to="/admin/users" style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)', textAlign: 'center', color: 'inherit', textDecoration: 'none' }}>
          <h2>Manage Users</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>View and toggle user status</p>
        </Link>
        <Link to="/admin/courts" style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)', textAlign: 'center', color: 'inherit', textDecoration: 'none' }}>
          <h2>View All Courts</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Monitor all courts on the platform</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
