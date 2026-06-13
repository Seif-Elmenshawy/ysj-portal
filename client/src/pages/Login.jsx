import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, login, loading } = useAuth();
  const [loader, setLoader] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    // If already signed in, redirect to home
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLoader(true);

    try {
      const user = await login(formData.email, formData.password);
      // Redirect based on role
      const dashboardMap = {
        applicant: '/applicant-dashboard',
        admin: '/admin-dashboard',
        reviewer: '/reviewer-dashboard'
      };
      navigate(dashboardMap[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setSubmitting(false);
      setLoader(false);
    }
  };

  return (
    <div className="page-enter" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div className="card">
        <div className="card-header">
          <h2><i className="fas fa-sign-in-alt"></i> Login</h2>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Login'}
              
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
            <p><Link to="/reset-password">Forgot your password?</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
