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
  const [saving, setSaving] = useState(false);
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
    setSaving(true);

    try {
      const userRes = await api.put('/auth/profile', { name });
      localStorage.setItem('user', JSON.stringify(userRes.data));

      if (hasEmployeeProfile) {
        await api.put('/employees/me', { department, position, phone });
      }

      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const roleBadgeColor: Record<string, string> = {
    Admin: 'bg-purple-100 text-purple-700',
    Technician: 'bg-blue-100 text-blue-700',
    Employee: 'bg-green-100 text-green-700',
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your personal information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* Header avec avatar */}
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-200">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{name}</p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${roleBadgeColor[role] || 'bg-slate-100 text-slate-700'}`}>
              {role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                value={email}
                disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-500 bg-slate-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <input
                value={role}
                disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-500 bg-slate-50 cursor-not-allowed"
              />
            </div>
          </div>

          {hasEmployeeProfile ? (
            <>
              <div className="pt-4 mt-4 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-700 mb-3">Employee Information</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                  <input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          ) : (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
              Your employee profile hasn't been set up yet. Contact your Admin.
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-3 py-2">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;