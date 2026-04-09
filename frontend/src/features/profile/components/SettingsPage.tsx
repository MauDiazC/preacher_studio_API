import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useLanguage } from '../../../context/LanguageContext';
import { useNotificationStore } from '../../../store/useNotificationStore';
import api from '../../../services/api';
import './SettingsPage.css';

const SettingsPage: React.FC = () => {
  const { logout } = useAuthStore();
  const { t, language, toggleLanguage } = useLanguage();
  const { addNotification } = useNotificationStore();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    ministry_name: '',
    role_title: '',
    country: 'México',
    bio: '',
    mentorship_style: 'encouraging',
    is_admin: false,
    credits_remaining: 3
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile/');
      setProfile(prev => ({ ...prev, ...response.data }));
    } catch (err) {
      addNotification('Error al cargar el perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/profile/', profile);
      addNotification('Ajustes guardados con éxito', 'success');
    } catch (err) {
      addNotification('Error al guardar ajustes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Función para obtener iniciales
  const getInitials = (name: string) => {
    if (!name) return 'GS';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) return <div className="loading-screen-settings">{t('list.loading')}</div>;

  return (
    <div className="settings-page-sacred">
      <aside className="sacred-sidebar-settings">
        <div className="sidebar-brand">
          <div className="brand-icon-box"><span className="material-symbols-outlined">menu_book</span></div>
          <div>
            <h1 className="brand-text-pulp">Preacher Studio</h1>
            <p className="brand-tagline-sm">{t('auth.inspired_prep')}</p>
          </div>
        </div>
        <nav className="sacred-nav">
          <Link to="/sermons" className="nav-item"><span className="material-symbols-outlined nav-icon">book_2</span><span>{t('nav.library')}</span></Link>
          <Link to="/sermons/new" className="nav-item"><span className="material-symbols-outlined nav-icon">edit_note</span><span>{t('nav.sermon_prep')}</span></Link>
          <Link to="/settings" className="nav-item active"><span className="material-symbols-outlined nav-icon">settings</span><span>{t('nav.settings')}</span></Link>
        </nav>
        <div className="sidebar-footer-sacred">
          <div className="sidebar-user-stats">
            <div className="credits-display">
              <span className="credits-label">{t('nav.credits')}</span>
              <span className="credits-value">{profile.is_admin ? t('nav.unlimited') : profile.credits_remaining}</span>
            </div>
            <button className="lang-toggle-sidebar" onClick={toggleLanguage}><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>language</span>{language.toUpperCase()}</button>
          </div>
          <button className="logout-btn-sidebar" onClick={handleLogout}><span className="material-symbols-outlined">logout</span><span>{t('nav.logout').toUpperCase()}</span></button>
        </div>
      </aside>

      <main className="settings-main-content">
        <div className="max-width-container">
          <header className="settings-header">
            <h1 className="display-title">{language === 'es' ? 'Perfil del Guía Espiritual' : 'Spiritual Guide Profile'}</h1>
            <p className="subtitle-text">
              {language === 'es' 
                ? 'Configure su identidad ministerial para una experiencia de preparación personalizada.' 
                : 'Configure your ministerial identity for a personalized preparation experience.'}
            </p>
          </header>

          <div className="settings-grid-layout">
            {/* Avatar Section - Initials Circle */}
            <section className="glass-card-settings profile-avatar-section">
              <div className="initials-avatar-circle">
                {getInitials(profile.full_name)}
              </div>
              <div className="avatar-info-text">
                <h2 className="headline-text-small">{language === 'es' ? 'Identidad Ministerial' : 'Ministerial Identity'}</h2>
                <p className="label-text-sm">{language === 'es' ? 'Basada en su nombre registrado' : 'Based on your registered name'}</p>
              </div>
            </section>

            {/* Form Card */}
            <section className="glass-card-settings">
              <div className="panel-accent-line"></div>
              <h2 className="headline-text">{language === 'es' ? 'Preparación Inspirada' : 'Inspired Preparation'}</h2>
              
              <div className="form-grid-settings">
                <div className="input-group-sacred">
                  <label className="label-text">{t('auth.full_name')}</label>
                  <input className="input-sacred" type="text" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} />
                </div>
                <div className="input-group-sacred">
                  <label className="label-text">{t('auth.email')}</label>
                  <input className="input-sacred disabled" type="email" value={profile.email} disabled />
                </div>
                <div className="input-group-sacred">
                  <label className="label-text">{language === 'es' ? 'Ministerio / Iglesia' : 'Ministry / Church'}</label>
                  <input className="input-sacred" type="text" value={profile.ministry_name} onChange={(e) => setProfile({...profile, ministry_name: e.target.value})} />
                </div>
                <div className="input-group-sacred">
                  <label className="label-text">{language === 'es' ? 'Cargo o Rol' : 'Position / Role'}</label>
                  <input className="input-sacred" type="text" value={profile.role_title} onChange={(e) => setProfile({...profile, role_title: e.target.value})} />
                </div>
                <div className="input-group-sacred">
                  <label className="label-text">{language === 'es' ? 'País' : 'Country'}</label>
                  <select className="input-sacred" value={profile.country} onChange={(e) => setProfile({...profile, country: e.target.value})}>
                    <option>México</option><option>España</option><option>Estados Unidos</option><option>Colombia</option><option>Argentina</option>
                  </select>
                </div>
                <div className="input-group-sacred">
                  <label className="label-text">{language === 'es' ? 'Estilo de Mentoría' : 'Mentorship Style'}</label>
                  <select className="input-sacred" value={profile.mentorship_style} onChange={(e) => setProfile({...profile, mentorship_style: e.target.value})}>
                    <option value="encouraging">{language === 'es' ? 'Homilético' : 'Homiletic'}</option>
                    <option value="academic">{language === 'es' ? 'Académico' : 'Academic'}</option>
                    <option value="practical">{language === 'es' ? 'Práctico' : 'Practical'}</option>
                  </select>
                </div>
                <div className="input-group-sacred full-width">
                  <label className="label-text">{language === 'es' ? 'Biografía Ministerial' : 'Ministerial Biography'}</label>
                  <textarea className="textarea-sacred" rows={4} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})}></textarea>
                </div>
              </div>
              <div className="actions-footer-settings">
                <button className="btn-save-sacred" onClick={handleSave} disabled={saving}>{saving ? '...' : (language === 'es' ? 'Guardar Cambios' : 'Save Changes')}</button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
