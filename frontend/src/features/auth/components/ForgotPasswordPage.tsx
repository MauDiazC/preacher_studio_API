import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useLanguage } from '../../../context/LanguageContext';
import './LoginPage.css'; // Reutilizamos estilos

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { addNotification } = useNotificationStore();
  const { t, language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.sendResetPasswordEmail(email);
      setSent(true);
      addNotification(
        language === 'es' 
          ? 'Enlace de recuperación enviado' 
          : 'Reset link sent', 
        'success'
      );
    } catch (err: any) {
      addNotification(err.message || 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

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
            <p className="login-brand-subtitle">
              {language === 'es' ? 'Recuperación de Acceso' : 'Access Recovery'}
            </p>
          </div>

          {!sent ? (
            <form className="sacred-form" onSubmit={handleSubmit}>
              <p style={{ color: '#c2c6d7', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', opacity: 0.8 }}>
                {language === 'es' 
                  ? 'Ingrese su correo electrónico para recibir un enlace de recuperación ministerial.' 
                  : 'Enter your email to receive a ministerial recovery link.'}
              </p>
              
              <div className="sacred-input-group">
                <label className="sacred-label" htmlFor="email">{t('auth.email')}</label>
                <div className="sacred-input-wrapper">
                  <span className="material-symbols-outlined sacred-input-icon">mail</span>
                  <input 
                    className="sacred-input"
                    id="email" 
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button className="sacred-submit-btn" type="submit" disabled={loading}>
                {loading ? '...' : (language === 'es' ? 'Enviar Enlace' : 'Send Link')}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#b0c6ff', marginBottom: '1rem' }}>mark_email_read</span>
              <p style={{ color: '#c2c6d7', marginBottom: '2rem' }}>
                {language === 'es' 
                  ? 'Hemos enviado las instrucciones a su correo. Por favor, revise su bandeja de entrada.' 
                  : 'We have sent instructions to your email. Please check your inbox.'}
              </p>
            </div>
          )}

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link to="/login" className="sacred-register-link">
              {language === 'es' ? 'Volver al inicio de sesión' : 'Back to login'}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
