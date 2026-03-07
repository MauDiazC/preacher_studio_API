import React, { useState } from 'react';
import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    
    try {
      // Logic for registration will be implemented here
      console.log('Register attempt with:', email);
      // simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // navigate('/login');
    } catch (err) {
      setError('Error al crear la cuenta. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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
          ¿Ya tienes una cuenta? <a href="/login" className="register-link">Inicia Sesión</a>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
