import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ApplicantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const response = await api.get('/application');
      setApplication(response.data);
    } catch (err) {
      console.error('Failed to fetch application');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="spinner"></div>;

  const isApplicationSubmitted = application && application.status && application.status !== 'draft';
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#4CAF50'; // Green
      case 'rejected':
        return '#F44336'; // Red
      case 'under_review':
        return '#2196F3'; // Blue
      case 'pending':
        return '#FFA500'; // Orange
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Main Container */}
      <div className="dashboard-container" style={{ flex: 1, paddingBottom: '0' }}>
        {/* Cover Image */}
        <img 
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=300&fit=crop" 
          alt="Cover" 
          style={{ width: '100%', height: '250px', objectFit: 'cover' }}
        />
        
        {/* Control Head - With logout */}
        <div className="control-head" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderBottom: '2px solid #ddd'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>
            <i className="fas fa-user-circle"></i> Welcome, {user?.username}!
          </h2>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#a31313',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#8a0d0d'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#a31313'}
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>

        {/* Navigation Actions */}
        <div className="actions" style={{
          display: 'flex',
          gap: '0',
          padding: '0',
          borderBottom: '2px solid #ddd'
        }}>
          <Link 
            to="/applicant-dashboard" 
            className="active"
            style={{
              flex: 1,
              padding: '15px',
              textAlign: 'center',
              backgroundColor: '#a31313',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#8a0d0d'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#a31313'}
          >
            <i className="fas fa-home"></i> Dashboard
          </Link>
          <Link 
            to="/announcements"
            style={{
              flex: 1,
              padding: '15px',
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              color: '#333',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background 0.3s',
              borderBottom: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e8e8e8';
              e.currentTarget.style.borderBottom = '2px solid #a31313';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
              e.currentTarget.style.borderBottom = '2px solid transparent';
            }}
          >
            <i className="fas fa-bullhorn"></i> Announcements
          </Link>
          <Link 
            to="/status"
            style={{
              flex: 1,
              padding: '15px',
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              color: '#333',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background 0.3s',
              borderBottom: '2px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e8e8e8';
              e.currentTarget.style.borderBottom = '2px solid #a31313';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
              e.currentTarget.style.borderBottom = '2px solid transparent';
            }}
          >
            <i className="fas fa-info-circle"></i> Status
          </Link>
        </div>

        {/* Application Status Section - Only if submitted */}
        {isApplicationSubmitted && (
          <div style={{
            padding: '30px',
            marginTop: '20px',
            backgroundColor: '#f9f9f9',
            borderLeft: `5px solid ${getStatusColor(application.status)}`
          }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h3 style={{ color: '#333', fontSize: '1.3em', marginBottom: '15px' }}>
                <i className="fas fa-check-circle"></i> Application Status
              </h3>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '4px',
                border: `1px solid ${getStatusColor(application.status)}`
              }}>
                <p style={{ fontSize: '16px', margin: '10px 0' }}>
                  <strong>Status:</strong> 
                  <span style={{ color: getStatusColor(application.status), marginLeft: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                    {getStatusLabel(application.status)}
                  </span>
                </p>
                {application.submittedDate && (
                  <p style={{ fontSize: '16px', margin: '10px 0', color: '#666' }}>
                    <strong>Submitted:</strong> {new Date(application.submittedDate).toLocaleDateString()}
                  </p>
                )}
                <p style={{ fontSize: '14px', color: '#999', marginTop: '20px' }}>
                  You can check the detailed status on the Status page or continue editing your application below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          {/* Quick Action Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <Link
              to="/application"
              style={{
                padding: '20px',
                backgroundColor: '#a31313',
                color: 'white',
                textDecoration: 'none',
                textAlign: 'center',
                borderRadius: '4px',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'background 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8a0d0d'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#a31313'}
            >
              <i className="fas fa-file-alt" style={{ display: 'block', fontSize: '24px', marginBottom: '10px' }}></i>
              {application ? 'Continue Application' : 'Start Application'}
            </Link>

            <Link
              to="/announcements"
              style={{
                padding: '20px',
                backgroundColor: '#f5f5f5',
                color: '#333',
                textDecoration: 'none',
                textAlign: 'center',
                borderRadius: '4px',
                fontWeight: '600',
                fontSize: '16px',
                border: '2px solid #ddd',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e8e8e8';
                e.currentTarget.style.borderColor = '#a31313';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderColor = '#ddd';
              }}
            >
              <i className="fas fa-bullhorn" style={{ display: 'block', fontSize: '24px', marginBottom: '10px' }}></i>
              Announcements
            </Link>

            <Link
              to="/status"
              style={{
                padding: '20px',
                backgroundColor: '#f5f5f5',
                color: '#333',
                textDecoration: 'none',
                textAlign: 'center',
                borderRadius: '4px',
                fontWeight: '600',
                fontSize: '16px',
                border: '2px solid #ddd',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e8e8e8';
                e.currentTarget.style.borderColor = '#a31313';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderColor = '#ddd';
              }}
            >
              <i className="fas fa-info-circle" style={{ display: 'block', fontSize: '24px', marginBottom: '10px' }}></i>
              Check Status
            </Link>
          </div>

          {/* Information Section */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '20px',
            marginTop: '30px'
          }}>
            <h3 style={{ color: '#333', fontSize: '1.1em', marginBottom: '15px' }}>
              <i className="fas fa-info-circle"></i> Application Information
            </h3>
            {application ? (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontWeight: '600', width: '40%' }}>Application Status:</td>
                    <td style={{ padding: '10px', color: '#666' }}>
                      {isApplicationSubmitted ? 'Submitted' : 'Draft'}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px', fontWeight: '600' }}>Started Date:</td>
                    <td style={{ padding: '10px', color: '#666' }}>
                      {new Date().toLocaleDateString()}
                    </td>
                  </tr>
                  {isApplicationSubmitted && application.submittedDate && (
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px', fontWeight: '600' }}>Submitted Date:</td>
                      <td style={{ padding: '10px', color: '#666' }}>
                        {new Date(application.submittedDate).toLocaleDateString()}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ padding: '10px', fontWeight: '600' }}>Next Steps:</td>
                    <td style={{ padding: '10px', color: '#666' }}>
                      {isApplicationSubmitted 
                        ? 'Review your status regularly for updates' 
                        : 'Complete all sections and submit your application'}
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#666', margin: 0 }}>
                No application started yet. Click "Start Application" above to begin.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Same as PHP backend */}
      <footer style={{
        backgroundColor: '#333',
        color: '#fff',
        textAlign: 'center',
        padding: '30px 20px',
        marginTop: 'auto',
        borderTop: '2px solid #222'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2em' }}>If you encounter any problem please contact us</h2>
        <div className="social-icons" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <a href="https://www.facebook.com/YouthScienceJournall" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: '#555',
              color: 'white',
              borderRadius: '50%',
              textDecoration: 'none',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a31313'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#555'}
          >
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="https://www.instagram.com/ysciencejournal?igsh=MWR3M3ZwYWxod3My" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: '#555',
              color: 'white',
              borderRadius: '50%',
              textDecoration: 'none',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a31313'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#555'}
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://www.linkedin.com/company/ysj/" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: '#555',
              color: 'white',
              borderRadius: '50%',
              textDecoration: 'none',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a31313'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#555'}
          >
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a href="mailto:ysciencejournal@gmail.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: '#555',
              color: 'white',
              borderRadius: '50%',
              textDecoration: 'none',
              transition: 'background 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a31313'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#555'}
          >
            <i className="fas fa-envelope"></i>
          </a>
        </div>
        <hr style={{ borderColor: '#555', margin: '20px 0' }} />
        <p style={{ margin: '10px 0', fontSize: '14px' }}>
          &copy; Youth Science Journal. All rights reserved
        </p>
      </footer>
    </div>
  );
}
