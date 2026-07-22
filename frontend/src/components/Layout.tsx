import { Link, useNavigate, Outlet } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isAdmin = user?.role === 'Admin';
  const isTechnicianOrAdmin = user?.role === 'Admin' || user?.role === 'Technician';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '220px',
          backgroundColor: '#1e293b',
          color: 'white',
          padding: '20px',
        }}
      >
        <h3>Smart Asset Mgmt</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
          <Link to="/dashboard" style={{ color: 'white' }}>Dashboard</Link>

          <Link to="/assets" style={{ color: 'white' }}>Assets</Link>

          {isTechnicianOrAdmin && (
            <Link to="/employees" style={{ color: 'white' }}>Employees</Link>
          )}

          {isAdmin && (
            <Link to="/users" style={{ color: 'white' }}>Users</Link>
          )}

          <Link to="/profile" style={{ color: 'white' }}>My Profile</Link>
        </nav>

        <div style={{ marginTop: '50px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
          <p>{user?.name}</p>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>{user?.role}</p>
          <button onClick={handleLogout} style={{ marginTop: '10px', padding: '8px 12px' }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main style={{ flex: 1, padding: '30px' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;