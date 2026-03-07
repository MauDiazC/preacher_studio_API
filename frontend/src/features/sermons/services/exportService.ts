import api from '../../../services/api';

export const exportService = {
  exportToPDF: async (sermonId: string) => {
    const response = await api.get(`/export/pdf/${sermonId}`, {
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
  exportToWord: async (sermonId: string) => {
    const response = await api.get(`/export/docx/${sermonId}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sermon-${sermonId}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
