import api from '../../../services/api';

export interface Sermon {
  id: string;
  title: string;
  main_passage?: string;
  description?: string;
  content: string;
  pastor_name?: string;
  series?: string;
  tags?: string[];
  key_locations?: string[];
  exegesis?: string;
  homiletics?: string;
  application?: string;
  additional_notes?: string;
  historical_context?: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedSermons {
  total: number;
  limit: number;
  offset: number;
  data: Sermon[];
}

export const sermonService = {
  getAll: async (limit: number = 10, offset: number = 0) => {
    const response = await api.get<any>(`/sermons/?limit=${limit}&offset=${offset}`);
    return response.data; // Retornamos { data, total, limit, offset }
  },
  getById: async (id: string) => {
    const response = await api.get<Sermon>(`/sermons/${id}`);
    return response.data;
  },
  create: async (sermon: Partial<Sermon>) => {
    const response = await api.post<Sermon>('/sermons/', sermon);
    return response.data;
  },
  update: async (id: string, sermon: Partial<Sermon>) => {
    // El backend usa PATCH para actualizaciones parciales (auto-save)
    const response = await api.patch<Sermon>(`/sermons/${id}`, sermon);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/sermons/${id}`);
  },
  generateAnalysis: async (passage: string) => {
    const response = await api.post<any>('/sermons/exegesis', { verse_reference: passage });
    return response.data;
  },
};
