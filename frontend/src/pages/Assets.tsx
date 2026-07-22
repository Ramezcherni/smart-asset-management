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

  // Formulaire de création
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Laptop');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [formError, setFormError] = useState('');

  // Formulaire d'édition (nom + assignation combinés)
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAssignedToInput, setEditAssignedToInput] = useState(''); // texte tapé/affiché
  const [editAssignedToId, setEditAssignedToId] = useState(''); // id réel choisi

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

  // Quand l'utilisateur tape/choisit un nom dans le champ de recherche
  const handleAssignedToInputChange = (value: string) => {
    setEditAssignedToInput(value);
    const match = employees.find((emp) => `${emp.firstName} ${emp.lastName}` === value);
    setEditAssignedToId(match ? match._id : '');
  };

  const handleSaveEdit = async (asset: Asset) => {
    try {
      // 1. Met à jour le nom si besoin
      if (editName !== asset.name) {
        await api.put(`/assets/${asset._id}`, { name: editName });
      }

      const currentAssignedId = asset.assignedTo?._id || '';

      // 2. Gère le changement d'assignation
      if (editAssignedToId !== currentAssignedId) {
        // Cas A : on retire l'assignation (champ vidé)
        if (!editAssignedToId && currentAssignedId) {
          const res = await api.get(`/assignments/asset/${asset._id}`);
          const active = res.data.find((a: any) => a.status === 'Active');
          if (active) await api.put(`/assignments/${active._id}/return`);
        }

        // Cas B : l'asset était déjà assigné à quelqu'un d'autre → on retourne d'abord
        if (editAssignedToId && currentAssignedId) {
          const res = await api.get(`/assignments/asset/${asset._id}`);
          const active = res.data.find((a: any) => a.status === 'Active');
          if (active) await api.put(`/assignments/${active._id}/return`);
          await api.post('/assignments', { asset: asset._id, employee: editAssignedToId });
        }

        // Cas C : l'asset était libre → on assigne directement
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

      {/* Liste des employés pour la recherche (utilisée par le champ Assigned To en édition) */}
      <datalist id="employee-list">
        {employees.map((emp) => (
          <option key={emp._id} value={`${emp.firstName} ${emp.lastName}`} />
        ))}
      </datalist>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
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
          {assets.map((asset) => (
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
    </div>
  );
}

export default Assets;