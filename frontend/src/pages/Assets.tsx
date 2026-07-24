import { useEffect, useState } from 'react';
import api from '../services/api';
import { exportToPdf } from '../utils/pdfExport';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Asset {
  _id: string;
  name: string;
  category: string;
  serialNumber: string;
  status: string;
  location?: string;
  assignedTo?: { _id: string; firstName: string; lastName: string } | null;
}

const statusStyles: Record<string, string> = {
  Available: 'bg-green-100 text-green-700',
  Assigned: 'bg-blue-100 text-blue-700',
  'Under Maintenance': 'bg-amber-100 text-amber-700',
  Retired: 'bg-slate-100 text-slate-600',
};

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Laptop');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [formError, setFormError] = useState('');

  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAssignedToInput, setEditAssignedToInput] = useState('');
  const [editAssignedToId, setEditAssignedToId] = useState('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const canManage = user?.role === 'Admin' || user?.role === 'Technician';
  const isAdmin = user?.role === 'Admin';

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to load employees', err);
    }
  };

  useEffect(() => {
    fetchAssets();
    if (canManage) fetchEmployees();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/assets', { name, category, serialNumber, location });
      setName('');
      setSerialNumber('');
      setLocation('');
      setShowForm(false);
      fetchAssets();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create asset');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await api.delete(`/assets/${id}`);
      fetchAssets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete asset');
    }
  };

  const startEdit = (asset: Asset) => {
    setEditingAssetId(asset._id);
    setEditName(asset.name);
    if (asset.assignedTo) {
      setEditAssignedToInput(`${asset.assignedTo.firstName} ${asset.assignedTo.lastName}`);
      setEditAssignedToId(asset.assignedTo._id);
    } else {
      setEditAssignedToInput('');
      setEditAssignedToId('');
    }
  };

  const handleAssignedToInputChange = (value: string) => {
    setEditAssignedToInput(value);
    const match = employees.find((emp) => `${emp.firstName} ${emp.lastName}` === value);
    setEditAssignedToId(match ? match._id : '');
  };

  const handleSaveEdit = async (asset: Asset) => {
    try {
      if (editName !== asset.name) {
        await api.put(`/assets/${asset._id}`, { name: editName });
      }

      const currentAssignedId = asset.assignedTo?._id || '';

      if (editAssignedToId !== currentAssignedId) {
        if (!editAssignedToId && currentAssignedId) {
          const res = await api.get(`/assignments/asset/${asset._id}`);
          const active = res.data.find((a: any) => a.status === 'Active');
          if (active) await api.put(`/assignments/${active._id}/return`);
        }

        if (editAssignedToId && currentAssignedId) {
          const res = await api.get(`/assignments/asset/${asset._id}`);
          const active = res.data.find((a: any) => a.status === 'Active');
          if (active) await api.put(`/assignments/${active._id}/return`);
          await api.post('/assignments', { asset: asset._id, employee: editAssignedToId });
        }

        if (editAssignedToId && !currentAssignedId) {
          await api.post('/assignments', { asset: asset._id, employee: editAssignedToId });
        }
      }

      setEditingAssetId(null);
      fetchAssets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save changes');
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || asset.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExportPdf = () => {
    exportToPdf({
      title: 'Assets Report',
      columns: ['Name', 'Category', 'Serial Number', 'Status', 'Assigned To'],
      rows: filteredAssets.map((asset) => [
        asset.name,
        asset.category,
        asset.serialNumber,
        asset.status,
        asset.assignedTo ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}` : '-',
      ]),
      fileName: `assets-report-${new Date().toISOString().split('T')[0]}.pdf`,
    });
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assets</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your company equipment</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPdf}
            className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            📄 Export PDF
          </button>
          {canManage && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {showForm ? 'Cancel' : '+ Add Asset'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-4 mb-6 grid grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop</option>
              <option value="Monitor">Monitor</option>
              <option value="Printer">Printer</option>
              <option value="Phone">Phone</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
            <input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
          </div>
          {formError && (
            <div className="col-span-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
              {formError}
            </div>
          )}
          <div className="col-span-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Create Asset
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-3 mt-6 mb-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or serial number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`${inputClass} flex-1 min-w-[220px]`}
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={inputClass + ' w-auto'}>
          <option value="All">All Categories</option>
          <option value="Laptop">Laptop</option>
          <option value="Desktop">Desktop</option>
          <option value="Monitor">Monitor</option>
          <option value="Printer">Printer</option>
          <option value="Phone">Phone</option>
          <option value="Other">Other</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClass + ' w-auto'}>
          <option value="All">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Retired">Retired</option>
        </select>
        {(searchTerm || filterCategory !== 'All' || filterStatus !== 'All') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('All');
              setFilterStatus('All');
            }}
            className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-slate-500 text-sm mb-3">
        {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} found
      </p>

      <datalist id="employee-list">
        {employees.map((emp) => (
          <option key={emp._id} value={`${emp.firstName} ${emp.lastName}`} />
        ))}
      </datalist>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 font-semibold text-slate-700">Name</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Category</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Serial Number</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Assigned To</th>
              {canManage && <th className="px-4 py-3 font-semibold text-slate-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset) => (
              <tr key={asset._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                {editingAssetId === asset._id ? (
                  <>
                    <td className="px-4 py-2">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                    </td>
                    <td className="px-4 py-2 text-slate-700">{asset.category}</td>
                    <td className="px-4 py-2 text-slate-700">{asset.serialNumber}</td>
                    <td className="px-4 py-2 text-slate-700">{asset.status}</td>
                    <td className="px-4 py-2">
                      <input
                        list="employee-list"
                        value={editAssignedToInput}
                        onChange={(e) => handleAssignedToInputChange(e.target.value)}
                        placeholder="Search employee..."
                        className={inputClass}
                      />
                    </td>
                    <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleSaveEdit(asset)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAssetId(null)}
                        className="border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-slate-900 font-medium">{asset.name}</td>
                    <td className="px-4 py-3 text-slate-700">{asset.category}</td>
                    <td className="px-4 py-3 text-slate-700">{asset.serialNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[asset.status] || 'bg-slate-100 text-slate-600'}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {asset.assignedTo ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}` : '-'}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 space-x-3 whitespace-nowrap">
                        <button
                          onClick={() => startEdit(asset)}
                          className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(asset._id)}
                            className="text-red-600 hover:text-red-800 font-medium cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAssets.length === 0 && (
          <p className="text-center text-slate-400 py-8">No assets match your search/filters.</p>
        )}
      </div>
    </div>
  );
}

export default Assets;