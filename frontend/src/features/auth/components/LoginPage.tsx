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

  return (
    <div className="login-container">
      {/* Background Celestial Orbits */}
      <div className="orbit-bg">
        <div className="orbit-1"></div>
        <div className="orbit-2"></div>
      </div>

      {/* Decorative Floating Elements */}
      <div className="sacred-deco-img deco-left">
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdnW3E2zOpnnRz8HwhTUnaDXY99B8R2rvkVouVO_1cZzupvVUujn_I9GhSv6Blrro2X50eO0e6UDZLb_cXhLYf2attZjoSRXKhxzp_Svq_9K-RLXZlFiftJAxxBwfLS957xvUs7EuWhqXfe1NJy4wJM9irbU83IVjXLXHiiTO1hqIQ_av0CpA4RHuDBjLw12b8rENFB2JCopFJz--O_OpGXqw5F4ccpNmtCIJQ8ieJ3FHGjs6JZzJJzdjsg8XvNFaXY9JEiEYKFfo" alt="Deco Left" />
      </div>
      <div className="sacred-deco-img deco-right">
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYaqXuwrHJ3hAYACtCpEe00GBHDcSKfR_XFLABQAHtIu38-rvH8Ed43r9ts_c0pXTcN511N5Q3PJjXJS8nB5QcZrJHdkqz8_ZdiSm-vTDZZYcNXAMVpTpAifHp5iwaKRUTFp7s9Qg6HnbI5uR6f9wEcjBymmt56mXkjqwa_xrcU6KogXFgsJRkcjmvnuql3YHpakO7rCO4CgZXiyd4CP7iON-b1QGbb-A_DxJLOGdLJu5iZgoRwZX2sYD9zjU525SiS7yERIpwI-s" alt="Deco Right" />
      </div>

      <main className="login-card-sacred">
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
        <div className="sacred-social-grid">
          <button className="sacred-social-btn">
            <img 
              alt="Google" 
              className="sacred-social-icon-img" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzHSulEetOv5axXZfgRhee6tPLsOVpZBVjNIpLxW3zQ1nAW00RVlBDU57KOZQFI8Q8_sATa76tTgHZ7NBeEhzEOwVawC8oM-hlfWtEEG6EbdwYOg68xAWCC4OTlP1q1O2AFGZvADHVguqhp0ii1yy46GQs3tHS9Ycl8KcR0C1GDGHGnEsZVBuLnS6qj2bAY0cMrHyAw4yeoUYyo1RHuDFkfvhXCab69tyv4FrgPay4WeuT9SS3S3-Vd67tcKQr210C7EY5H01TztI" 
            />
            <span>Google</span>
          </button>
          <button className="sacred-social-btn">
            <span className="material-symbols-outlined">cloud</span>
            <span>{t('auth.ministerio')}</span>
          </button>
        </div>

        {/* Footer Link */}
        <p className="sacred-register-footer">
          {t('auth.no_account')} 
          <Link to="/register" className="sacred-register-link">
            {t('auth.register_church')}
          </Link>
        </p>
      </main>

      {/* Persistent Footer */}
      <footer className="sacred-footer" style={{ position: 'absolute', bottom: 0, left: 0 }}>
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
