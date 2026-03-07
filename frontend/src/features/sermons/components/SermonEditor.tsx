import React, { useState } from 'react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { aiService } from '../services/aiService';
import type { AISuggestion } from '../services/aiService';
import { exportService } from '../services/exportService';
import './SermonEditor.css';

const SermonEditor: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGetMentorship = async () => {
    if (!content.trim()) return;
    setLoadingAI(true);
    try {
      const data = await aiService.getMentorship(content);
      setSuggestions(data);
    } catch (error) {
      console.error('Error getting AI mentorship:', error);
      setSuggestions([
        { suggestion: 'Considera añadir una ilustración personal al inicio para conectar con la audiencia.', type: 'illustration' },
        { suggestion: 'Tu introducción parece sólida, pero podrías clarificar el punto principal.', type: 'structure' }
      ]);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    try {
      if (format === 'pdf') {
        await exportService.exportToPDF('dummy-id');
      } else {
        await exportService.exportToWord('dummy-id');
      }
    } catch (error) {
      console.error('Error exporting sermon:', error);
    }
  };

  return (
    <div className="sermon-editor-container">
      <div className="sermon-editor-header">
        <Input 
          placeholder="Título del Sermón" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          style={{ fontSize: '1.5rem', fontWeight: 'bold', border: 'none', borderBottom: '2px solid var(--border-color)', borderRadius: 0, width: '400px' }}
        />
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <Button variant="outline">Cancelar</Button>
          <Button>Guardar</Button>
        </div>
      </div>

      <div className="sermon-editor-main">
        <div className="editor-pane">
          <textarea 
            className="editor-textarea" 
            placeholder="Comienza a escribir tu sermón aquí..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        <div className="sidebar-pane" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div className="ai-mentorship-panel">
            <h3>Mentoría IA</h3>
            {suggestions.length === 0 && !loadingAI && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Escribe algo y presiona el botón para recibir consejos homiléticos.
              </p>
            )}
            {loadingAI && <p>Analizando sermón...</p>}
            {suggestions.map((s, index) => (
              <div key={index} className="ai-suggestion">
                <strong>{s.type.charAt(0).toUpperCase() + s.type.slice(1)}:</strong> {s.suggestion}
              </div>
            ))}
            <Button 
              variant="secondary" 
              size="sm" 
              style={{ width: '100%' }} 
              onClick={handleGetMentorship}
              disabled={loadingAI || !content.trim()}
            >
              {loadingAI ? 'Analizando...' : 'Pedir Revisión'}
            </Button>
          </div>

          <div className="export-panel ai-mentorship-panel">
            <h3>Exportar</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>Descargar PDF</Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('docx')}>Descargar Word</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SermonEditor;
