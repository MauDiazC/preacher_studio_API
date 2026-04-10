import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { supabase } from '../../../services/supabase';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useAuthStore } from '../../../store/authStore';
import { useLanguage } from '../../../context/LanguageContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotificationStore();
  const { t } = useLanguage();
  const { setAuth } = useAuthStore();

  const queryParams = new URLSearchParams(location.search);
  const planId = queryParams.get('plan') || localStorage.getItem('pending_plan');

  const handlePostAuthRedirect = () => {
    if (planId && planId !== 'plan_sembrador') {
      localStorage.removeItem('pending_plan');
      navigate(`/checkout/${planId}`);
    } else {
      navigate('/sermons');
    }
  };

  // Escuchar cambios de sesión de Supabase (OAuth)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log("Supabase Auth Event: SIGNED_IN");
        setAuth({ id: session.user.id, email: session.user.email || '' }, session.access_token);
        
        // Persistencia manual para evitar rebotes del router
        localStorage.setItem('token', session.access_token);
        
        handlePostAuthRedirect();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, setAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authService.login(email, password);
      addNotification(t('auth.success_login') || '¡Bienvenido de nuevo!', 'success');
      handlePostAuthRedirect();
    } catch (err: any) {
      addNotification(t('auth.error_login') || 'Credenciales inválidas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/sermons',
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      addNotification(t('auth.error_google') || 'Error al conectar con Google', 'error');
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-screen-ministerial">
      <div className="loader-ministerial"></div>
      <p style={{ marginTop: '1.5rem', opacity: 0.6, letterSpacing: '0.1em' }}>{t('list.loading').toUpperCase()}</p>
    </div>
  );

  return (
    <div className="login-page-sacred">
      <div className="orbit-bg">
        <div className="orbit-1"></div>
        <div className="orbit-2"></div>
      </div>

      <main className="login-main-content">
        <div className="login-card-sacred">
          <div className="login-brand-header">
            <h1 className="login-brand-title">Preacher Studio</h1>
            <p className="login-brand-subtitle">{t('auth.inspired_prep')}</p>
            {planId && (
              <div className="selected-plan-pill" style={{
                background: 'rgba(176, 198, 255, 0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                fontSize: '0.8rem',
                marginTop: '1rem',
                border: '1px solid rgba(176, 198, 255, 0.2)',
                color: '#b0c6ff',
                textAlign: 'center'
              }}>
                {t('auth.selected_plan') || 'Continuando con plan'}: <strong>{planId.toUpperCase()}</strong>
              </div>
            )}
          </div>

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

          <div className="sacred-divider">
            <span className="sacred-divider-text">{t('auth.continue_with')}</span>
          </div>

          <div className="sacred-social-full">
            <button className="sacred-social-btn-google" onClick={handleGoogleLogin}>
              <img 
                alt="Google" 
                className="sacred-social-icon-img" 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              />
              <span>{t('auth.continue_with')} Google</span>
            </button>
          </div>

          <p className="sacred-register-footer">
            {t('auth.no_account')} 
            <Link to={`/register${planId ? `?plan=${planId}` : ''}`} className="sacred-register-link">
              {t('auth.register_now')}
            </Link>
          </p>
        </div>
      </main>

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
