import { useEffect, useState } from 'react';
import api from '../services/api';
import { exportToPdf } from '../utils/pdfExport';

interface Ticket {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdBy: { name: string; email: string };
  assignedTo?: { name: string; email: string } | null;
  resolutionNotes?: string;
  createdAt: string;
}

const priorityColor: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-700',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};
const statusColor: Record<string, string> = {
  Open: 'bg-orange-100 text-orange-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-green-100 text-green-700',
  Closed: 'bg-slate-100 text-slate-600',
};
const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [formError, setFormError] = useState('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const canManage = user?.role === 'Admin' || user?.role === 'Technician';

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/tickets', { title, description, priority });
      setTitle(''); setDescription(''); setPriority('Medium'); setShowForm(false);
      fetchTickets();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create ticket');
    }
  };

  const handleAssignToMe = async (id: string) => {
    try { await api.put(`/tickets/${id}/assign`); fetchTickets(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed to assign ticket'); }
  };
  const handleStatusChange = async (id: string, status: string) => {
    try { await api.put(`/tickets/${id}/status`, { status }); fetchTickets(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed to update status'); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try { await api.delete(`/tickets/${id}`); fetchTickets(); }
    catch (err: any) { alert(err.response?.data?.message || 'Failed to delete ticket'); }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleExportPdf = () => {
    exportToPdf({
      title: 'Maintenance Tickets Report',
      columns: ['Title', 'Priority', 'Status', 'Created By', 'Assigned To', 'Date'],
      rows: filteredTickets.map((ticket) => [
        ticket.title,
        ticket.priority,
        ticket.status,
        ticket.createdBy?.name || '-',
        ticket.assignedTo?.name || '-',
        new Date(ticket.createdAt).toLocaleDateString(),
      ]),
      fileName: `tickets-report-${new Date().toISOString().split('T')[0]}.pdf`,
    });
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance Tickets</h1>
          <p className="text-slate-500 text-sm mt-1">Track and resolve equipment issues</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPdf}
            className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            📄 Export PDF
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {showForm ? 'Cancel' : '+ New Ticket'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-4 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Laptop won't turn on" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          {formError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{formError}</div>}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition-colors cursor-pointer">
            Submit Ticket
          </button>
        </form>
      )}

      <div className="flex gap-3 mt-6 mb-3 flex-wrap">
        <input
          type="text" placeholder="Search by title..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`${inputClass} flex-1 min-w-[220px]`}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClass + ' w-auto'}>
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={inputClass + ' w-auto'}>
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
        {(searchTerm || filterStatus !== 'All' || filterPriority !== 'All') && (
          <button
            onClick={() => { setSearchTerm(''); setFilterStatus('All'); setFilterPriority('All'); }}
            className="border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-slate-500 text-sm mb-3">{filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found</p>

      <div className="space-y-3">
        {filteredTickets.length === 0 && <p className="text-slate-400 text-center py-8">No tickets match your search/filters.</p>}

        {filteredTickets.map((ticket) => (
          <div key={ticket._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">{ticket.title}</h3>
                <p className="text-slate-500 text-sm mt-1">{ticket.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${priorityColor[ticket.priority]}`}>{ticket.priority}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[ticket.status]}`}>{ticket.status}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3">
              Created by {ticket.createdBy?.name} on {new Date(ticket.createdAt).toLocaleDateString()}
              {ticket.assignedTo && ` — Assigned to ${ticket.assignedTo.name}`}
            </p>

            {ticket.resolutionNotes && (
              <p className="text-sm bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 mt-3">
                <strong className="text-slate-700">Resolution:</strong> <span className="text-slate-600">{ticket.resolutionNotes}</span>
              </p>
            )}

            {canManage && (
              <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-slate-100">
                {!ticket.assignedTo && (
                  <button onClick={() => handleAssignToMe(ticket._id)} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                    Assign to me
                  </button>
                )}
                {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                  <button onClick={() => handleStatusChange(ticket._id, 'Resolved')} className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                    Mark as Resolved
                  </button>
                )}
                {ticket.status !== 'Closed' && (
                  <button onClick={() => handleStatusChange(ticket._id, 'Closed')} className="text-sm border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                    Close
                  </button>
                )}
                {user?.role === 'Admin' && (
                  <button onClick={() => handleDelete(ticket._id)} className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1.5 cursor-pointer">
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tickets;