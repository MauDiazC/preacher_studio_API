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
    credits_remaining: 3,
    stripe_customer_id: null as string | null
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

          {/* Avatar Section - NOW OUTSIDE THE CARD */}
          <div className="profile-avatar-dashboard-floating">
            <div className="initials-avatar-circle">
              {getInitials(profile.full_name)}
            </div>
            <div className="avatar-info-text">
              <h2 className="headline-text-small">{language === 'es' ? 'Identidad Ministerial' : 'Ministerial Identity'}</h2>
            </div>
          </div>

          <div className="settings-grid-layout">
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

            {/* Subscription Card */}
            <section className="glass-card-settings">
              <div className="panel-accent-line" style={{ background: 'linear-gradient(90deg, #b0c6ff, #c2c1ff)' }}></div>
              <h2 className="headline-text">{language === 'es' ? 'Suscripción y Créditos' : 'Subscription & Credits'}</h2>
              <p className="label-text" style={{ marginBottom: '1.5rem', opacity: 0.7 }}>
                {language === 'es' ? 'Gestione su plan ministerial y métodos de pago.' : 'Manage your ministerial plan and payment methods.'}
              </p>
              
              <div className="form-grid-settings">
                <div className="input-group-sacred">
                  <label className="label-text">{language === 'es' ? 'Créditos Disponibles' : 'Available Credits'}</label>
                  <div className="input-sacred disabled" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: '#b0c6ff' }}>auto_awesome</span>
                    {profile.is_admin ? t('nav.unlimited') : profile.credits_remaining}
                  </div>
                </div>
              </div>

              <div className="actions-footer-settings" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {profile.stripe_customer_id && (
                  <button 
                    className="btn-save-sacred" 
                    style={{ width: '100%', background: 'rgba(176, 198, 255, 0.1)', border: '1px solid rgba(176, 198, 255, 0.3)', color: '#b0c6ff' }}
                    onClick={async () => {
                      try {
                        const res = await api.post('/stripe/create-portal-session');
                        if (res.data?.url) window.location.href = res.data.url;
                      } catch (err: any) {
                        addNotification(err.response?.data?.detail || 'Error al conectar con Stripe', 'error');
                      }
                    }}
                  >
                    {language === 'es' ? 'Gestionar en Stripe' : 'Manage on Stripe'}
                  </button>
                )}
                <button 
                  className="btn-save-sacred" 
                  style={{ width: '100%' }}
                  onClick={() => navigate('/pricing')}
                >
                  {language === 'es' ? 'Ver Planes y Mejorar' : 'View Plans & Upgrade'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
