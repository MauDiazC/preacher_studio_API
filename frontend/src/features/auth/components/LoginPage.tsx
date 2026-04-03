import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { authService } from '../services/authService';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useLanguage } from '../../../context/LanguageContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authService.login(email, password);
      addNotification(t('auth.success_login') || 'Welcome back!', 'success');
      navigate('/sermons');
    } catch (err: any) {
      setError(t('auth.error_login') || 'Invalid credentials');
      addNotification(t('auth.error_notification') || 'Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <h2 className="login-title">{t('auth.login_title')}</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          <Input 
            label={t('auth.email')} 
            type="email" 
            placeholder="ejemplo@correo.com"
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
          {error && <p className="input-error" style={{ marginBottom: '1rem' }}>{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? '...' : t('auth.login_btn')}
          </Button>
        </form>
        <div className="login-footer">
          {t('auth.no_account')} <Link to="/register" className="login-link">{t('auth.register_link')}</Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
