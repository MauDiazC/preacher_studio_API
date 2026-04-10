import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    // Supabase devuelve el token en el fragmento (#) de la URL
    // Ejemplo: #access_token=xyz&refresh_token=abc...
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      // El usuario viene codificado en el token, pero Supabase también 
      // lo envía a veces en los metadatos. Por ahora simplificamos:
      if (accessToken) {
        // Guardamos el token y redirigimos a la biblioteca
        // El user object se llenará la primera vez que hagamos una petición al perfil
        setAuth({ id: '', email: '' }, accessToken); 
        navigate('/sermons');
      }
    } else {
      // Si no hay hash, puede que haya habido un error
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
