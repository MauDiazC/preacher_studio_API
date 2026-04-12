import api from '../../../services/api';
import { supabase } from '../../../services/supabase';
import { useAuthStore } from '../../../store/authStore';

export const authService = {
  register: async (email: string, password: string, fullName: string) => {
    const response = await api.post('auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('auth/login', {
      email,
      password,
    });
    const { access_token, user } = response.data;
    useAuthStore.getState().setAuth(user, access_token);
    return response.data;
  },
  getGoogleAuthUrl: async () => {
    const response = await api.get('auth/google');
    return response.data.url;
  },
  sendResetPasswordEmail: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },
  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  }
};
