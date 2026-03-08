import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { aiService } from '../services/aiService';
import { sermonService } from '../services/sermonService';
import { exportService } from '../services/exportService';
import { useNotificationStore } from '../../../store/useNotificationStore';
import './SermonEditor.css';

const SermonEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loading, setLoading] = useState(id ? true : false);

  useEffect(() => {
    if (id && id !== 'new') {
      const fetchSermon = async () => {
        try {
          const data = await sermonService.getById(id);
          setTitle(data.title);
          setContent(data.content || '');
        } catch (error) {
          console.error('Error fetching sermon:', error);
          addNotification('No se pudo cargar el sermón.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchSermon();
    }
  }, [id]);

  const handleSave = async () => {
    try {
      if (id && id !== 'new') {
        await sermonService.update(id, { title, content });
        addNotification('Sermón actualizado.', 'success');
      } else {
        const newSermon = await sermonService.create({ title, content });
        addNotification('Sermón creado.', 'success');
        navigate(`/sermons/${newSermon.id}`);
      }
    } catch (error) {
      addNotification('Error al guardar.', 'error');
    }
  };

  const handleGetMentorship = async () => {
    if (!id || id === 'new') {
      addNotification('Guarde el sermón primero para usar la IA.', 'error');
      return;
    }
    setLoadingAI(true);
    try {
      const data = await aiService.getMentorship(id);
      setSuggestions(data);
    } catch (error) {
      console.error('Error getting AI mentorship:', error);
      addNotification('Error al conectar con la IA.', 'error');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!id || id === 'new') return;
    try {
      if (format === 'pdf') {
        await exportService.exportToPDF(id);
      } else {
        await exportService.exportToWord(id);
      }
    } catch (error) {
      console.error('Error exporting sermon:', error);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando sermón...</div>;

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
          <Button variant="outline" onClick={() => navigate('/sermons')}>Volver</Button>
          <Button onClick={handleSave}>Guardar</Button>
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
            {!suggestions && !loadingAI && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Escriba algo, guarde y presione el botón para recibir consejos homiléticos.
              </p>
            )}
            {loadingAI && <p>Analizando sermón con Gemini...</p>}
            
            {suggestions && (
              <div className="ai-suggestions-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="ai-suggestion">
                  <strong>Estructura Sugerida:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{suggestions.suggested_outline}</p>
                </div>
                <div className="ai-suggestion">
                  <strong>Versículos Relacionados:</strong>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                    {suggestions.related_verses.map((v: string, i: number) => <li key={i}>{v}</li>)}
                  </ul>
                </div>
              </div>
            )}

            <Button 
              variant="secondary" 
              size="sm" 
              style={{ width: '100%', marginTop: '1rem' }} 
              onClick={handleGetMentorship}
              disabled={loadingAI || !id || id === 'new'}
            >
              {loadingAI ? 'Analizando...' : 'Pedir Revisión IA'}
            </Button>
          </div>

          <div className="export-panel ai-mentorship-panel">
            <h3>Exportar</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} disabled={!id || id === 'new'}>Descargar PDF</Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('docx')} disabled={!id || id === 'new'}>Descargar Word</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SermonEditor;
