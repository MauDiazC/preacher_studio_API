import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { aiService } from '../services/aiService';
import type { VerseExegesis } from '../services/aiService';
import { sermonService } from '../services/sermonService';
import { exportService } from '../services/exportService';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useLanguage } from '../../../context/LanguageContext';
import './SermonEditor.css';

const SermonEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { t } = useLanguage();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loading, setLoading] = useState(id && id !== 'new' ? true : false);

  // New Exegesis State
  const [verseRef, setVerseRef] = useState('');
  const [exegesisResult, setExegesisResult] = useState<VerseExegesis | null>(null);
  const [loadingExegesis, setLoadingExegesis] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      const fetchSermon = async () => {
        try {
          const data = await sermonService.getById(id);
          setTitle(data.title || '');
          setContent(data.content || '');
        } catch (error) {
          console.error('Error fetching sermon:', error);
          addNotification('No se pudo cargar el sermón.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchSermon();
    } else {
      setTitle('');
      setContent('');
      setSuggestions(null);
    }
  }, [id]);

  const handleSave = async () => {
    try {
      if (id && id !== 'new') {
        const updated = await sermonService.update(id, { title, content });
        setTitle(updated.title || '');
        setContent(updated.content || '');
        addNotification('Sermón actualizado.', 'success');
      } else {
        const newSermon = await sermonService.create({ title, content });
        addNotification('Sermón creado.', 'success');
        navigate(`/sermons/${newSermon.id}`);
      }
    } catch (error) {
      console.error('Error saving sermon:', error);
      addNotification('Error al guardar.', 'error');
    }
  };

  const handleGetExegesis = async () => {
    if (!verseRef) return;
    setLoadingExegesis(true);
    try {
      const data = await aiService.analyzeVerse(verseRef);
      setExegesisResult(data);
      addNotification('Análisis exegético completado.', 'success');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al conectar con la IA.';
      addNotification(msg, 'error');
    } finally {
      setLoadingExegesis(false);
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

  const handleExport = async (format: 'pdf' | 'keynote') => {
    if (!id || id === 'new') return;
    try {
      if (format === 'pdf') {
        await exportService.exportToPDF(id);
      } else {
        await exportService.exportToKeynote(id);
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
          style={{ fontSize: '1.5rem', fontWeight: 'bold', border: 'none', borderBottom: '2px solid var(--border-color)', borderRadius: 0, width: '400px', background: 'transparent' }}
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
          
          {/* Exegesis Panel */}
          <div className="ai-mentorship-panel exegesis-panel">
            <h3>{t('editor.exegesis_title')}</h3>
            <div className="verse-input-group">
              <Input 
                placeholder={t('editor.verse_placeholder')}
                value={verseRef}
                onChange={(e) => setVerseRef(e.target.value)}
              />
              <Button 
                size="sm" 
                onClick={handleGetExegesis} 
                disabled={loadingExegesis || !verseRef}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {loadingExegesis ? '...' : t('editor.analyze_btn')}
              </Button>
            </div>

            {exegesisResult && (
              <div className="exegesis-results">
                <div className="ex-item"><strong>{t('editor.literary')}:</strong> <p>{exegesisResult.literary_type}</p></div>
                <div className="ex-item"><strong>{t('editor.author')}:</strong> <p>{exegesisResult.author}</p></div>
                <div className="ex-item"><strong>{t('editor.purpose')}:</strong> <p>{exegesisResult.purpose}</p></div>
                <div className="ex-item"><strong>{t('editor.historical')}:</strong> <p>{exegesisResult.historical_context}</p></div>
                <div className="ex-item"><strong>{t('editor.significance')}:</strong> <p>{exegesisResult.significance_context}</p></div>
              </div>
            )}
          </div>

          <div className="ai-mentorship-panel">
            <h3>Mentoría IA</h3>
            {!suggestions && !loadingAI && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Escriba algo, guarde y presione el botón para recibir consejos homiléticos.
              </p>
            )}
            {loadingAI && <p>Analizando...</p>}
            
            {suggestions && (
              <div className="ai-suggestions-content">
                <div className="ai-suggestion">
                  <strong>Tema Central:</strong>
                  <p>{suggestions.central_theme}</p>
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
              Pedir Revisión IA
            </Button>
          </div>

          <div className="export-panel ai-mentorship-panel">
            <h3>Exportar</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} disabled={!id || id === 'new'}>PDF</Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('keynote')} disabled={!id || id === 'new'}>Keynote</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SermonEditor;
