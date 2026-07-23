import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
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
  Laptop: '#3b82f6', Desktop: '#8b5cf6', Monitor: '#06b6d4',
  Printer: '#f59e0b', Phone: '#22c55e', Other: '#94a3b8',
};
const STATUS_COLORS: Record<string, string> = {
  Available: '#22c55e', Assigned: '#3b82f6', 'Under Maintenance': '#f59e0b', Retired: '#94a3b8',
};
const TICKET_STATUS_COLORS: Record<string, string> = {
  Open: '#f97316', 'In Progress': '#3b82f6', Resolved: '#22c55e', Closed: '#94a3b8',
};
const statusBadge: Record<string, string> = {
  Available: 'bg-green-100 text-green-700',
  Assigned: 'bg-blue-100 text-blue-700',
};

function Dashboard() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdminOrTech = user?.role === 'Admin' || user?.role === 'Technician';
  return isAdminOrTech ? <AdminDashboard /> : <EmployeeDashboard />;
}

function AdminDashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [a, e, t] = await Promise.all([api.get('/assets'), api.get('/employees'), api.get('/tickets')]);
        setAssets(a.data);
        setEmployeeCount(e.data.length);
        setTickets(t.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="text-slate-500">Loading...</p>;

  const categoryData = Object.entries(
    assets.reduce((acc: Record<string, number>, a) => { acc[a.category] = (acc[a.category] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const statusData = Object.entries(
    assets.reduce((acc: Record<string, number>, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const ticketStatusData = Object.entries(
    tickets.reduce((acc: Record<string, number>, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const openTicketsCount = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your organization's assets and tickets</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Assets" value={assets.length} color="#3b82f6" />
        <StatCard label="Total Employees" value={employeeCount} color="#8b5cf6" />
        <StatCard label="Total Tickets" value={tickets.length} color="#f59e0b" />
        <StatCard label="Open/In Progress" value={openTicketsCount} color="#ef4444" />
      </div>

      <div className="grid grid-cols-2 gap-5 mt-6">
        <ChartCard title="Assets by Category">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {categoryData.map((e, i) => <Cell key={i} fill={CATEGORY_COLORS[e.name] || '#cbd5e1'} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Assets by Status">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" stroke="#475569" fontSize={12} />
              <YAxis allowDecimals={false} stroke="#475569" fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusData.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e.name] || '#cbd5e1'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tickets by Status">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ticketStatusData}>
              <XAxis dataKey="name" stroke="#475569" fontSize={12} />
              <YAxis allowDecimals={false} stroke="#475569" fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {ticketStatusData.map((e, i) => <Cell key={i} fill={TICKET_STATUS_COLORS[e.name] || '#cbd5e1'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

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
          setMyAssets(assetsRes.data.filter((a: Asset) => a.assignedTo?._id === myEmployeeId));
        } catch {
          setMyAssets([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="text-slate-500">Loading...</p>;

  const openTicketsCount = myTickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length;
  const resolvedTicketsCount = myTickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Your assets and support tickets</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="My Assigned Assets" value={myAssets.length} color="#3b82f6" />
        <StatCard label="My Tickets" value={myTickets.length} color="#f59e0b" />
        <StatCard label="Open Tickets" value={openTicketsCount} color="#ef4444" />
        <StatCard label="Resolved Tickets" value={resolvedTicketsCount} color="#22c55e" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">My Assigned Assets</h3>
        </div>
        {myAssets.length === 0 ? (
          <p className="text-slate-400 text-sm px-5 py-6">No assets assigned to you yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-2 font-semibold text-slate-700">Name</th>
                <th className="px-5 py-2 font-semibold text-slate-700">Category</th>
                <th className="px-5 py-2 font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {myAssets.map((a) => (
                <tr key={a._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-900 font-medium">{a.name}</td>
                  <td className="px-5 py-3 text-slate-700">{a.category}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadge[a.status] || 'bg-slate-100 text-slate-600'}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">My Recent Tickets</h3>
        </div>
        {myTickets.length === 0 ? (
          <p className="text-slate-400 text-sm px-5 py-6">You haven't created any tickets yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-2 font-semibold text-slate-700">Title</th>
                <th className="px-5 py-2 font-semibold text-slate-700">Priority</th>
                <th className="px-5 py-2 font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {myTickets.slice(0, 5).map((t) => (
                <tr key={t._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-900 font-medium">{t.title}</td>
                  <td className="px-5 py-3 text-slate-700">{t.priority}</td>
                  <td className="px-5 py-3 text-slate-700">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5" style={{ borderLeft: `4px solid ${color}` }}>
      <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
      <p className="text-slate-500 text-sm mt-1">{label}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      {children}
    </div>
  );
}

export default Dashboard;