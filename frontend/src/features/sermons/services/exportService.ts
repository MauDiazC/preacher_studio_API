import api from '../../../services/api';
import { taskService } from '../../../services/taskService';

interface ExportResult {
  download_url: string;
}

export const exportService = {
  exportToPDF: async (sermonId: string) => {
    // Paso 1: Enviar tarea
    const initResponse = await api.get<{ task_id: string }>(`/export/${sermonId}/pdf`);
    
    // Paso 2: Polling
    const result = await taskService.pollTask<ExportResult>(initResponse.data.task_id);
    
    // Paso 3: Descargar
    if (result.download_url) {
      window.open(result.download_url, '_blank');
    }
  },
  exportToKeynote: async (sermonId: string) => {
    // Paso 1: Enviar tarea (a PPTX)
    const initResponse = await api.get<{ task_id: string }>(`/export/${sermonId}/pptx`);
    
    // Paso 2: Polling
    const result = await taskService.pollTask<ExportResult>(initResponse.data.task_id);
    
    // Paso 3: Descargar
    if (result.download_url) {
      window.open(result.download_url, '_blank');
    }
  },
};
