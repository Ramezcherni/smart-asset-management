import { useEffect, useState } from 'react';
import api from '../services/api';

interface AuditLog {
  _id: string;
  user: { name: string; email: string; role: string };
  action: string;
  entityType: string;
  details: string;
  createdAt: string;
}

const actionColor: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  UPDATE_ROLE: 'bg-purple-100 text-purple-700',
  UPDATE_STATUS: 'bg-amber-100 text-amber-700',
  ASSIGN: 'bg-cyan-100 text-cyan-700',
};

function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntity, setFilterEntity] = useState('All');

  const fetchLogs = async () => {
    try {
      const response = await api.get('/audit-logs');
      setLogs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const entityTypes = ['All', ...Array.from(new Set(logs.map((l) => l.entityType)))];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = filterEntity === 'All' || log.entityType === filterEntity;
    return matchesSearch && matchesEntity;
  });

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-slate-500 text-sm mt-1">Track all important actions across the system</p>
      </div>

      <div className="flex gap-3 mb-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by user or action..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[220px] px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {entityTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <p className="text-slate-500 text-sm mb-3">
        {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''} found
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 font-semibold text-slate-700">User</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Action</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Entity</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Details</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-900 font-medium">{log.user?.name || 'Unknown'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${actionColor[log.action] || 'bg-slate-100 text-slate-600'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{log.entityType}</td>
                <td className="px-4 py-3 text-slate-600">{log.details}</td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <p className="text-center text-slate-400 py-8">No logs match your search/filters.</p>
        )}
      </div>
    </div>
  );
}

export default AuditLogs;