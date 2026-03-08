import api from '../../../services/api';

export interface AISuggestion {
  suggestion: string;
  type: 'illustration' | 'structure' | 'clarity' | 'application';
}

export const aiService = {
  getMentorship: async (sermonId: string) => {
    // Apuntamos a la ruta real del backend: /sermons/{id}/ai-assist
    const response = await api.post<AISuggestion>(`/sermons/${sermonId}/ai-assist`);
    
    // El backend devuelve un objeto AISuggestionResponse, lo adaptamos si es necesario
    // Por ahora, asumimos que el componente espera un array o el objeto directamente.
    return response.data;
  },
};
