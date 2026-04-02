import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from './Button';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📖</span> PREACHER STUDIO
        </Link>
      </div>
      
      <div className="navbar-center">
        {!isAuthenticated ? (
          <>
            <Link to="/" className="navbar-link">Inicio</Link>
            <Link to="/pricing" className="navbar-link">Precios</Link>
            <a href="#features" className="navbar-link">Funciones</a>
          </>
        ) : (
          <>
            <Link to="/sermons" className="navbar-link">Mis Sermones</Link>
            <Link to="/sermons/new" className="navbar-link">Nuevo Estudio</Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        {isAuthenticated ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className="user-badge">Admin</span>
            <button onClick={handleLogout} className="navbar-link logout-btn">
              Salir
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Button size="sm" onClick={() => navigate('/register')}>Probar Gratis</Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
