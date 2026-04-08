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
  const { language, t } = useLanguage();
  
  const [verse, setVerse] = useState('');
  const [loading, setLoading] = useState(id && id !== 'new' ? true : false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentLocations, setCurrentLocations] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<any>(null);

  const formatAnalysisHtml = (text: string) => {
    if (!text) return '';
    
    // Escapar HTML básico para evitar problemas de renderizado
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Aplicar estilos a títulos y secciones (Soporta EN/ES)
    html = html
      .replace(/(ANÁLISIS EXEGÉTICO|EXEGETICAL ANALYSIS): (.*)/gi, '<h1 class="editor-title main-title">$1: $2</h1>')
      .replace(/(\d+\.\s+[A-ZÁÉÍÓÚÑ\s\(\)]+:)/g, '<span class="editor-title section-title">$1</span>')
      .replace(/((VERSIÓN|VERSION) [A-Z0-9\s]+:)/gi, '<span class="editor-title version-title">$1</span>')
      .replace(/(\d+\.\s+(IDIOMAS ORIGINALES|ORIGINAL LANGUAGES) \(GRIEGO\/HEBREO\):)/gi, '<span class="editor-title original-langs-title">$1</span>');

    // Convertir saltos de línea a <br/> para que se vean en el editor
    return html.replace(/\n/g, '<br/>');
  };

  useEffect(() => {
    let isMounted = true;
    const fetchSermon = async () => {
      if (id && id !== 'new') {
        try {
          const data = await sermonService.getById(id);
          if (!isMounted) return;
          
          setVerse(data.title || '');
          setCurrentLocations(data.key_locations || []);
          
          const contentToInject = data.content || '';
          
          // Inyección forzada con reintentos para contentEditable
          const attemptInjection = (content: string, limit: number) => {
            if (limit <= 0) return;
            if (editorRef.current) {
              const isHtml = content.includes('<br') || content.includes('<span');
              editorRef.current.innerHTML = isHtml ? content : formatAnalysisHtml(content);
              setLoading(false);
            } else {
              setTimeout(() => attemptInjection(content, limit - 1), 50);
            }
          };

          attemptInjection(contentToInject, 40); // 2 segundos de reintentos

        } catch (error) {
          if (isMounted) {
            addNotification('Error al cargar.', 'error');
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    };
    fetchSermon();
    return () => { isMounted = false; };
  }, [id]);

  const validatePassage = (input: string) => {
    let cleanInput = input.trim().replace(/\./g, ' ').replace(/\s+/g, ' ');
    // Soporta formatos internacionales (1 John, 1 Juan)
    const bibleRegex = /^(\d\s)?([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s*(\d+)([:\s]*\d*)$/;
    const match = cleanInput.match(bibleRegex);
    if (!match) return cleanInput; // Si no encaja, devolvemos tal cual

    const [_, num, book, chapter, versePart] = match;
    const formattedBook = book.charAt(0).toUpperCase() + book.slice(1).toLowerCase();
    const formattedNum = num ? num.trim() + ' ' : '';
    const formattedVerse = versePart.replace(/[:\s]/g, '').trim();
    return `${formattedNum}${formattedBook} ${chapter}${formattedVerse ? ':' + formattedVerse : ''}`;
  };

  const handleSave = async (forcedContent?: string, forcedTitle?: string, silent: boolean = false, forcedLocations?: string[]) => {
    const currentContent = forcedContent !== undefined ? forcedContent : (editorRef.current?.innerHTML || '');
    const currentTitle = forcedTitle !== undefined ? forcedTitle : verse;
    const finalLocations = forcedLocations !== undefined ? forcedLocations : currentLocations;
    
    if (!currentTitle) {
      if (!silent) addNotification('El título (pasaje) es requerido.', 'error');
      return null;
    }

    if (silent) setIsSaving(true);

    try {
      const payload = { 
        title: currentTitle, 
        main_passage: currentTitle,
        content: currentContent,
        key_locations: finalLocations 
      };
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
      if (!silent) addNotification('Error al guardar', 'error');
      return null;
    } finally {
      if (silent) setTimeout(() => setIsSaving(false), 1000);
    }
  };

  const handleAutoSaveTrigger = () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => handleSave(undefined, undefined, true), 3000);
  };

  const handleAnalyze = async () => {
    const validatedVerse = validatePassage(verse);
    setVerse(validatedVerse);
    setAnalyzing(true);
    try {
      // Pasamos el idioma actual al servicio de IA
      const data = await aiService.analyzeVerse(validatedVerse, language);
      const locs = data.key_locations || [];
      setCurrentLocations(locs);
      
      const analysisTitle = language === 'es' ? 'ANÁLISIS EXEGÉTICO' : 'EXEGETICAL ANALYSIS';
      const version1Name = language === 'es' ? 'VERSIÓN RVR1960' : 'VERSION KJV';
      const version2Name = language === 'es' ? 'VERSIÓN NVI' : 'VERSION NIV';
      
      // Mapeo dinámico de etiquetas según idioma
      const labels = language === 'es' ? [
        '1. TIPO LITERARIO', '2. AUTORÍA', '3. PROPÓSITO ORIGINAL', 
        '4. CONTEXTO HISTÓRICO', '5. CONTEXTO DE SIGNIFICANCIA', 
        '6. IDIOMAS ORIGINALES (GRIEGO/HEBREO)', '7. ATRIBUCIÓN Y FUENTES'
      ] : [
        '1. LITERARY TYPE', '2. AUTHORSHIP', '3. ORIGINAL PURPOSE',
        '4. HISTORICAL CONTEXT', '5. SIGNIFICANCE CONTEXT',
        '6. ORIGINAL LANGUAGES (GREEK/HEBREW)', '7. ATTRIBUTION AND SOURCES'
      ];

      const analysisText = `
${analysisTitle}: ${validatedVerse}

${version1Name}:
${data.version_rv1960}

${version2Name}:
${data.version_nvi}

${labels[0]}:
${data.literary_type}

${labels[1]}:
${data.author}

${labels[2]}:
${data.purpose}

${labels[3]}:
${data.historical_context}

${labels[4]}:
${data.significance_context}

${labels[5]}:
${data.original_languages}

${labels[6]}:
${data.source_attribution}

-------------------------------------------
${language === 'es' ? 'Notas adicionales' : 'Additional notes'}:
`;
      if (editorRef.current) {
        editorRef.current.innerHTML = formatAnalysisHtml(analysisText);
      }
      addNotification(language === 'es' ? 'Análisis listo.' : 'Analysis ready.', 'success');
      await handleSave(analysisText, validatedVerse, false, locs);
    } catch (error: any) {
      addNotification(language === 'es' ? 'Error en la consulta.' : 'Query error.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'keynote') => {
    let currentId: string | undefined | null = id;
    if (!currentId || currentId === 'new') {
      currentId = await handleSave();
    }
    if (!currentId) return;

    try {
      if (format === 'pdf') {
        addNotification('Generando PDF...', 'info');
        await exportService.exportToPDF(currentId);
      } else {
        addNotification('Generando Keynote...', 'info');
        await exportService.exportToKeynote(currentId);
      }
    } catch (error) {
      addNotification('Error al exportar.', 'error');
    }
  };

  const getResourceLinks = (verseRef: string) => {
    const bookMap: { [key: string]: string } = {
      // ES
      'Génesis': 'genesis', 'Éxodo': 'exodus', 'Levítico': 'leviticus', 'Números': 'numbers', 'Deuteronomio': 'deuteronomy',
      'Mateo': 'matthew', 'Marcos': 'mark', 'Lucas': 'lucas', 'Juan': 'john', 'Hechos': 'acts', 'Romanos': 'romans',
      'Apocalipsis': 'revelation', 'Gálatas': 'galatians', 'Efesios': 'ephesians', 'Filipenses': 'philippians', 'Colosenses': 'colossians',
      // EN Fallback (o si ya vienen en inglés)
      'Genesis': 'genesis', 'Exodus': 'exodus', 'Matthew': 'matthew', 'Mark': 'mark', 'Luke': 'lucas', 'John': 'john', 'Acts': 'acts', 'Romans': 'romans'
    };
    
    const match = verseRef.match(/^(\d\s)?[a-zA-ZáéíóúÁÉÍÓÚñÑ]+/);
    const book = match ? match[0] : '';
    const cvMatch = verseRef.match(/\d+[:\s]?\d*$/);
    const chapterVerse = cvMatch ? cvMatch[0].trim() : '';
    const englishBook = bookMap[book] || book.toLowerCase();
    
    return {
      bibleHub: `https://biblehub.com/interlinear/${englishBook}/${chapterVerse.replace(/[:\s]/g, '-')}.htm`,
      blueLetter: `https://www.blueletterbible.org/search/preSearch.cfm?Criteria=${encodeURIComponent(verseRef)}`
    };
  };

  const translateLocation = (loc: string) => {
    // 1. Mapeo explícito para casos complejos
    const locMap: { [key: string]: string } = {
      'Ponto': 'pontus', 'Pontus': 'pontus',
      'Galacia': 'galatia', 'Galatia': 'galatia',
      'Capadocia': 'cappadocia', 'Cappadocia': 'cappadocia',
      'Asia': 'asia', 'Asia menor': 'asia_minor', 'Asia Minor': 'asia_minor',
      'Bitinia': 'bithynia', 'Bithynia': 'bithynia',
      'Roma': 'rome', 'Rome': 'rome',
      'Jerusalén': 'jerusalem', 'Jerusalem': 'jerusalem',
      'Nazaret': 'nazareth', 'Nazareth': 'nazareth',
      'Belén': 'bethlehem', 'Bethlehem': 'bethlehem',
      'Antioquía': 'antioch', 'Antioch': 'antioch',
      'Corinto': 'corinth', 'Corinth': 'corinth',
      'Éfeso': 'ephesus', 'Ephesus': 'ephesus'
    };

    const cleanName = locMap[loc] || loc;

    // 2. Limpieza de acentos para los que no están en el mapa
    return cleanName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_');
  };

  if (loading) return (
    <div className="loading-screen">
      {language === 'es' ? 'Cargando análisis ministerial...' : 'Loading ministerial analysis...'}
    </div>
  );

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
          {isSaving && <span className="saving-indicator">{language === 'es' ? 'Guardando...' : 'Saving...'}</span>}
        </div>
        
        <div className="header-actions">
          <Button variant="outline" onClick={() => navigate('/sermons')}>
            {language === 'es' ? 'Estudios' : 'Studies'}
          </Button>
          <Button onClick={() => handleSave()}>
            {language === 'es' ? 'Guardar' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="sermon-editor-main">
        <div className="editor-pane">
          <div 
            ref={editorRef}
            className="rich-editor" 
            contentEditable 
            suppressContentEditableWarning
            onInput={handleAutoSaveTrigger}
          />
        </div>
        
        <div className="sidebar-pane">
          <div className="export-panel">
            <h3>{language === 'es' ? 'Recursos' : 'Resources'}: {verse}</h3>
            <div className="resource-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <a href={links.bibleHub} target="_blank" rel="noopener noreferrer" className="resource-link-item">
                🌐 {language === 'es' ? 'Interlineal' : 'Interlinear'}
              </a>
              <a href={links.blueLetter} target="_blank" rel="noopener noreferrer" className="resource-link-item">
                📖 {language === 'es' ? 'Léxico Strong' : 'Strong Lexicon'}
              </a>
              {currentLocations.map((loc, i) => (
                <a key={i} href={`https://biblehub.com/atlas/${translateLocation(loc)}.htm`} target="_blank" rel="noopener noreferrer" className="resource-link-map">
                  📍 {loc}
                </a>
              ))}
            </div>
          </div>

          <div className="export-panel">
            <h3>{language === 'es' ? 'Exportar' : 'Export'}</h3>
            <div className="export-buttons-vertical">
              <Button variant="outline" onClick={() => handleExport('pdf')}>PDF</Button>
              <Button variant="outline" onClick={() => handleExport('keynote')}>Keynote</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SermonEditor;
