import { create } from 'zustand';
import { supabase } from '../services/supabase';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => Promise<void>;
}

// Función auxiliar para buscar tokens de Supabase o los nuestros
const getStoredToken = () => {
  const localToken = localStorage.getItem('token');
  if (localToken) return localToken;
  
  // Buscar claves que empiecen con 'sb-' (Supabase)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
      const sbData = JSON.parse(localStorage.getItem(key) || '{}');
      return sbData.access_token || null;
    }
  }
  return null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: async () => {
    // 1. Cerrar sesión en Supabase (esto maneja Google y Password)
    await supabase.auth.signOut();
    
    // 2. Limpieza manual de cualquier rastro
    localStorage.removeItem('token');
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    
    // 3. Resetear estado global
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
