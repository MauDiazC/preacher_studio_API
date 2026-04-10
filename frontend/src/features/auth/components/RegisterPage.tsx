import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useLanguage } from '../../../context/LanguageContext';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { t } = useLanguage();

  // Asegurar que la página cargue desde arriba
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.error_passwords_match') || 'Las contraseñas no coinciden');
      addNotification(t('auth.error_passwords_match') || 'Las contraseñas no coinciden', 'error');
      return;
    }

    setLoading(true);
    
    try {
      await authService.register(email, password, fullName);
      setIsSuccess(true);
      addNotification(t('auth.success_notification') || '¡Cuenta creada!', 'success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error';
      setError(errorMessage);
      addNotification(t('auth.error_notification') || 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      const url = await authService.getGoogleAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      addNotification(t('auth.error_google'), 'error');
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-screen-ministerial">
      <div className="loader-ministerial"></div>
      <p style={{ marginTop: '1.5rem', opacity: 0.6, letterSpacing: '0.1em' }}>{t('list.loading').toUpperCase()}</p>
    </div>
  );

  if (isSuccess) {
    return (
      <div className="register-page-sacred">
        <div className="celestial-orbit-container">
          <div className="celestial-orbit orbit-reg-1"></div>
          <div className="celestial-orbit orbit-reg-2"></div>
        </div>
        <main className="register-main-canvas">
          <div className="glass-panel-reg" style={{ textAlign: 'center' }}>
            <div className="panel-accent-line"></div>
            <h2 className="brand-title">{t('auth.success_title') || 'Registro Exitoso'}</h2>
            <p className="brand-tagline" style={{ marginBottom: '2rem' }}>
              {t('auth.success_body') || 'Hemos enviado un correo a'} <strong>{email}</strong>.<br /><br />
              {t('auth.success_body_2') || 'Bienvenido a'} <strong>Preacher Studio</strong>.
            </p>
            <button className="sacred-submit-reg" onClick={() => navigate('/login')}>
              {t('auth.login_btn')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="register-page-sacred">
      {/* Background Celestial Orbits */}
      <div className="celestial-orbit-container">
        <div className="celestial-orbit orbit-reg-1"></div>
        <div className="celestial-orbit orbit-reg-2"></div>
      </div>

      <main className="register-main-canvas">
        {/* Brand Identity */}
        <div className="brand-identity">
          <div className="brand-icon-wrapper">
            <span className="material-symbols-outlined">menu_book</span>
          </div>
          <h1 className="brand-title">Preacher Studio</h1>
          <p className="brand-tagline">{t('auth.inspired_prep')}</p>
        </div>

        {/* Registration Card */}
        <div className="glass-panel-reg">
          <div className="panel-accent-line"></div>
          
          <div className="reg-card-header">
            <h2>{t('auth.register_now')}</h2>
            <p>{t('auth.register_subtitle')}</p>
          </div>

          {/* Google Register Option */}
          <div className="reg-google-container">
            <button className="sacred-social-btn-google" onClick={handleGoogleRegister}>
              <img 
                alt="Google" 
                className="sacred-social-icon-img" 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              />
              <span>{t('auth.continue_with')} Google</span>
            </button>
            <div className="sacred-divider">
              <span className="sacred-divider-text">{t('auth.continue_with')} email</span>
            </div>
          </div>

          <form className="sacred-form" onSubmit={handleSubmit}>
            <div className="sacred-input-group">
              <label className="sacred-label" htmlFor="full_name">{t('auth.full_name')}</label>
              <div className="sacred-input-wrapper">
                <span className="material-symbols-outlined sacred-input-icon">person</span>
                <input 
                  className="sacred-input"
                  id="full_name" 
                  type="text"
                  placeholder={t('auth.full_name')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="sacred-input-group">
              <label className="sacred-label" htmlFor="email">{t('auth.email')}</label>
              <div className="sacred-input-wrapper">
                <span className="material-symbols-outlined sacred-input-icon">mail</span>
                <input 
                  className="sacred-input"
                  id="email" 
                  type="email"
                  placeholder={t('auth.email_placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="sacred-input-group">
              <label className="sacred-label" htmlFor="password">{t('auth.password')}</label>
              <div className="sacred-input-wrapper">
                <span className="material-symbols-outlined sacred-input-icon">lock</span>
                <input 
                  className="sacred-input"
                  id="password" 
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="sacred-input-group">
              <label className="sacred-label" htmlFor="confirm_password">{t('AUTH.CONFIRM_PASSWORD_LABEL')}</label>
              <div className="sacred-input-wrapper">
                <span className="material-symbols-outlined sacred-input-icon">lock_reset</span>
                <input 
                  className="sacred-input"
                  id="confirm_password" 
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="input-error" style={{ color: '#ffb4ab', fontSize: '0.8rem' }}>{error}</p>}

            <button className="sacred-submit-reg" type="submit" disabled={loading}>
              {loading ? '...' : t('auth.register_btn')}
            </button>
          </form>

          <div className="reg-footer-divider">
            <p className="reg-footer-text">
              {t('auth.have_account')} 
              <Link to="/login" className="reg-footer-link">
                {t('auth.login_link')}
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Persistent Footer */}
      <footer className="sacred-footer-reg">
        <div className="sacred-footer-content">
          <p className="sacred-footer-copy">© 2026 Preacher Studio. {t('auth.inspired_prep')}.</p>
          <nav className="sacred-footer-links">
            <a href="#" className="sacred-footer-link">{t('footer.privacy')}</a>
            <a href="#" className="sacred-footer-link">{t('footer.terms')}</a>
            <a href="#" className="sacred-footer-link">{t('footer.contact')}</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default RegisterPage;
