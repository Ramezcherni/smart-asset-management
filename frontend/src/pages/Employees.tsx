import { useEffect, useState } from 'react';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department?: string;
  position?: string;
  phone?: string;
  status: string;
}

function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isAdmin = currentUser?.role === 'Admin';

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    if (isAdmin) fetchUsers();
  }, []);

  // Exclut les users déjà transformés en fiche Employee (par email)
  const employeeEmails = employees.map((e) => e.email);
  const availableUsers = users.filter((u) => !employeeEmails.includes(u.email));

  const resetForm = () => {
    setSelectedUserId('');
    setDepartment('');
    setPosition('');
    setPhone('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const selectedUser = users.find((u) => u._id === selectedUserId);
    if (!selectedUser) {
      setFormError('Please select a user');
      return;
    }

    const nameParts = selectedUser.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];

    try {
      await api.post('/employees', {
        firstName,
        lastName,
        email: selectedUser.email,
        department,
        position,
        phone,
      });
      resetForm();
      setShowForm(false);
      fetchEmployees();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create employee');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Employees</h1>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 15px' }}>
            {showForm ? 'Cancel' : '+ Add Employee'}
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            backgroundColor: '#f8fafc',
            padding: '20px',
            borderRadius: '8px',
            marginTop: '15px',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Select existing account (User)</label>
            <br />
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">-- Choose a user --</option>
              {availableUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email}) - {u.role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Department</label>
            <br />
            <input value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Position</label>
            <br />
            <input value={position} onChange={(e) => setPosition(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Phone</label>
            <br />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          {formError && <p style={{ color: 'red', gridColumn: '1 / -1' }}>{formError}</p>}
          <button type="submit" style={{ padding: '10px 15px', gridColumn: '1 / -1', width: 'fit-content' }}>
            Create Employee
          </button>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '10px' }}>Name</th>
            <th style={{ padding: '10px' }}>Email</th>
            <th style={{ padding: '10px' }}>Department</th>
            <th style={{ padding: '10px' }}>Position</th>
            <th style={{ padding: '10px' }}>Status</th>
            {isAdmin && <th style={{ padding: '10px' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px' }}>{emp.firstName} {emp.lastName}</td>
              <td style={{ padding: '10px' }}>{emp.email}</td>
              <td style={{ padding: '10px' }}>{emp.department || '-'}</td>
              <td style={{ padding: '10px' }}>{emp.position || '-'}</td>
              <td style={{ padding: '10px' }}>{emp.status}</td>
              {isAdmin && (
                <td style={{ padding: '10px' }}>
                  <button onClick={() => handleDelete(emp._id)} style={{ color: 'red' }}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Employees;