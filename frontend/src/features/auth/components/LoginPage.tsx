import React, { useState } from 'react';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Logic for login will be implemented here
      console.log('Login attempt with:', email);
      // simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // navigate('/sermons');
    } catch (err) {
      setError('Credenciales inválidas. Por favor intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>
        <form className="login-form" onSubmit={handleSubmit}>
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
          {error && <p className="input-error" style={{ marginBottom: '1rem' }}>{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Entrar'}
          </Button>
        </form>
        <div className="login-footer">
          ¿No tienes una cuenta? <a href="/register" className="login-link">Regístrate</a>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
