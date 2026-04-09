import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Ocultar Navbar en las rutas internas de la aplicación que ya tienen Sidebar
  if (location.pathname.startsWith('/sermons')) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-content-sacred">
        <Link to="/" className="navbar-brand-sacred">
          <span className="material-symbols-outlined brand-icon-sacred">church</span>
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
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
          >
            language
          </span>

          {!isAuthenticated ? (
            <>
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
            </>
          ) : (
            <button 
              className="btn-try-sacred"
              onClick={() => navigate('/sermons')}
            >
              {t('nav.my_sermons')}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
