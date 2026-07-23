import { useEffect, useState } from 'react';
import api from '../services/api';

interface User { _id: string; name: string; email: string; role: string; }
interface Employee {
  _id: string; firstName: string; lastName: string; email: string;
  department?: string; position?: string; phone?: string; status: string;
}
const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

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
    try { const response = await api.get('/auth/users'); setUsers(response.data); }
    catch (err) { console.error(err); }
  };

  useEffect(() => { fetchEmployees(); if (isAdmin) fetchUsers(); }, []);

  const employeeEmails = employees.map((e) => e.email);
  const availableUsers = users.filter((u) => !employeeEmails.includes(u.email));

  const resetForm = () => { setSelectedUserId(''); setDepartment(''); setPosition(''); setPhone(''); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const selectedUser = users.find((u) => u._id === selectedUserId);
    if (!selectedUser) { setFormError('Please select a user'); return; }
    const nameParts = selectedUser.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || nameParts[0];
    try {
      await api.post('/employees', { firstName, lastName, email: selectedUser.email, department, position, phone });
      resetForm(); setShowForm(false); fetchEmployees();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create employee');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try { await api.delete(`/employees/${id}`); fetchEmployees(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed to delete employee'); }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-500 text-sm mt-1">Manage employee records</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer">
            {showForm ? 'Cancel' : '+ Add Employee'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-4 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select existing account (User)</label>
            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required className={inputClass}>
              <option value="">-- Choose a user --</option>
              {availableUsers.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email}) - {u.role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
            <input value={position} onChange={(e) => setPosition(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>
          {formError && <div className="col-span-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{formError}</div>}
          <div className="col-span-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors cursor-pointer">
              Create Employee
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Email</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Department</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Position</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
              {isAdmin && <th className="px-4 py-3 font-semibold text-slate-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-900 font-medium">{emp.firstName} {emp.lastName}</td>
                <td className="px-4 py-3 text-slate-700">{emp.email}</td>
                <td className="px-4 py-3 text-slate-700">{emp.department || '-'}</td>
                <td className="px-4 py-3 text-slate-700">{emp.position || '-'}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">{emp.status}</span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(emp._id)} className="text-red-600 hover:text-red-800 font-medium cursor-pointer">
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Employees;