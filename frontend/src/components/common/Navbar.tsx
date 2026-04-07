import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';
import Button from './Button';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // Mockup de créditos para el admin
  const isAdmin = user?.email === 'mdiazcabr@gmail.com';
  const credits = isAdmin ? '∞' : '50';

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
            <Link to="/" className="navbar-link">{t('nav.home')}</Link>
            <Link to="/pricing" className="navbar-link">{t('nav.pricing')}</Link>
            <a href="#features" className="navbar-link">{t('nav.features')}</a>
          </>
        ) : (
          <>
            <Link to="/sermons" className="navbar-link">{t('nav.my_sermons')}</Link>
            <Link to="/sermons/new" className="navbar-link">{t('nav.new_study')}</Link>
          </>
        )}
      </div>

      <div className="navbar-right">
        {/* Toggle Language */}
        <button className="lang-toggle" onClick={toggleLanguage}>
          {language === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
        </button>

        {isAuthenticated && (
          <div className="user-info-pill">
            <span className="credits-indicator" title="Créditos de Mentoría">
              ✨ {credits}
            </span>
            <div className="v-divider"></div>
            <button onClick={handleLogout} className="logout-text-btn">
              {t('nav.logout').toUpperCase()}
            </button>
          </div>
        )}

        {!isAuthenticated && (
          <>
            <Link to="/login" className="navbar-link">{t('nav.login')}</Link>
            <Button size="sm" onClick={() => navigate('/register')}>{t('nav.try_free')}</Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
