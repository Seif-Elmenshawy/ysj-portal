import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import hero from '../assets/ysj-cover.jpg';
import facebook from '../assets/facebook.png'
import insta from '../assets/instagram.png'
import linkedin from '../assets/linkedin.png'
import whatsapp from '../assets/whatsapp.png'

export default function Home() {
  const { user } = useAuth();
  const STATUS_MAP = {
    submitted: { label: 'Pending', color: '#ffc107' },
    'under-review': { label: 'Pending', color: '#ffc107' },
    draft: { label: 'Draft', color: '#6c757d' },
    approved: { label: 'Accepted', color: '#28a745' },
    accepted: { label: 'Accepted', color: '#28a745' },
    rejected: { label: 'Rejected', color: '#dc3545' },
    waitlisted: { label: 'Waitlisted', color: '#17a2b8' }
  };

  return (
    <div className="home-page">


      <main className="container home-main">
        <div className="home-intro card">
          <p className="lead">Welcome to the Junior Application for the 2026 season of the YSJ annual program! Get started by logging in to your account or creating a new one.</p>

          <div className="cta-row">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-hero">Login</Link>
                <Link to="/register" className="btn btn-hero btn-ghost">Create account</Link>
              </>
            ) : (
              <div>
                <p>Welcome back, <strong>{user.username}</strong></p>
                {user.role === 'applicant' && (
                  // If application submitted, show preview + status; otherwise keep CTA to start/continue
                  user.applicationSubmitted ? (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ padding: '12px', border: '1px solid #e0e0e0', borderRadius: 6, background: '#fafafa', maxWidth: 820 }}>
                        {(() => {
                          const key = (user.application?.status || 'submitted');
                          const info = STATUS_MAP[key] || { label: key, color: '#6c757d' };
                          return (
                            <h4 style={{ margin: '0 0 8px 0' }}>
                              Application Status: <span style={{ display: 'inline-block', background: info.color, color: '#fff', padding: '4px 8px', borderRadius: 6, textTransform: 'capitalize', marginLeft: 8 }}>{info.label}</span>
                            </h4>
                          );
                        })()}
                        <p style={{ margin: '6px 0' }}>Submitted: {user.application?.submittedAt ? new Date(user.application.submittedAt).toLocaleString() : 'Unknown'}</p>
                        <ul style={{ margin: '8px 0 0 18px' }}>
                          <li><strong>Full name:</strong> {user.application?.fullName || user.username}</li>
                          <li><strong>School:</strong> {user.application?.institution || 'Not provided'}</li>
                          <li><strong>Grade:</strong> {user.application?.gradeYear || 'Not provided'}</li>
                          <li><strong>Preferred fields:</strong> {(user.application?.preferredFields || user.application?.interest || []).join ? (user.application?.preferredFields || user.application?.interest || []).join(', ') : (user.application?.preferredFields || user.application?.interest || 'Not provided')}</li>
                        </ul>
                        <div style={{ marginTop: 10 }}>
                          <Link to="/application/preview" className="btn btn-hero">View Application</Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    user.hasApplicationStarted ? (
                      <Link to="/application" className="btn btn-hero">Continue Application</Link>
                    ) : (
                      <Link to="/application" className="btn btn-hero">Start Application</Link>
                    )
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </main>

    <footer>


      <div className="footer-main">
        <div className="container footer-content">
          <div className="footer-section">
            <h3>About YSJ</h3>
            <p>YSJ Junior is a student research program supporting high-school researchers through mentorship and publication.</p>
          </div>

          <div className="footer-section">
            <h3>Contact</h3>
            <div className="social-links">
              <a href="https://www.facebook.com/YouthScienceJournall" aria-label="facebook">Facebook</a>
              <a href="https://www.instagram.com/ysciencejournal/" aria-label="instagram">Instagram</a>
              <a href="https://www.linkedin.com/company/ysj/" aria-label="linkedin">LinkedIn</a>
              <a href="mailto:ysciencejournal@gmail.com" aria-label="mail">Mail us</a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Location</h3>
            <p>STEM High School for Boys - 6th of October</p>
          </div>
        </div>

        <div className="footer-bottom container text-center">
          © 2026 YSJ — All rights reserved
        </div>
      </div>
    </footer>
    </div>
  );
}
