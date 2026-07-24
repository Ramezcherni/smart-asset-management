import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isAdmin = user?.role === 'Admin';
  const isTechnicianOrAdmin = user?.role === 'Admin' || user?.role === 'Technician';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊', show: true },
    { to: '/assets', label: 'Assets', icon: '💻', show: true },
    { to: '/tickets', label: 'Tickets', icon: '🎫', show: true },
    { to: '/employees', label: 'Employees', icon: '👥', show: isTechnicianOrAdmin },
    { to: '/users', label: 'Users', icon: '🔑', show: isAdmin },
    { to: '/audit-logs', label: 'Audit Logs', icon: '📋', show: isAdmin },
    { to: '/profile', label: 'My Profile', icon: '⚙️', show: true },
  ];

  const roleBadgeColor: Record<string, string> = {
    Admin: 'bg-purple-100 text-purple-700',
    Technician: 'bg-blue-100 text-blue-700',
    Employee: 'bg-green-100 text-green-700',
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="px-6 py-6 border-b border-slate-800">
          <h1 className="text-lg font-bold tracking-tight">Smart Asset Mgmt</h1>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${
                  roleBadgeColor[user?.role] || 'bg-slate-100 text-slate-700'
                }`}
              >
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-sm bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;