import { useEffect, useState } from 'react';
import api from '../services/api';

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

function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Recherche et filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Formulaire de création
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Laptop');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [formError, setFormError] = useState('');

  // Formulaire d'édition
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

  // Applique la recherche + les filtres sur la liste
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'All' || asset.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Assets</h1>
        {canManage && (
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 15px' }}>
            {showForm ? 'Cancel' : '+ Add Asset'}
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
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            <label>Name</label>
            <br />
            <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Category</label>
            <br />
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              <option value="Laptop">Laptop</option>
              <option value="Desktop">Desktop</option>
              <option value="Monitor">Monitor</option>
              <option value="Printer">Printer</option>
              <option value="Phone">Phone</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Serial Number</label>
            <br />
            <input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Location</label>
            <br />
            <input value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          {formError && <p style={{ color: 'red' }}>{formError}</p>}
          <button type="submit" style={{ padding: '10px 15px' }}>Create Asset</button>
        </form>
      )}

      {/* Barre de recherche et filtres */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginTop: '20px',
          marginBottom: '10px',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="text"
          placeholder="Search by name or serial number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', flex: '1', minWidth: '200px' }}
        />

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '8px' }}>
          <option value="All">All Categories</option>
          <option value="Laptop">Laptop</option>
          <option value="Desktop">Desktop</option>
          <option value="Monitor">Monitor</option>
          <option value="Printer">Printer</option>
          <option value="Phone">Phone</option>
          <option value="Other">Other</option>
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px' }}>
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
            style={{ padding: '8px 12px' }}
          >
            Clear filters
          </button>
        )}
      </div>

      <p style={{ color: '#64748b', fontSize: '14px' }}>
        {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} found
      </p>

      <datalist id="employee-list">
        {employees.map((emp) => (
          <option key={emp._id} value={`${emp.firstName} ${emp.lastName}`} />
        ))}
      </datalist>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '10px' }}>Name</th>
            <th style={{ padding: '10px' }}>Category</th>
            <th style={{ padding: '10px' }}>Serial Number</th>
            <th style={{ padding: '10px' }}>Status</th>
            <th style={{ padding: '10px' }}>Assigned To</th>
            {canManage && <th style={{ padding: '10px' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredAssets.map((asset) => (
            <tr key={asset._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              {editingAssetId === asset._id ? (
                <>
                  <td style={{ padding: '10px' }}>
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </td>
                  <td style={{ padding: '10px' }}>{asset.category}</td>
                  <td style={{ padding: '10px' }}>{asset.serialNumber}</td>
                  <td style={{ padding: '10px' }}>{asset.status}</td>
                  <td style={{ padding: '10px' }}>
                    <input
                      list="employee-list"
                      value={editAssignedToInput}
                      onChange={(e) => handleAssignedToInputChange(e.target.value)}
                      placeholder="Search employee or leave empty"
                      style={{ width: '100%', padding: '6px' }}
                    />
                  </td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleSaveEdit(asset)}>Save</button>
                    <button onClick={() => setEditingAssetId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ padding: '10px' }}>{asset.name}</td>
                  <td style={{ padding: '10px' }}>{asset.category}</td>
                  <td style={{ padding: '10px' }}>{asset.serialNumber}</td>
                  <td style={{ padding: '10px' }}>{asset.status}</td>
                  <td style={{ padding: '10px' }}>
                    {asset.assignedTo ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}` : '-'}
                  </td>
                  {canManage && (
                    <td style={{ padding: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button onClick={() => startEdit(asset)}>Edit</button>
                      {isAdmin && (
                        <button onClick={() => handleDelete(asset._id)} style={{ color: 'red' }}>
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
        <p style={{ marginTop: '20px', color: '#94a3b8' }}>No assets match your search/filters.</p>
      )}
    </div>
  );
}

export default Assets;