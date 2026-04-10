import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useLanguage } from '../../../context/LanguageContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authService.login(email, password);
      addNotification(t('auth.success_login') || '¡Bienvenido de nuevo!', 'success');
      navigate('/sermons');
    } catch (err: any) {
      addNotification(t('auth.error_login') || 'Credenciales inválidas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const url = await authService.getGoogleAuthUrl();
      window.location.href = url;
    } catch (err: any) {
      addNotification(t('auth.error_google') || 'Error al conectar con Google', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-sacred">
      {/* Background Celestial Orbits */}
      <div className="orbit-bg">
        <div className="orbit-1"></div>
        <div className="orbit-2"></div>
      </div>

      <main className="login-main-content">
        <div className="login-card-sacred">
          {/* Brand Anchor */}
          <div className="login-brand-header">
            <h1 className="login-brand-title">Preacher Studio</h1>
            <p className="login-brand-subtitle">{t('auth.inspired_prep')}</p>
          </div>

          {/* Login Form */}
          <form className="sacred-form" onSubmit={handleSubmit}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="sacred-label" htmlFor="password">{t('auth.password')}</label>
                <Link to="/pricing" className="sacred-forgot-link">{t('auth.forgot_password')}</Link>
              </div>
              <div className="sacred-input-wrapper">
                <span className="material-symbols-outlined sacred-input-icon">lock</span>
                <input 
                  className="sacred-input"
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="sacred-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button className="sacred-submit-btn" type="submit" disabled={loading}>
              {loading ? '...' : t('auth.login_btn')}
            </button>
          </form>

          {/* Social Provider Divider */}
          <div className="sacred-divider">
            <span className="sacred-divider-text">{t('auth.continue_with')}</span>
          </div>

          {/* Social Providers */}
          <div className="sacred-social-full">
            <button className="sacred-social-btn-google" onClick={handleGoogleLogin}>
              <img 
                alt="Google" 
                className="sacred-social-icon-img" 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              />
              <span>Continuar con Google</span>
            </button>
          </div>

          {/* Footer Link */}
          <p className="sacred-register-footer">
            {t('auth.no_account')} 
            <Link to="/register" className="sacred-register-link">
              Registrarme
            </Link>
          </p>
        </div>
      </main>

      {/* Persistent Footer */}
      <footer className="sacred-footer-login">
        <div className="sacred-footer-content">
          <p className="sacred-footer-copy">© 2026 Preacher Studio. {t('auth.inspired_prep')}.</p>
          <div className="sacred-footer-links">
            <a href="#" className="sacred-footer-link">{t('footer.privacy')}</a>
            <a href="#" className="sacred-footer-link">{t('footer.terms')}</a>
            <a href="#" className="sacred-footer-link">{t('footer.contact')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
