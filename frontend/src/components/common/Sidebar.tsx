import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const { t, language, toggleLanguage } = useLanguage();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/profile/');
      setProfile(response.data);
    } catch (err) {
      console.error("Error perfil sidebar:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      localStorage.clear();
      navigate('/login');
    }
  };

  const userEmail = user?.email?.toLowerCase() || '';
  const isAdmin = profile?.is_admin || userEmail === 'diazzabala@gmail.com';
  const credits = profile?.credits_remaining ?? 0;
  const currentPlan = profile?.plan_id || 'plan_sembrador';

  const getPlanName = (id: string) => {
    const names: Record<string, string> = {
      'plan_sembrador': 'SEMBRADOR',
      'mentor': 'MENTOR',
      'ministerio': 'MINISTERIO'
    };
    return names[id] || id.toUpperCase();
  };

  return (
    <aside className="sacred-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon-box"><span className="material-symbols-outlined">menu_book</span></div>
        <div>
          <h1 className="brand-text-pulp">Preacher Studio</h1>
          <p className="brand-tagline-sm">{t('auth.inspired_prep')}</p>
        </div>
      </div>

      <div className="sidebar-plan-indicator">
        <span className="plan-badge-sacred">{getPlanName(currentPlan)}</span>
      </div>

      <nav className="sacred-nav">
        <Link to="/sermons" className={`nav-item ${location.pathname === '/sermons' ? 'active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">book_2</span>
          <span>{t('nav.library')}</span>
        </Link>
        <Link to="/sermons/new" className={`nav-item ${location.pathname === '/sermons/new' ? 'active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">edit_note</span>
          <span>{t('nav.sermon_prep')}</span>
        </Link>
        <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
          <span className="material-symbols-outlined nav-icon">settings</span>
          <span>{t('nav.settings')}</span>
        </Link>
      </nav>

      <div className="sidebar-footer-sacred">
        <div className="sidebar-user-stats">
          <div className="credits-display-clean">
            <span className="credits-label-small">{t('nav.credits')}</span>
            <span className="credits-value-small" style={!isAdmin && credits <= 0 ? { color: '#ffb4ab' } : {}}>
              {isAdmin ? t('nav.unlimited') : (credits <= 0 ? (language === 'es' ? 'SIN CRÉDITOS' : 'OUT OF CREDITS') : credits)}
            </span>
          </div>
          <button className="lang-toggle-minimal" onClick={toggleLanguage}>
            <span className="material-symbols-outlined">language</span>
            <span className="lang-text-small">{language.toUpperCase()}</span>
          </button>
        </div>
        <button className="logout-btn-sidebar" onClick={handleLogout}>
          <span className="material-symbols-outlined">logout</span>
          <span>{t('nav.logout')}</span>
        </button>
      </div>
      <button className="new-study-btn-sidebar" onClick={() => navigate('/sermons/new')}>
        <span className="material-symbols-outlined">add</span>
        <span>{t('list.new_study_btn')}</span>
      </button>
    </aside>
  );
};

export default Sidebar;
