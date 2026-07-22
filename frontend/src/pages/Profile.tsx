import { useEffect, useState } from 'react';
import api from '../services/api';

interface EmployeeProfile {
  department?: string;
  position?: string;
  phone?: string;
}

function Profile() {
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const [name, setName] = useState(currentUser?.name || '');
  const [email] = useState(currentUser?.email || '');
  const [role] = useState(currentUser?.role || '');

  const [hasEmployeeProfile, setHasEmployeeProfile] = useState(false);
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchEmployeeProfile = async () => {
    try {
      const response = await api.get<EmployeeProfile>('/employees/me');
      setHasEmployeeProfile(true);
      setDepartment(response.data.department || '');
      setPosition(response.data.position || '');
      setPhone(response.data.phone || '');
    } catch (err) {
      setHasEmployeeProfile(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const userRes = await api.put('/auth/profile', { name });
      localStorage.setItem('user', JSON.stringify(userRes.data));

      if (hasEmployeeProfile) {
        await api.put('/employees/me', { department, position, phone });
      }

      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: '500px' }}>
      <h1>My Profile</h1>

      <form onSubmit={handleSave} style={{ marginTop: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Full Name</label>
          <br />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Email (cannot be changed)</label>
          <br />
          <input value={email} disabled style={{ width: '100%', padding: '8px', backgroundColor: '#e2e8f0' }} />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Role (cannot be changed)</label>
          <br />
          <input value={role} disabled style={{ width: '100%', padding: '8px', backgroundColor: '#e2e8f0' }} />
        </div>

        {hasEmployeeProfile ? (
          <>
            <div style={{ marginBottom: '10px' }}>
              <label>Department</label>
              <br />
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Position</label>
              <br />
              <input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Phone</label>
              <br />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
          </>
        ) : (
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>
            Your employee profile hasn't been set up by an Admin yet. Contact your Admin.
          </p>
        )}

        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" style={{ padding: '10px 20px' }}>
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default Profile;