import api from '../../../services/api';

export interface AISuggestion {
  suggested_outline: string[];
  verses_found: string[];
  central_theme: string;
}

export interface VerseExegesis {
  literary_type: string;
  author: string;
  purpose: string;
  historical_context: string;
  significance_context: string;
  version_rv1960: string;
  version_nvi: string;
  original_languages: string;
  source_attribution: string;
  key_locations: string[];
}

export const aiService = {
  getMentorship: async (sermonId: string) => {
    const response = await api.post<AISuggestion>(`/sermons/${sermonId}/ai-assist`);
    return response.data;
  },

  analyzeVerse: async (verseReference: string, language: string = 'es') => {
    const response = await api.post<VerseExegesis>(`/sermons/exegesis`, {
      verse_reference: verseReference,
      language: language
    });
    return response.data;
  }
};
