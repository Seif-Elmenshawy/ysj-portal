import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submittedCount, setSubmittedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/users/admin/stats');
      setSubmittedCount(response.data.submittedApplications);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Access Denied: Admin only');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  if (user?.role !== 'admin') {
    return (
      <div className="page-enter">
        <div className="card">
          <div className="card-header">
            <h2 style={{ color: 'red' }}>Access Denied</h2>
          </div>
          <div className="card-body">
            <p>You do not have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="card">
        <div className="card-header">
          <h1><i className="fas fa-shield-alt"></i> Admin Panel</h1>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              minWidth: '300px'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '15px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Applications Submitted
              </div>
              <div style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: '#2196F3',
                margin: '20px 0'
              }}>
                {submittedCount}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#999'
              }}>
                Total submitted applications
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
