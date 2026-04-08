import React, { useState } from 'react';
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
  const { t, language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.error_passwords_match') || 'Passwords do not match');
      addNotification(t('auth.error_passwords_match') || 'Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    
    try {
      await authService.register(email, password, fullName);
      setIsSuccess(true);
      addNotification(t('auth.success_notification') || 'Account created!', 'success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error';
      setError(errorMessage);
      addNotification(t('auth.error_notification') || 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="register-container">
        <div className="celestial-orbit-container">
          <div className="celestial-orbit orbit-reg-1"></div>
          <div className="celestial-orbit orbit-reg-2"></div>
          <div className="glow-nebula-1"></div>
          <div className="glow-nebula-2"></div>
        </div>
        <main className="register-main-canvas">
          <div className="glass-panel-reg" style={{ textAlign: 'center' }}>
            <div className="panel-accent-line"></div>
            <h2 className="brand-title">{t('auth.success_title')}</h2>
            <p className="brand-tagline" style={{ marginBottom: '2rem' }}>
              {t('auth.success_body')} <strong>{email}</strong>.<br /><br />
              {t('auth.success_body_2')} <strong>Preacher Studio</strong>.
            </p>
            <button className="sacred-submit-reg" onClick={() => navigate('/login')}>
              {t('auth.go_login')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="register-container">
      {/* Background Celestial Orbits */}
      <div className="celestial-orbit-container">
        <div className="celestial-orbit orbit-reg-1"></div>
        <div className="celestial-orbit orbit-reg-2"></div>
        <div className="glow-nebula-1"></div>
        <div className="glow-nebula-2"></div>
      </div>

      {/* Decorative Illustration Background */}
      <div className="reg-deco-side">
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5cqqBEX6tQi_OiCVUY6fu41oaWZCDlaF5SmwODaYElvHQO6BlNG2o4MCcwg0Qj65KRiMmuxjf-3dPsoJShIS66I9O5Xx0u0FXXDcGwyoIdRYM0uvKzwJ7-xM55BHMSQ4wwvWceJ9GkrzS9bVPqGrMlgxNlo1s6RvI1pSecG14-VK3Zi-LUAmTOEr4gc61u0N4-icP-GlH_uiLER-biqjFESVVzgbcq9ZdaqOmVsz74UpuvKuigSDRzoO7yHFWLwaSDynVlTooEKU" alt="Celestial Background" />
      </div>

      <main className="register-main-canvas">
        {/* Brand Identity */}
        <div className="brand-identity">
          <div className="brand-icon-wrapper">
            <span className="material-symbols-outlined">auto_stories</span>
          </div>
          <h1 className="brand-title">Preacher Studio</h1>
          <p className="brand-tagline">{language === 'es' ? 'Comienza tu jornada de Preparación Inspirada para la excelencia ministerial.' : 'Begin your journey of Inspired Preparation for ministerial excellence.'}</p>
        </div>

        {/* Registration Card */}
        <div className="glass-panel-reg">
          <div className="panel-accent-line"></div>
          
          <div className="reg-card-header">
            <h2>{t('auth.register_title_new')}</h2>
            <p>{t('auth.register_subtitle')}</p>
          </div>

          <form className="sacred-form" onSubmit={handleSubmit}>
            <div className="sacred-grid">
              {/* Full Name */}
              <div className="sacred-input-group">
                <label className="sacred-label" htmlFor="full_name">{t('auth.full_name')}</label>
                <div className="sacred-input-wrapper">
                  <input 
                    className="sacred-input"
                    style={{ paddingLeft: '1rem' }}
                    id="full_name" 
                    type="text"
                    placeholder={t('auth.full_name_placeholder')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Church Name (Visual only for now since backend doesn't support it) */}
              <div className="sacred-input-group">
                <label className="sacred-label" htmlFor="church_name">{t('auth.church_name')}</label>
                <div className="sacred-input-wrapper">
                  <input 
                    className="sacred-input"
                    style={{ paddingLeft: '1rem' }}
                    id="church_name" 
                    type="text"
                    placeholder={t('auth.church_placeholder')}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="sacred-input-group">
              <label className="sacred-label" htmlFor="email">{t('auth.email')}</label>
              <div className="sacred-input-wrapper">
                <input 
                  className="sacred-input"
                  style={{ paddingLeft: '1rem' }}
                  id="email" 
                  type="email"
                  placeholder={t('auth.email_placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="sacred-input-group">
              <label className="sacred-label" htmlFor="password">{t('auth.password')}</label>
              <div className="sacred-input-wrapper">
                <input 
                  className="sacred-input"
                  style={{ paddingLeft: '1rem' }}
                  id="password" 
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <p style={{ fontSize: '10px', color: 'rgba(194, 198, 215, 0.6)', fontStyle: 'italic', marginTop: '4px' }}>
                {t('auth.password_hint')}
              </p>
            </div>

            {/* Confirm Password */}
            <div className="sacred-input-group">
              <label className="sacred-label" htmlFor="confirm_password">{t('auth.confirm_password_label')}</label>
              <div className="sacred-input-wrapper">
                <input 
                  className="sacred-input"
                  style={{ paddingLeft: '1rem' }}
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

          {/* Footer Link */}
          <div className="reg-footer-divider">
            <p className="reg-footer-text">
              {t('auth.have_account')} 
              <Link to="/login" className="reg-footer-link">
                {t('auth.login_link')}
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Badges / Quote */}
        <div className="trust-badges-section">
          <span className="material-symbols-outlined quote-icon">format_quote</span>
          <p className="quote-text">{t('auth.quote')}</p>
          <div className="badges-container">
            <div className="badge-item">
              <span className="material-symbols-outlined">verified_user</span>
              <span>{t('auth.secure_platform')}</span>
            </div>
            <div className="badge-item">
              <span className="material-symbols-outlined">cloud_done</span>
              <span>{t('auth.ministerial_support')}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Persistent Footer */}
      <footer className="sacred-footer">
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
