import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Music, LayoutDashboard, LogOut, User } from 'lucide-react';
import '../styles/Home.css';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-logo">
          <Music className="logo-icon" />
          <span>DJ Night</span>
        </div>
        <div className="nav-links">
          {user ? (
            <>
              <span className="user-badge">
                <User size={16} />
                {user.name}
              </span>
              <button onClick={logout} className="nav-btn logout-btn">
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-btn signup-btn">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Experience Premium <br/><span className="gradient-text">DJ Booking</span></h1>
          <p>Book the world's most talented DJs for your next event with ease. Real-time availability, secure payments, and premium service.</p>
          
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="primary-btn">
                <LayoutDashboard size={20} />
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/signup" className="primary-btn">Explore DJs</Link>
            )}
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="visual-card glass">
            <div className="card-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
            </div>
            <div className="card-body">
              <div className="skeleton-line long"></div>
              <div className="skeleton-line medium"></div>
              <div className="skeleton-grid">
                <div className="skeleton-box"></div>
                <div className="skeleton-box"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
