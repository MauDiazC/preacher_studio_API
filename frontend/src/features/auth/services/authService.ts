import api from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';

export const authService = {
  register: async (email: string, password: string, fullName: string) => {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    const { access_token, user } = response.data;
    useAuthStore.getState().setAuth(user, access_token);
    return response.data;
  },
};
