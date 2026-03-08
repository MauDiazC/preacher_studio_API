import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">PREACHER STUDIO</Link>
      <div className="navbar-links">
        {isAuthenticated && (
          <>
            <Link to="/sermons" className="navbar-link">Mis Sermones</Link>
            <Link to="/profile" className="navbar-link">Perfil</Link>
          </>
        )}
      </div>
      <div className="navbar-actions">
        {isAuthenticated ? (
          <button 
            onClick={handleLogout} 
            className="navbar-link" 
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Cerrar Sesión
          </button>
        ) : (
          <Link to="/login" className="navbar-link">Iniciar Sesión</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
