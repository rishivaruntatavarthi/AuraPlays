import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    api.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id) => {
    try {
      await api.put(`/admin/users/${id}/status`);
      fetchUsers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Manage Users</h2>
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>{user.name}</td>
                <td style={{ padding: '1rem' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>{user.role}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ color: user.active ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => toggleStatus(user.id)} className="btn btn-outline">
                    {user.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
