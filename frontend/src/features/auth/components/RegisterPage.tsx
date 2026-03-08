import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { authService } from '../services/authService';
import { useNotificationStore } from '../../../store/useNotificationStore';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    
    try {
      await authService.register(email, password, fullName);
      setIsSuccess(true);
      addNotification('¡Cuenta creada con éxito!', 'success');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error al crear la cuenta. Intente de nuevo.';
      setError(errorMessage);
      addNotification('No se pudo crear la cuenta.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="register-container">
        <Card className="register-card" style={{ textAlign: 'center' }}>
          <h2 className="register-title">¡Casi listo! 🕊️</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            Hemos enviado un enlace de confirmación a <strong>{email}</strong>. 
            Por favor, revisa tu bandeja de entrada (y la carpeta de spam) para activar tu cuenta.
          </p>
          <Button onClick={() => navigate('/login')}>Ir al Inicio de Sesión</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="register-container">
      <Card className="register-card">
        <h2 className="register-title">Crear Cuenta</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <Input 
            label="Nombre Completo" 
            type="text" 
            placeholder="Juan Pérez"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input 
            label="Correo Electrónico" 
            type="email" 
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input 
            label="Contraseña" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input 
            label="Confirmar Contraseña" 
            type="password" 
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="input-error" style={{ marginBottom: '1rem' }}>{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Registrarse'}
          </Button>
        </form>
        <div className="register-footer">
          ¿Ya tienes una cuenta? <Link to="/login" className="register-link">Inicia Sesión</Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
