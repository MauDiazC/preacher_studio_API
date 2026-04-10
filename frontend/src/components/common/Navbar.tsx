import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, token } = useAuthStore();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado local para forzar reactividad con el token de localStorage
  const [hasToken, setHasToken] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    // Sincronizar cada vez que cambie la ruta o el estado global
    setHasToken(isAuthenticated || !!token || !!localStorage.getItem('token'));
  }, [isAuthenticated, token, location.pathname]);

  const isTrulyAuthenticated = hasToken;

  // Ocultar Navbar en las rutas internas de la aplicación que ya tienen Sidebar
  if (location.pathname.startsWith('/sermons') || location.pathname.startsWith('/settings')) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    setHasToken(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content-sacred">
        <Link to="/" className="navbar-brand-sacred">
          <span className="material-symbols-outlined brand-icon-sacred">menu_book</span>
          PREACHER STUDIO
        </Link>

        <div className="navbar-links-sacred">
          <Link to="/" className={`navbar-link-sacred ${location.pathname === '/' ? 'active' : ''}`}>
            {t('nav.home')}
          </Link>
          <Link to="/pricing" className={`navbar-link-sacred ${location.pathname === '/pricing' ? 'active' : ''}`}>
            {t('nav.pricing')}
          </Link>
        </div>

        <div className="navbar-actions-sacred">
          <span 
            className="material-symbols-outlined lang-icon-sacred"
            onClick={toggleLanguage}
            style={{ cursor: 'pointer', marginRight: '1rem' }}
          >
            language
          </span>

          {!isTrulyAuthenticated ? (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn-login-sacred"
                onClick={() => navigate('/login')}
              >
                {t('nav.login')}
              </button>
              <button 
                className="btn-try-sacred"
                onClick={() => navigate('/register')}
              >
                {t('nav.try_free')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn-try-sacred"
                onClick={() => navigate('/sermons')}
              >
                {t('nav.my_sermons')}
              </button>
              <button 
                className="btn-login-sacred"
                style={{ 
                  borderColor: 'rgba(255, 85, 85, 0.3)', 
                  color: '#ff8585',
                  backgroundColor: 'rgba(255, 85, 85, 0.05)' 
                }}
                onClick={handleLogout}
              >
                {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
