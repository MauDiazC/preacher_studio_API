import api from '../../../services/api';

export interface Sermon {
  id: string;
  title: string;
  description?: string;
  content: string;
  pastor_name?: string;
  series?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export const sermonService = {
  getAll: async () => {
    const response = await api.get<Sermon[]>('/sermons');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Sermon>(`/sermons/${id}`);
    return response.data;
  },
  create: async (sermon: Partial<Sermon>) => {
    const response = await api.post<Sermon>('/sermons', sermon);
    return response.data;
  },
  update: async (id: string, sermon: Partial<Sermon>) => {
    const response = await api.put<Sermon>(`/sermons/${id}`, sermon);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/sermons/${id}`);
  },
};
