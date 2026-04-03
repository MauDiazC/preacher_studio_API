import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.error_passwords_match') || 'Passwords do not match');
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
        <Card className="register-card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <h2 className="register-title">{t('auth.success_title')}</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {t('auth.success_body')} <strong>{email}</strong>.<br /><br />
            {t('auth.success_body_2')} <strong>Preacher Studio</strong>.
          </p>
          <Button style={{ width: '100%' }} onClick={() => navigate('/login')}>{t('auth.go_login')}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="register-container">
      <Card className="register-card">
        <h2 className="register-title">{t('auth.register_title')}</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <Input 
            label={t('auth.full_name')} 
            type="text" 
            placeholder={t('auth.full_name_placeholder')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input 
            label={t('auth.email')} 
            type="email" 
            placeholder={t('auth.email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label={t('auth.password')} 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input 
            label={t('auth.confirm_password')} 
            type="password" 
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="input-error" style={{ marginBottom: '1rem' }}>{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? '...' : t('auth.register_btn')}
          </Button>
        </form>
        <div className="register-footer">
          {t('auth.have_account')} <Link to="/login" className="register-link">{t('auth.login_link')}</Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
