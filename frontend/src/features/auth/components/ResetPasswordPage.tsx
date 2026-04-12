import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useLanguage } from '../../../context/LanguageContext';
import './LoginPage.css';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addNotification(
        language === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match', 
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      await authService.updatePassword(password);
      addNotification(
        language === 'es' ? 'Contraseña actualizada con éxito' : 'Password updated successfully', 
        'success'
      );
      navigate('/login');
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
              {language === 'es' ? 'Nueva Contraseña' : 'New Password'}
            </p>
          </div>

          <form className="sacred-form" onSubmit={handleSubmit}>
            <div className="sacred-input-group">
              <label className="sacred-label" htmlFor="password">
                {language === 'es' ? 'Nueva Contraseña' : 'New Password'}
              </label>
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

            <div className="sacred-input-group">
              <label className="sacred-label" htmlFor="confirm_password">
                {language === 'es' ? 'Confirmar Contraseña' : 'Confirm Password'}
              </label>
              <div className="sacred-input-wrapper">
                <span className="material-symbols-outlined sacred-input-icon">lock_reset</span>
                <input 
                  className="sacred-input"
                  id="confirm_password" 
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="sacred-submit-btn" type="submit" disabled={loading}>
              {loading ? '...' : (language === 'es' ? 'Actualizar Contraseña' : 'Update Password')}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
