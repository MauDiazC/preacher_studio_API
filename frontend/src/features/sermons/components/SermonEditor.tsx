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

  const formatAnalysisHtml = (text: string) => {
    // Reemplaza el título principal y los subtítulos con clases de estilo
    return text
      .replace(/ANÁLISIS EXEGÉTICO: (.*)/g, '<h1 class="editor-title" style="font-size: 1.5rem; margin-top: 0">ANÁLISIS EXEGÉTICO: $1</h1>')
      .replace(/(\d+\.\s+[A-ZÁÉÍÓÚÑ\s]+:)/g, '<span class="editor-title">$1</span>');
  };

  useEffect(() => {
    if (id && id !== 'new') {
      const fetchSermon = async () => {
        try {
          const data = await sermonService.getById(id);
          setVerse(data.title || '');
          if (editorRef.current) {
            editorRef.current.innerHTML = formatAnalysisHtml(data.content || '');
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

  const validatePassage = (input: string) => {
    // 1. Limpieza inicial: quitar puntos y espacios extras
    let cleanInput = input.trim().replace(/\./g, ' ').replace(/\s+/g, ' ');
    
    // 2. Corregir errores comunes (jan -> Juan)
    if (cleanInput.toLowerCase().startsWith('jan')) {
      cleanInput = cleanInput.replace(/jan/i, 'Juan');
    }
    
    // 3. Regex para validar estructura: [Número opcional] [Libro] [Espacio/Punto] [Capítulo] [:] [Versículo]
    const bibleRegex = /^(\d\s)?([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s*(\d+)([:\s]*\d*)$/;
    const match = cleanInput.match(bibleRegex);
    
    if (!match) return null;

    // 4. Formatear estéticamente (Juan 3:16)
    const [_, num, book, chapter, versePart] = match;
    const formattedBook = book.charAt(0).toUpperCase() + book.slice(1).toLowerCase();
    const formattedNum = num || '';
    const formattedVerse = versePart.replace(/[:\s]/g, '').trim();
    
    return `${formattedNum}${formattedBook} ${chapter}${formattedVerse ? ':' + formattedVerse : ''}`;
  };

  const handleSave = async (forcedContent?: string, forcedTitle?: string) => {
    const currentContent = forcedContent !== undefined ? forcedContent : (editorRef.current?.innerText || '');
    const currentTitle = forcedTitle !== undefined ? forcedTitle : verse;
    
    if (!currentTitle) {
      addNotification('El título (pasaje) es requerido.', 'error');
      return null;
    }

    try {
      const payload = { title: currentTitle, content: currentContent };
      if (id && id !== 'new') {
        await sermonService.update(id, payload);
        addNotification('Guardado.', 'success');
        return id;
      } else {
        const newStudy = await sermonService.create(payload);
        addNotification('Estudio guardado.', 'success');
        navigate(`/sermons/${newStudy.id}`, { replace: true });
        return newStudy.id;
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error al guardar';
      addNotification(msg, 'error');
      console.error('Save Error:', error);
      return null;
    }
  };

  const handleAnalyze = async () => {
    const validatedVerse = validatePassage(verse);
    if (!validatedVerse) {
      addNotification('Por favor ingresa una cita válida (ej: Juan 3:16)', 'error');
      return;
    }
    
    setVerse(validatedVerse);
    setAnalyzing(true);
    try {
      const data = await aiService.analyzeVerse(validatedVerse);
      
      const analysisText = `
ANÁLISIS EXEGÉTICO: ${validatedVerse}

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
        editorRef.current.innerHTML = formatAnalysisHtml(analysisText);
      }
      addNotification('Análisis listo.', 'success');
      
      // Enviamos el título validado directamente para evitar esperar al estado
      await handleSave(analysisText, validatedVerse);
    } catch (error: any) {
      addNotification('Error en la consulta.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'keynote') => {
    let currentId: string | undefined | null = id;
    
    if (!currentId || currentId === 'new') {
      addNotification('Guardando para exportar...', 'info');
      currentId = await handleSave();
    }

    if (!currentId) return;

    try {
      if (format === 'pdf') {
        addNotification('Generando PDF...', 'info');
        await exportService.exportToPDF(currentId);
      } else {
        addNotification('Generando Keynote (PPTX)...', 'info');
        await exportService.exportToKeynote(currentId);
      }
    } catch (error) {
      addNotification('Error al exportar.', 'error');
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
          <Button onClick={() => handleSave()}>Guardar</Button>
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
