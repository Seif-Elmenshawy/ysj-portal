import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import hero from '../assets/ysj-cover.jpg'
import Breadcrumbs from './Breadcrumbs';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the top navigation on the home page so hero sits at the very top
  // Previously the header was hidden on the home page; show it now.

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header>
      <section className="home-hero">
        <img src={hero} alt="Hero background - replace with your image" className="hero-img" />
        <div className="hero-overlay"></div>
      </section>

      <section className="app-banner">
        <div className="container banner-inner">
          <div className="banner-left">
            <h2 className="app-title">2026 YSJ Junior Application</h2>
            {location.pathname !== '/' && <Breadcrumbs />}
          </div>
          <div className='header-left' >
            {!user ? (
              <>
                <Link to="/login" className="btn btn-hero">Login</Link>
                <Link to="/register" className="btn btn-hero btn-ghost">Create account</Link>
              </>
            ) : (
              <>
                <p>Welcome back, <strong>{user.username}</strong></p>
                <button className='btn btn-hero' onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </div>
        
      </section>
    </header>
  );
}
