import { useEffect, useState } from 'react';
import api from '../services/api';

interface Ticket {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdBy: { name: string; email: string };
  assignedTo?: { name: string; email: string } | null;
  asset?: { name: string; serialNumber: string } | null;
  resolutionNotes?: string;
  createdAt: string;
}

function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Recherche et filtres
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

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/tickets', { title, description, priority });
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setShowForm(false);
      fetchTickets();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create ticket');
    }
  };

  const handleAssignToMe = async (ticketId: string) => {
    try {
      await api.put(`/tickets/${ticketId}/assign`);
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign ticket');
    }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    try {
      await api.put(`/tickets/${ticketId}/status`, { status });
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await api.delete(`/tickets/${ticketId}`);
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete ticket');
    }
  };

  const priorityColor: Record<string, string> = {
    Low: '#94a3b8',
    Medium: '#3b82f6',
    High: '#f97316',
    Urgent: '#ef4444',
  };

  const statusColor: Record<string, string> = {
    Open: '#f97316',
    'In Progress': '#3b82f6',
    Resolved: '#22c55e',
    Closed: '#94a3b8',
  };

  // Applique la recherche + les filtres
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Maintenance Tickets</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 15px' }}>
          {showForm ? 'Cancel' : '+ New Ticket'}
        </button>
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
            <label>Title</label>
            <br />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Laptop won't turn on"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Description</label>
            <br />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Priority</label>
            <br />
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          {formError && <p style={{ color: 'red' }}>{formError}</p>}
          <button type="submit" style={{ padding: '10px 15px' }}>Submit Ticket</button>
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
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', flex: '1', minWidth: '200px' }}
        />

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px' }}>
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ padding: '8px' }}>
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>

        {(searchTerm || filterStatus !== 'All' || filterPriority !== 'All') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('All');
              setFilterPriority('All');
            }}
            style={{ padding: '8px 12px' }}
          >
            Clear filters
          </button>
        )}
      </div>

      <p style={{ color: '#64748b', fontSize: '14px' }}>
        {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} found
      </p>

      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTickets.length === 0 && <p>No tickets match your search/filters.</p>}

        {filteredTickets.map((ticket) => (
          <div
            key={ticket._id}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '15px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ margin: 0 }}>{ticket.title}</h3>
                <p style={{ margin: '5px 0', color: '#64748b' }}>{ticket.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: priorityColor[ticket.priority],
                    color: 'white',
                    fontSize: '12px',
                  }}
                >
                  {ticket.priority}
                </span>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: statusColor[ticket.status],
                    color: 'white',
                    fontSize: '12px',
                  }}
                >
                  {ticket.status}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '10px' }}>
              Created by {ticket.createdBy?.name} on {new Date(ticket.createdAt).toLocaleDateString()}
              {ticket.assignedTo && ` — Assigned to ${ticket.assignedTo.name}`}
            </p>

            {ticket.resolutionNotes && (
              <p style={{ fontSize: '13px', backgroundColor: '#f1f5f9', padding: '8px', borderRadius: '6px' }}>
                <strong>Resolution:</strong> {ticket.resolutionNotes}
              </p>
            )}

            {canManage && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {!ticket.assignedTo && (
                  <button onClick={() => handleAssignToMe(ticket._id)}>Assign to me</button>
                )}

                {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                  <button onClick={() => handleStatusChange(ticket._id, 'Resolved')}>
                    Mark as Resolved
                  </button>
                )}

                {ticket.status !== 'Closed' && (
                  <button onClick={() => handleStatusChange(ticket._id, 'Closed')}>
                    Close
                  </button>
                )}

                {user?.role === 'Admin' && (
                  <button onClick={() => handleDelete(ticket._id)} style={{ color: 'red' }}>
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