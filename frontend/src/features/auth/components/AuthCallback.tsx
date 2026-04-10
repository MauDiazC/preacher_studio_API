import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    console.log("Processing Auth Callback...");
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        console.log("Token received, persisting...");
        
        // FORZADO MANUAL DE PERSISTENCIA
        // Esto asegura que App.tsx vea al usuario como autenticado inmediatamente
        localStorage.setItem('token', accessToken);
        
        // Sincronizamos con el store
        setAuth({ id: 'google-user', email: 'google-auth' }, accessToken); 
        
        // Redirección inmediata a la biblioteca
        navigate('/sermons', { replace: true });
      }
    } else {
      console.warn("No hash found in URL");
      navigate('/login', { replace: true });
    }
  }, [navigate, setAuth]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#111127',
      color: '#b0c6ff',
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>
      <div className="loader-ministerial"></div>
      <p style={{ marginTop: '1.5rem', opacity: 0.8, letterSpacing: '0.05em' }}>
        FINALIZANDO PREPARACIÓN MINISTERIAL...
      </p>
    </div>
  );
};

export default AuthCallback;
