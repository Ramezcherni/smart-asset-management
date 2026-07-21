import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assets" element={<h2>Assets page (à construire)</h2>} />
          <Route path="/employees" element={<h2>Employees page (à construire)</h2>} />
          <Route path="/users" element={<Users />} />
        </Route>

        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;