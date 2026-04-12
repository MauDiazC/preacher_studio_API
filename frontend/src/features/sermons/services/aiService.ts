import api from '../../../services/api';
import { taskService } from '../../../services/taskService';

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
  getMentorship: async (sermonId: string): Promise<AISuggestion> => {
    // Paso 1: Enviar tarea
    const initResponse = await api.post<{ task_id: string }>(`/sermons/${sermonId}/ai-assist`);
    
    // Paso 2: Polling
    return taskService.pollTask<AISuggestion>(initResponse.data.task_id);
  },

  analyzeVerse: async (verseReference: string, language: string = 'es'): Promise<VerseExegesis> => {
    // Paso 1: Enviar tarea
    const initResponse = await api.post<{ task_id: string }>(`/sermons/exegesis`, {
      verse_reference: verseReference,
      language: language
    });
    
    // Paso 2: Polling
    return taskService.pollTask<VerseExegesis>(initResponse.data.task_id);
  }
};
