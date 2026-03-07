import api from '../../../services/api';

export interface AISuggestion {
  suggestion: string;
  type: 'illustration' | 'structure' | 'clarity' | 'application';
}

export const aiService = {
  getMentorship: async (content: string) => {
    const response = await api.post<AISuggestion[]>('/ai/mentor', { content });
    return response.data;
  },
};
