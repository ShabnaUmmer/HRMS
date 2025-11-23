import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = '/login';
  };

  if (!isLoggedIn) {
    return null; // Don't show navbar if not logged in
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/employees" className="brand-link">
          <h2>HR Management System</h2>
        </Link>
      </div>
      
      <div className="navbar-links">
        <Link 
          to="/employees" 
          className={`nav-link ${location.pathname === '/employees' ? 'active' : ''}`}
        >
          Employees
        </Link>
        <Link 
          to="/teams" 
          className={`nav-link ${location.pathname === '/teams' ? 'active' : ''}`}
        >
          Teams
        </Link>
        <Link 
            to="/logs" 
            className={`nav-link ${location.pathname === '/logs' ? 'active' : ''}`}
        >
            Audit Logs
        </Link>
      </div>

      <div className="navbar-actions">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;