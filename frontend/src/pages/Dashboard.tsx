import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Asset {
  _id: string;
  name: string;
  category: string;
  status: string;
  assignedTo?: { _id: string } | null;
}

interface Ticket {
  _id: string;
  title: string;
  status: string;
  priority: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Laptop: '#3b82f6',
  Desktop: '#8b5cf6',
  Monitor: '#06b6d4',
  Printer: '#f59e0b',
  Phone: '#22c55e',
  Other: '#94a3b8',
};

const STATUS_COLORS: Record<string, string> = {
  Available: '#22c55e',
  Assigned: '#3b82f6',
  'Under Maintenance': '#f59e0b',
  Retired: '#94a3b8',
};

const TICKET_STATUS_COLORS: Record<string, string> = {
  Open: '#f97316',
  'In Progress': '#3b82f6',
  Resolved: '#22c55e',
  Closed: '#94a3b8',
};

function Dashboard() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdminOrTech = user?.role === 'Admin' || user?.role === 'Technician';

  if (isAdminOrTech) {
    return <AdminDashboard />;
  }
  return <EmployeeDashboard />;
}

// ============ DASHBOARD ADMIN / TECHNICIAN ============
function AdminDashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsRes, employeesRes, ticketsRes] = await Promise.all([
          api.get('/assets'),
          api.get('/employees'),
          api.get('/tickets'),
        ]);
        setAssets(assetsRes.data);
        setEmployeeCount(employeesRes.data.length);
        setTickets(ticketsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p style={{ color: '#1e293b' }}>Loading...</p>;

  const categoryData = Object.entries(
    assets.reduce((acc: Record<string, number>, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const statusData = Object.entries(
    assets.reduce((acc: Record<string, number>, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const ticketStatusData = Object.entries(
    tickets.reduce((acc: Record<string, number>, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const openTicketsCount = tickets.filter(
    (t) => t.status === 'Open' || t.status === 'In Progress'
  ).length;

  return (
    <div style={{ color: '#1e293b' }}>
      <h1 style={{ color: '#1e293b' }}>Dashboard</h1>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
        <StatCard label="Total Assets" value={assets.length} color="#3b82f6" />
        <StatCard label="Total Employees" value={employeeCount} color="#8b5cf6" />
        <StatCard label="Total Tickets" value={tickets.length} color="#f59e0b" />
        <StatCard label="Open/In Progress Tickets" value={openTicketsCount} color="#ef4444" />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginTop: '30px',
        }}
      >
        <ChartCard title="Assets by Category">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={CATEGORY_COLORS[entry.name] || '#cbd5e1'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Assets by Status">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" stroke="#1e293b" />
              <YAxis allowDecimals={false} stroke="#1e293b" />
              <Tooltip />
              <Bar dataKey="value">
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={STATUS_COLORS[entry.name] || '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tickets by Status">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ticketStatusData}>
              <XAxis dataKey="name" stroke="#1e293b" />
              <YAxis allowDecimals={false} stroke="#1e293b" />
              <Tooltip />
              <Bar dataKey="value">
                {ticketStatusData.map((entry, index) => (
                  <Cell key={index} fill={TICKET_STATUS_COLORS[entry.name] || '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ============ DASHBOARD EMPLOYEE ============
function EmployeeDashboard() {
  const [myAssets, setMyAssets] = useState<Asset[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketsRes = await api.get('/tickets');
        setMyTickets(ticketsRes.data);

        try {
          const myProfileRes = await api.get('/employees/me');
          const myEmployeeId = myProfileRes.data._id;

          const assetsRes = await api.get('/assets');
          const filtered = assetsRes.data.filter(
            (a: Asset) => a.assignedTo?._id === myEmployeeId
          );
          setMyAssets(filtered);
        } catch {
          setMyAssets([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p style={{ color: '#1e293b' }}>Loading...</p>;

  const openTicketsCount = myTickets.filter(
    (t) => t.status === 'Open' || t.status === 'In Progress'
  ).length;
  const resolvedTicketsCount = myTickets.filter(
    (t) => t.status === 'Resolved' || t.status === 'Closed'
  ).length;

  return (
    <div style={{ color: '#1e293b' }}>
      <h1 style={{ color: '#1e293b' }}>My Dashboard</h1>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
        <StatCard label="My Assigned Assets" value={myAssets.length} color="#3b82f6" />
        <StatCard label="My Tickets" value={myTickets.length} color="#f59e0b" />
        <StatCard label="Open Tickets" value={openTicketsCount} color="#ef4444" />
        <StatCard label="Resolved Tickets" value={resolvedTicketsCount} color="#22c55e" />
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3 style={{ color: '#1e293b' }}>My Assigned Assets</h3>
        {myAssets.length === 0 ? (
          <p style={{ color: '#64748b' }}>No assets assigned to you yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px', color: '#1e293b' }}>Name</th>
                <th style={{ padding: '10px', color: '#1e293b' }}>Category</th>
                <th style={{ padding: '10px', color: '#1e293b' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {myAssets.map((asset) => (
                <tr key={asset._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', color: '#1e293b' }}>{asset.name}</td>
                  <td style={{ padding: '10px', color: '#1e293b' }}>{asset.category}</td>
                  <td style={{ padding: '10px', color: '#1e293b' }}>{asset.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3 style={{ color: '#1e293b' }}>My Recent Tickets</h3>
        {myTickets.length === 0 ? (
          <p style={{ color: '#64748b' }}>You haven't created any tickets yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px', color: '#1e293b' }}>Title</th>
                <th style={{ padding: '10px', color: '#1e293b' }}>Priority</th>
                <th style={{ padding: '10px', color: '#1e293b' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {myTickets.slice(0, 5).map((ticket) => (
                <tr key={ticket._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', color: '#1e293b' }}>{ticket.title}</td>
                  <td style={{ padding: '10px', color: '#1e293b' }}>{ticket.priority}</td>
                  <td style={{ padding: '10px', color: '#1e293b' }}>{ticket.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============ COMPOSANTS RÉUTILISABLES ============
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        minWidth: '160px',
        borderLeft: `4px solid ${color}`,
      }}
    >
      <h2 style={{ margin: 0, color: '#1e293b' }}>{value}</h2>
      <p style={{ margin: '5px 0 0', color: '#64748b' }}>{label}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
      }}
    >
      <h3 style={{ marginTop: 0, color: '#1e293b' }}>{title}</h3>
      {children}
    </div>
  );
}

export default Dashboard;