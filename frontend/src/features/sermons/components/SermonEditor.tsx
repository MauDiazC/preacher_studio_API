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
  const [isSaving, setIsSaving] = useState(false);
  const [currentLocations, setCurrentLocations] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<any>(null);

  const formatAnalysisHtml = (text: string) => {
    // Reemplaza el título principal, los subtítulos numerados y los títulos de versión con clases de estilo
    return text
      .replace(/ANÁLISIS EXEGÉTICO: (.*)/g, '<h1 class="editor-title" style="font-size: 1.5rem; margin-top: 0">ANÁLISIS EXEGÉTICO: $1</h1>')
      .replace(/(\d+\.\s+[A-ZÁÉÍÓÚÑ\s\(\)]+:)/g, '<span class="editor-title">$1</span>')
      .replace(/(VERSIÓN [A-Z0-9\s]+:)/g, '<span class="editor-title" style="opacity: 0.8; font-size: 1.1rem">$1</span>');
  };

  useEffect(() => {
    const fetchSermon = async () => {
      if (id && id !== 'new') {
        try {
          const data = await sermonService.getById(id);
          setVerse(data.title || '');
          
          // Aseguramos que el componente esté renderizado antes de inyectar HTML
          const checkExist = setInterval(() => {
            if (editorRef.current) {
              editorRef.current.innerHTML = formatAnalysisHtml(data.content || '');
              clearInterval(checkExist);
              setLoading(false);
            }
          }, 50);
          
          // Limpieza de seguridad por si algo falla
          setTimeout(() => clearInterval(checkExist), 2000);

        } catch (error) {
          addNotification('Error al cargar.', 'error');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchSermon();
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

  const handleSave = async (forcedContent?: string, forcedTitle?: string, silent: boolean = false) => {
    const currentContent = forcedContent !== undefined ? forcedContent : (editorRef.current?.innerText || '');
    const currentTitle = forcedTitle !== undefined ? forcedTitle : verse;
    
    if (!currentTitle) {
      if (!silent) addNotification('El título (pasaje) es requerido.', 'error');
      return null;
    }

    if (silent) setIsSaving(true);

    try {
      const payload = { title: currentTitle, content: currentContent };
      if (id && id !== 'new') {
        await sermonService.update(id, payload);
        if (!silent) addNotification('Guardado.', 'success');
        return id;
      } else {
        const newStudy = await sermonService.create(payload);
        if (!silent) addNotification('Estudio guardado.', 'success');
        navigate(`/sermons/${newStudy.id}`, { replace: true });
        return newStudy.id;
      }
    } catch (error: any) {
      if (!silent) {
        const msg = error.response?.data?.message || error.message || 'Error al guardar';
        addNotification(msg, 'error');
      }
      console.error('Save Error:', error);
      return null;
    } finally {
      if (silent) {
        setTimeout(() => setIsSaving(false), 1000);
      }
    }
  };

  const handleAutoSaveTrigger = () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(undefined, undefined, true);
    }, 3000); // 3 segundos de inactividad
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
      setCurrentLocations(data.key_locations || []);
      
      const analysisText = `
ANÁLISIS EXEGÉTICO: ${validatedVerse}

VERSIÓN RVR1960:
${data.version_rv1960}

VERSIÓN NVI:
${data.version_nvi}

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

6. IDIOMAS ORIGINALES (GRIEGO/HEBREO):
${data.original_languages}

7. ATRIBUCIÓN Y FUENTES:
${data.source_attribution}

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

  const getResourceLinks = (verseRef: string) => {
    // Mapeo simple de libros comunes para BibleHub (Inglés)
    const bookMap: { [key: string]: string } = {
      'Juan': 'john', 'Mateo': 'matthew', 'Marcos': 'mark', 'Lucas': 'lucas',
      'Romanos': 'romans', 'Génesis': 'genesis', 'Éxodo': 'exodus', 'Salmos': 'psalms',
      'Proverbios': 'proverbs', 'Apocalipsis': 'revelation', 'Hechos': 'acts'
    };

    const cleanRef = verseRef.trim();
    const parts = cleanRef.split(' ');
    const book = parts[0];
    const chapterVerse = parts[parts.length - 1] || '';
    const formattedChapterVerse = chapterVerse.replace(':', '-');
    
    const englishBook = bookMap[book] || book.toLowerCase();
    
    return {
      bibleHub: `https://biblehub.com/interlinear/${englishBook}/${formattedChapterVerse}.htm`,
      blueLetter: `https://www.blueletterbible.org/search/preSearch.cfm?Criteria=${encodeURIComponent(cleanRef)}`
    };
  };

  if (loading) return <div className="loading-screen">Cargando...</div>;

  const links = getResourceLinks(verse);

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
          {isSaving && <span className="saving-indicator">Guardando...</span>}
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
            onInput={handleAutoSaveTrigger}
          />
        </div>
        
        <div className="sidebar-pane">
          {/* Panel de Recursos - Solo visible si hay contenido (análisis listo) */}
          {editorRef.current?.innerText.trim() && (
            <div className="export-panel">
              <h3>Recursos: {verse}</h3>
              <div className="resource-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <a 
                  href={links.bibleHub}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="resource-link"
                  style={{ 
                    color: 'var(--accent-purple)', 
                    textDecoration: 'none', 
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>🌐</span> Interlineal Griego/Hebreo
                </a>
                <a 
                  href={links.blueLetter}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="resource-link"
                  style={{ 
                    color: 'var(--accent-purple)', 
                    textDecoration: 'none', 
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>📖</span> Concordancia y Léxico
                </a>

                {currentLocations.length > 0 && (
                  <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Mapas Geográficos:</p>
                    {currentLocations.map((loc, i) => (
                      <a 
                        key={i}
                        href={`https://biblehub.com/maps/${loc.toLowerCase().replace(/\s+/g, '_')}.htm`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="resource-link"
                        style={{ 
                          color: 'var(--accent-gold)', 
                          textDecoration: 'none', 
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.3rem'
                        }}
                      >
                        <span>📍</span> {loc}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

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
