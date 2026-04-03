import React, { useState, useEffect, useRef } from 'react';
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
  
  const [verse, setVerse] = useState('');
  const [loading, setLoading] = useState(id && id !== 'new' ? true : false);
  const [analyzing, setAnalyzing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id && id !== 'new') {
      const fetchSermon = async () => {
        try {
          const data = await sermonService.getById(id);
          setVerse(data.title || '');
          if (editorRef.current) {
            editorRef.current.innerText = data.content || '';
          }
        } catch (error) {
          addNotification('Error al cargar.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchSermon();
    }
  }, [id]);

  const handleSave = async () => {
    const currentContent = editorRef.current?.innerText || '';
    try {
      const payload = { title: verse, content: currentContent };
      if (id && id !== 'new') {
        await sermonService.update(id, payload);
        addNotification('Guardado.', 'success');
      } else {
        const newStudy = await sermonService.create(payload);
        navigate(`/sermons/${newStudy.id}`);
      }
    } catch (error) {
      addNotification('Error al guardar.', 'error');
    }
  };

  const handleAnalyze = async () => {
    if (!verse) return;
    setAnalyzing(true);
    try {
      const data = await aiService.analyzeVerse(verse);
      
      const formattedResult = `
ANÁLISIS EXEGÉTICO: ${verse}

1. TIPO LITERARIO:
${data.literary_type}

2. AUTORÍA:
${data.author}

3. PROPÓSITO ORIGINAL:
${data.purpose}

4. CONTEXTO HISTÓRICO:
${data.historical_context}

5. CONTEXTO DE SIGNIFICANCIA:
${data.significance_context}

-------------------------------------------
Notas adicionales:
`;
      if (editorRef.current) {
        editorRef.current.innerText = formattedResult;
      }
      addNotification('Análisis listo.', 'success');
    } catch (error: any) {
      addNotification('Error en la consulta.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'keynote') => {
    if (!id || id === 'new') return;
    try {
      if (format === 'pdf') await exportService.exportToPDF(id);
      else await exportService.exportToKeynote(id);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="loading-screen">Cargando...</div>;

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
          <Button onClick={handleAnalyze} disabled={analyzing || !verse}>
            {analyzing ? '...' : t('editor.analyze_btn')}
          </Button>
        </div>
        
        <div className="header-actions">
          <Button variant="outline" onClick={() => navigate('/sermons')}>Estudios</Button>
          <Button onClick={handleSave}>Guardar</Button>
        </div>
      </div>

      <div className="sermon-editor-main">
        <div className="editor-pane">
          {/* Editor Enriquecido usando contentEditable */}
          <div 
            ref={editorRef}
            className="rich-editor" 
            contentEditable 
            suppressContentEditableWarning
          />
        </div>
        
        <div className="sidebar-pane">
          <div className="export-panel">
            <h3>Exportar</h3>
            <div className="export-buttons">
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>PDF</Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('keynote')}>Keynote</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SermonEditor;
