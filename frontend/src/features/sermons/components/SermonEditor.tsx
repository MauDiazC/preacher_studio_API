import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { aiService } from '../services/aiService';
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
  
  // Repurposing 'title' as 'verse' for the database
  const [verse, setVerse] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(id && id !== 'new' ? true : false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      const fetchSermon = async () => {
        try {
          const data = await sermonService.getById(id);
          setVerse(data.title || ''); // Usamos el campo title para el versículo
          setContent(data.content || '');
        } catch (error) {
          console.error('Error fetching study:', error);
          addNotification('No se pudo cargar el estudio.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchSermon();
    }
  }, [id]);

  const handleSave = async () => {
    try {
      const payload = { title: verse, content }; // Guardamos el versículo como título
      if (id && id !== 'new') {
        await sermonService.update(id, payload);
        addNotification('Estudio guardado.', 'success');
      } else {
        const newStudy = await sermonService.create(payload);
        addNotification('Estudio creado.', 'success');
        navigate(`/sermons/${newStudy.id}`);
      }
    } catch (error) {
      addNotification('Error al guardar.', 'error');
    }
  };

  const handleAnalyze = async () => {
    if (!verse) {
      addNotification('Por favor, ingrese un pasaje primero.', 'error');
      return;
    }
    setAnalyzing(true);
    try {
      const data = await aiService.analyzeVerse(verse);
      
      // Formateamos el resultado para el cuadro de texto principal
      const formattedResult = `
--- ANÁLISIS EXEGÉTICO: ${verse} ---

1. TIPO LITERARIO:
${data.literary_type}

2. AUTORÍA:
${data.author}

3. PROPÓSITO ORIGINAL:
${data.purpose}

4. CONTEXTO HISTÓRICO (USOS Y COSTUMBRES):
${data.historical_context}

5. CONTEXTO DE SIGNIFICANCIA (APLICACIÓN ORIGINAL):
${data.significance_context}

-------------------------------------------
Notas adicionales del estudio:
`;
      setContent(formattedResult);
      addNotification('Análisis completado con éxito.', 'success');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error en el servicio de consulta.';
      addNotification(msg, 'error');
    } finally {
      setAnalyzing(false);
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
      console.error('Error exporting:', error);
    }
  };

  if (loading) return <div className="loading-screen">Cargando estudio...</div>;

  return (
    <div className="sermon-editor-container">
      <div className="sermon-editor-header">
        <div className="header-left">
          <Input 
            placeholder={t('editor.verse_placeholder')}
            value={verse} 
            onChange={(e) => setVerse(e.target.value)}
            className="verse-input-main"
          />
          <Button 
            onClick={handleAnalyze} 
            disabled={analyzing || !verse}
            variant="primary"
          >
            {analyzing ? '...' : t('editor.analyze_btn')}
          </Button>
        </div>
        
        <div className="header-actions">
          <Button variant="outline" onClick={() => navigate('/sermons')}>{t('nav.home')}</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </div>
      </div>

      <div className="sermon-editor-main">
        <div className="editor-pane">
          <textarea 
            className="editor-textarea" 
            placeholder="El resultado del análisis aparecerá aquí. También puedes escribir tus propias notas..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        <div className="sidebar-pane">
          <div className="export-panel">
            <h3>Exportar Estudio</h3>
            <div className="export-buttons">
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} disabled={!id || id === 'new'}>PDF Profesional</Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('keynote')} disabled={!id || id === 'new'}>Presentación Keynote</Button>
            </div>
          </div>

          <div className="help-panel">
            <p><strong>Tip:</strong> Una vez generado el análisis, puedes editar el texto directamente para añadir tus propias revelaciones y apuntes para el mensaje.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SermonEditor;
