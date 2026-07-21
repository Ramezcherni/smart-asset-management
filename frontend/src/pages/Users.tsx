import { useEffect, useState } from 'react';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      // Met à jour la liste localement sans refaire un appel complet
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>User Management</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '10px' }}>Name</th>
            <th style={{ padding: '10px' }}>Email</th>
            <th style={{ padding: '10px' }}>Role</th>
            <th style={{ padding: '10px' }}>Change Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px' }}>{user.name}</td>
              <td style={{ padding: '10px' }}>{user.email}</td>
              <td style={{ padding: '10px' }}>{user.role}</td>
              <td style={{ padding: '10px' }}>
                <select
                  value={user.role}
                  disabled={updatingId === user._id}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                >
                  <option value="Employee">Employee</option>
                  <option value="Technician">Technician</option>
                  <option value="Admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Users;