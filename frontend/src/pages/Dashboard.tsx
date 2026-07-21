import { useEffect, useState } from 'react';
import api from '../services/api';

function Dashboard() {
  const [assetCount, setAssetCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsRes, employeesRes] = await Promise.all([
          api.get('/assets'),
          api.get('/employees'),
        ]);
        setAssetCount(assetsRes.data.length);
        setEmployeeCount(employeesRes.data.length);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '8px', minWidth: '150px' }}>
          <h3>{assetCount}</h3>
          <p>Total Assets</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '8px', minWidth: '150px' }}>
          <h3>{employeeCount}</h3>
          <p>Total Employees</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;