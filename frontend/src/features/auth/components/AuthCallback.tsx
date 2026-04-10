import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        // Obtenemos info básica del usuario del fragmento si está disponible
        // Supabase a veces manda el user object en el hash
        setAuth({ id: 'google-user', email: 'google-auth' }, accessToken); 
        
        // Pequeña espera para asegurar que el store se actualice
        setTimeout(() => {
          navigate('/sermons', { replace: true });
        }, 100);
      }
    } else {
      navigate('/login');
    }
  }, [navigate, setAuth]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#111127',
      color: '#b0c6ff'
    }}>
      <div className="loader-ministerial"></div>
      <p style={{ marginLeft: '1rem' }}>Finalizando preparación ministerial...</p>
    </div>
  );
};

export default AuthCallback;
