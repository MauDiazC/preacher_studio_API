import api from '../../../services/api';

export const exportService = {
  exportToPDF: async (sermonId: string) => {
    const response = await api.get(`/export/${sermonId}/pdf`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sermon-${sermonId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
  exportToKeynote: async (sermonId: string) => {
    // Exportamos a PPTX ya que Keynote lo abre y convierte nativamente
    const response = await api.get(`/export/${sermonId}/pptx`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sermon-${sermonId}.pptx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
