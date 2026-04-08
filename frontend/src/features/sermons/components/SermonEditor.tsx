import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { aiService } from '../services/aiService';
import { sermonService } from '../services/sermonService';
import { exportService } from '../services/exportService';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useAuthStore } from '../../../store/authStore';
import { useLanguage } from '../../../context/LanguageContext';
import './SermonEditor.css';

const SermonEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { language, t, toggleLanguage } = useLanguage();
  const { logout } = useAuthStore();
  
  const [verse, setVerse] = useState('');
  const [loading, setLoading] = useState(id && id !== 'new' ? true : false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentLocations, setCurrentLocations] = useState<string[]>([]);
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<any>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatAnalysisHtml = (text: string) => {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html
      .replace(/(ANÁLISIS EXEGÉTICO|EXEGETICAL ANALYSIS): (.*)/gi, '<h1 class="editor-title main-title">$1: $2</h1>')
      .replace(/(\d+\.\s+[A-ZÁÉÍÓÚÑ\s\(\)]+:)/g, '<span class="editor-title section-title">$1</span>')
      .replace(/((VERSIÓN|VERSION) [A-Z0-9\s]+:)/gi, '<span class="editor-title version-title">$1</span>')
      .replace(/(\d+\.\s+(IDIOMAS ORIGINALES|ORIGINAL LANGUAGES) \(GRIEGO\/HEBREO\):)/gi, '<span class="editor-title original-langs-title">$1</span>');

    return html.replace(/\n/g, '<br/>');
  };

  useEffect(() => {
    let isMounted = true;
    const fetchSermon = async () => {
      if (id && id !== 'new') {
        try {
          const data = await sermonService.getById(id);
          if (!isMounted) return;
          setVerse(data.main_passage || data.title || '');
          setTitle(data.title || '');
          setCurrentLocations(data.key_locations || []);
          setInitialContent(data.content || '');
          setDataLoaded(true);
          setLoading(false);
        } catch (error) {
          if (isMounted) {
            addNotification('Error al cargar.', 'error');
            setLoading(false);
          }
        }
      } else {
        setDataLoaded(true);
        setLoading(false);
      }
    };
    fetchSermon();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    if (dataLoaded && editorRef.current && initialContent !== null) {
      const isHtml = initialContent.includes('<br') || initialContent.includes('<span');
      editorRef.current.innerHTML = isHtml ? initialContent : formatAnalysisHtml(initialContent);
    }
  }, [dataLoaded, initialContent]);

  const validatePassage = (input: string) => {
    let cleanInput = input
      .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s:]/g, ' ')
      .replace(/\./g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const bibleRegex = /^(\d\s)?([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s*(\d+)([:\s]*\d*)$/;
    const match = cleanInput.match(bibleRegex);
    if (!match) return cleanInput;

    const [_, num, book, chapter, versePart] = match;
    const formattedBook = book.charAt(0).toUpperCase() + book.slice(1).toLowerCase();
    const formattedNum = num ? num.trim() + ' ' : '';
    const formattedVerse = versePart.replace(/[:\s]/g, '').trim();
    return `${formattedNum}${formattedBook} ${chapter}${formattedVerse ? ':' + formattedVerse : ''}`;
  };

  const handleSave = async (forcedContent?: string, forcedTitle?: string, silent: boolean = false, forcedLocations?: string[]) => {
    const currentContent = forcedContent !== undefined ? forcedContent : (editorRef.current?.innerHTML || '');
    const currentTitle = forcedTitle !== undefined ? (forcedTitle || title || verse) : (title || verse);
    const finalLocations = forcedLocations !== undefined ? forcedLocations : currentLocations;
    
    if (!currentTitle) {
      if (!silent) addNotification('El título es requerido.', 'error');
      return null;
    }

    if (silent) setIsSaving(true);

    try {
      const payload = { 
        title: currentTitle, 
        main_passage: verse,
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
      const data = await aiService.analyzeVerse(validatedVerse, language);
      const locs = data.key_locations || [];
      setCurrentLocations(locs);
      
      const analysisTitle = language === 'es' ? 'ANÁLISIS EXEGÉTICO' : 'EXEGETICAL ANALYSIS';
      const version1Name = language === 'es' ? 'VERSIÓN RVR1960' : 'VERSION KJV';
      const version2Name = language === 'es' ? 'VERSIÓN NVI' : 'VERSION NIV';
      
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
      if (!title) setTitle(`${validatedVerse}`);
      addNotification(language === 'es' ? 'Análisis listo.' : 'Analysis ready.', 'success');
      await handleSave(analysisText, title || validatedVerse, false, locs);
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
      'Génesis': 'genesis', 'Éxodo': 'exodus', 'Levítico': 'leviticus', 'Números': 'numbers', 'Deuteronomio': 'deuteronomy',
      'Mateo': 'matthew', 'Marcos': 'mark', 'Lucas': 'lucas', 'Juan': 'john', 'Hechos': 'acts', 'Romanos': 'romans',
      'Apocalipsis': 'revelation', 'Gálatas': 'galatians', 'Efesios': 'ephesians', 'Filipenses': 'philippians', 'Colosenses': 'colossians',
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
    const locMap: { [key: string]: string } = {
      'Ponto': 'pontus', 'Pontus': 'pontus', 'Galacia': 'galatia', 'Galatia': 'galatia',
      'Capadocia': 'cappadocia', 'Cappadocia': 'cappadocia', 'Asia': 'asia', 'Asia menor': 'asia_minor',
      'Bitinia': 'bithynia', 'Bithynia': 'bithynia', 'Roma': 'rome', 'Rome': 'rome',
      'Jerusalén': 'jerusalem', 'Jerusalem': 'jerusalem', 'Nazaret': 'nazareth', 'Nazareth': 'nazareth',
      'Belén': 'bethlehem', 'Bethlehem': 'bethlehem', 'Antioquía': 'antioch', 'Antioch': 'antioch',
      'Corinto': 'corinth', 'Corinth': 'corinth', 'Éfeso': 'ephesus', 'Ephesus': 'ephesus'
    };
    const cleanName = locMap[loc] || loc;
    return cleanName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/\s+/g, '_');
  };

  if (loading) return (
    <div className="loading-screen" style={{ backgroundColor: '#111127', color: '#b0c6ff' }}>
      {language === 'es' ? 'Cargando análisis ministerial...' : 'Loading ministerial analysis...'}
    </div>
  );

  const links = getResourceLinks(verse);

  return (
    <div className="sermon-editor-sacred-page">
      {/* Side Navigation */}
      <aside className="sacred-sidebar-editor">
        <div className="brand-box-editor">
          <div className="brand-icon-box">
            <span className="material-symbols-outlined">auto_stories</span>
          </div>
          <div>
            <h1 className="brand-text-pulpit">The Pulpit</h1>
            <p className="brand-tagline-sm">Inspired Preparation</p>
          </div>
        </div>

        <button className="new-study-btn-sidebar" onClick={() => navigate('/sermons/new')}>
          <span className="material-symbols-outlined">add</span>
          <span>{t('list.new_study_btn')}</span>
        </button>

        <nav className="sacred-nav" style={{ marginTop: '2rem' }}>
          <Link to="/sermons" className="nav-item">
            <span className="material-symbols-outlined nav-icon">book_2</span>
            <span>{t('nav.library')}</span>
          </Link>
          <Link to="/sermons/new" className={`nav-item ${id === 'new' ? 'active' : ''}`}>
            <span className="material-symbols-outlined nav-icon">edit_note</span>
            <span>{t('nav.sermon_prep')}</span>
          </Link>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined nav-icon">menu_book</span>
            <span>{t('nav.theology')}</span>
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined nav-icon">inventory_2</span>
            <span>{t('nav.archives')}</span>
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined nav-icon">settings</span>
            <span>{t('nav.settings')}</span>
          </a>
        </nav>

        <div className="sidebar-footer-sacred">
          <div className="sidebar-user-stats">
            <div className="stat-pill-mini">
              <span>✨ 25</span>
            </div>
            <button className="lang-toggle-sidebar" onClick={toggleLanguage}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>language</span>
              {language.toUpperCase()}
            </button>
          </div>
          
          <button className="logout-btn-sidebar" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            <span>{t('nav.logout').toUpperCase()}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="editor-main-canvas">
        <div className="editor-celestial-bg">
          <div className="orbit-editor-1"></div>
          <div className="orbit-editor-2"></div>
        </div>

        {/* Top Header Bar */}
        <header className="editor-top-header">
          <div className="header-input-zone">
            <div className="sacred-verse-input-wrapper">
              <input 
                className="sacred-verse-input"
                type="text" 
                placeholder={t('editor.verse_placeholder')}
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
              />
            </div>
            <button 
              className="btn-generate-sacred" 
              onClick={handleAnalyze} 
              disabled={analyzing || !verse}
            >
              <span className="material-symbols-outlined">temp_preferences_custom</span>
              <span>{analyzing ? '...' : t('editor.generate_analysis')}</span>
            </button>
            {isSaving && <span style={{ fontSize: '10px', color: '#b0c6ff', opacity: 0.6 }}>{t('editor.saved_ago')}...</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <button className="page-arrow" style={{ opacity: 0.6 }}><span className="material-symbols-outlined">notifications</span></button>
             <div style={{ width: '1px', height: '2rem', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
             <span style={{ fontSize: '0.875rem', color: '#c2c1ff' }}>Pbro. Daniel M.</span>
          </div>
        </header>

        {/* Editor Workspace */}
        <div className="editor-workspace-split">
          <div className="editor-central-area custom-scrollbar-sacred">
            <div className="editor-max-width-container">
              {/* Progress Ribbon */}
              <div className="sacred-progress-ribbon">
                <div className="progress-steps">
                  <div className="step-indicator" style={{ color: '#b0c6ff' }}>
                    <div className="step-dot"></div>
                    <span>{t('editor.exegesis')}</span>
                  </div>
                  <div className="step-indicator" style={{ opacity: 0.4 }}>
                    <div className="step-dot"></div>
                    <span>{t('editor.homiletics')}</span>
                  </div>
                  <div className="step-indicator" style={{ opacity: 0.4 }}>
                    <div className="step-dot"></div>
                    <span>{t('editor.application')}</span>
                  </div>
                </div>
                <span style={{ fontSize: '10px', opacity: 0.5 }}>{t('editor.saved_ago')} 2m</span>
              </div>

              {/* Title and Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <input 
                  type="text" 
                  className="sacred-rich-editor" 
                  style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '3.5rem', fontWeight: 700, fontFamily: 'Noto Serif' }}
                  placeholder={language === 'es' ? 'Título del Sermón' : 'Sermon Title'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleSave()}
                />
                
                <div className="flex flex-wrap gap-2">
                  <span className="sacred-tag tag-secondary">{verse || 'Sin pasaje'}</span>
                  <span className="sacred-tag tag-secondary">Estudio Exegético</span>
                </div>

                <div 
                  ref={editorRef}
                  className="sacred-rich-editor custom-scrollbar-sacred" 
                  contentEditable 
                  suppressContentEditableWarning
                  onInput={handleAutoSaveTrigger}
                  data-placeholder={t('editor.write_here')}
                />
              </div>
            </div>
          </div>

          {/* Resources Side Panel */}
          <aside className="editor-resources-panel custom-scrollbar-sacred">
            <div className="export-grid-sacred">
              <button className="btn-export-sacred" onClick={() => handleExport('pdf')}>
                <span className="material-symbols-outlined">picture_as_pdf</span>
                <span>{t('editor.export_pdf')}</span>
              </button>
              <button className="btn-export-sacred" onClick={() => handleExport('keynote')}>
                <span className="material-symbols-outlined">present_to_all</span>
                <span>{t('editor.export_keynote')}</span>
              </button>
            </div>

            <div className="resource-section-title">
              <h3>{t('editor.resources')}</h3>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem', opacity: 0.4 }}>auto_awesome</span>
            </div>

            <div className="sacred-resource-card" onClick={() => window.open(links.bibleHub, '_blank')}>
              <div className="resource-card-header">
                <span className="resource-card-name">Interlineal {verse}</span>
                <span className="resource-card-tag">Bible Hub</span>
              </div>
              <p className="resource-card-desc">Acceso directo al texto original griego/hebreo con morfología.</p>
            </div>

            <div className="sacred-resource-card" onClick={() => window.open(links.blueLetter, '_blank')}>
              <div className="resource-card-header">
                <span className="resource-card-name">Léxico Strong</span>
                <span className="resource-card-tag">BLB</span>
              </div>
              <p className="resource-card-desc">Diccionario exhaustivo de términos originales y concordancia.</p>
            </div>

            {currentLocations.map((loc, i) => (
              <div key={i} className="sacred-resource-card" onClick={() => window.open(`https://biblehub.com/atlas/${translateLocation(loc)}.htm`, '_blank')}>
                <div className="resource-card-header">
                  <span className="resource-card-name">Mapa: {loc}</span>
                  <span className="resource-card-tag">Atlas</span>
                </div>
                <p className="resource-card-desc">Ubicación geográfica histórica y contexto arqueológico.</p>
              </div>
            ))}

            <div className="visual-interlinear-box">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA-PAwupCqq7Rm7J2SJajEHT9FdVa_cE_VBoF1rZXUS0KQC4pvx8OrkHhLixUbw7eTSbD5WdnFVUtamPF87GtjHH3hDTj_dxEsRjZBaUDqiApXVEgVJsXPhUpc73FhQstAc7aXZtx0Cca18yK5G8gxkfIzDDFuSMrfVKxLxqcMWspDo1J0pXc5EaJ4BhphOThaZsfeDWFxh84D9I6hHgnZYgPneYCOcqCJGNhzeOYvihgWDXvGRaie9RDNJYO9v0ved5axlIkAdTM" 
                alt="Interlinear" 
                className="interlinear-bg-img"
              />
              <div className="interlinear-overlay">
                <span className="sacred-tag tag-secondary" style={{ width: 'fit-content', marginBottom: '0.5rem' }}>{t('editor.visual_interlinear')}</span>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700 }}>Ver estructura literaria avanzada</h4>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button className="nav-item" style={{ width: '100%', padding: '0.5rem' }}>
                <span className="material-symbols-outlined nav-icon">history</span>
                <span>{t('editor.previous_versions')}</span>
              </button>
              <button className="nav-item" style={{ width: '100%', padding: '0.5rem' }}>
                <span className="material-symbols-outlined nav-icon">share</span>
                <span>{t('editor.share_draft')}</span>
              </button>
            </div>
          </aside>
        </div>
      </main>

      <button className="sacred-fab-save" onClick={() => handleSave()}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
      </button>
    </div>
  );
};

export default SermonEditor;
