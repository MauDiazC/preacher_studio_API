import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sermonService } from '../services/sermonService';
import type { Sermon } from '../services/sermonService';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useAuthStore } from '../../../store/authStore';
import { useLanguage } from '../../../context/LanguageContext';
import './SermonEditor.css';

const SermonEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { user, logout } = useAuthStore();
  const { t, language, toggleLanguage } = useLanguage();

  const [sermon, setSermon] = useState<Partial<Sermon>>({
    title: '',
    main_passage: '',
    content: '',
    additional_notes: '',
    key_locations: []
  });
  
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedLabel, setLastSavedLabel] = useState<string>('');

  // Formatear nombre: Mauricio Diaz -> Mauricio D.
  const formatUserName = (fullName?: string, email?: string) => {
    const rawName = fullName || email || '';
    if (!rawName) return 'Invitado';
    const parts = rawName.split(/[ @\.]/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1][0].toUpperCase()}.`;
    }
    return rawName.charAt(0).toUpperCase() + rawName.slice(1);
  };

  // Lógica de Admin y Créditos (Forzada)
  const userEmail = user?.email?.toLowerCase() || '';
  const isAdmin = userEmail === 'diazzabala@gmail.com' || user?.role === 'admin';

  // Formatear tiempo relativo legible
  const formatRelativeTime = (updatedAt?: string) => {
    if (!updatedAt) return language === 'es' ? 'Sin guardar' : 'Not saved';
    
    const diffMs = new Date().getTime() - new Date(updatedAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return language === 'es' ? 'Recién guardado' : 'Just saved';
    if (diffMins < 60) return `${t('editor.saved_ago')} ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      const remainingMins = diffMins % 60;
      return `${t('editor.saved_ago')} ${diffHours}h ${remainingMins}m`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    return `${t('editor.saved_ago')} ${diffDays}d ${remainingHours}h`;
  };

  useEffect(() => {
    const timer = setInterval(() => setLastSavedLabel(formatRelativeTime(sermon.updated_at)), 60000);
    setLastSavedLabel(formatRelativeTime(sermon.updated_at));
    return () => clearInterval(timer);
  }, [sermon.updated_at, language]);

  useEffect(() => {
    if (id) {
      loadSermon(id);
    }
  }, [id]);

  const loadSermon = async (sermonId: string) => {
    try {
      setLoading(true);
      const data = await sermonService.getById(sermonId);
      setSermon(data);
    } catch (error) {
      addNotification('Error al cargar el estudio.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnalysis = async () => {
    if (!sermon.main_passage) {
      addNotification('Por favor ingresa un versículo.', 'error');
      return;
    }

    setLoading(true);
    try {
      const analysis = await sermonService.generateAnalysis(sermon.main_passage);
      const fullContent = `${analysis.exegesis}\n\n${analysis.homiletics}\n\n${analysis.application}`;
      setSermon(prev => ({
        ...prev,
        title: `${t('editor.exegesis')} - ${sermon.main_passage}`,
        content: fullContent,
        key_locations: analysis.key_locations
      }));
      addNotification('Análisis generado con éxito.', 'success');
    } catch (error) {
      addNotification('Error al generar el análisis ministerial.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (id) {
        const updated = await sermonService.update(id, sermon);
        setSermon(updated);
        addNotification('Estudio actualizado.', 'success');
      } else {
        const created = await sermonService.create(sermon);
        setSermon(created);
        addNotification('Estudio guardado.', 'success');
        navigate(`/sermons/${created.id}`);
      }
    } catch (error) {
      addNotification('Error al guardar.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Formato Correcto para Bible Hub Atlas
  const getMapLink = (location: string) => {
    const formattedLoc = location.toLowerCase().trim().replace(/\s+/g, '_');
    return `https://biblehub.com/atlas/${formattedLoc}.htm`;
  };

  // Formato Correcto para Blue Letter Bible
  const getBLBLink = (passage: string) => {
    const query = passage.replace(/\s+/g, '+');
    return `https://www.blueletterbible.org/search/preSearch.cfm?Criteria=${query}&t=KJV`;
  };

  if (loading && !sermon.content) return (
    <div className="loading-screen-editor">
      <div className="loader-ministerial"></div>
      <p>{t('list.loading')}</p>
    </div>
  );

  return (
    <div className="sermon-editor-page">
      {/* Side Navigation - Fixed */}
      <aside className="sacred-sidebar-editor">
        <div className="sidebar-brand">
          <div className="brand-icon-box">
            <span className="material-symbols-outlined">menu_book</span>
          </div>
          <div>
            <h1 className="brand-text-pulp">Preacher Studio</h1>
            <p className="brand-tagline-sm">{t('auth.inspired_prep')}</p>
          </div>
        </div>

        <nav className="sacred-nav">
          <Link to="/sermons" className="nav-item">
            <span className="material-symbols-outlined nav-icon">book_2</span>
            <span>{t('nav.library')}</span>
          </Link>
          <Link to="/sermons/new" className="nav-item active">
            <span className="material-symbols-outlined nav-icon">edit_note</span>
            <span>{t('nav.sermon_prep')}</span>
          </Link>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined nav-icon">settings</span>
            <span>{t('nav.settings')}</span>
          </a>
        </nav>

        <div className="sidebar-footer-sacred">
          <div className="sidebar-user-stats">
            <div className="credits-display">
              <span className="credits-label">{t('nav.credits')}</span>
              <span className="credits-value">
                {isAdmin ? t('nav.unlimited') : '25'}
              </span>
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

        <button className="new-study-btn-sidebar" onClick={() => navigate('/sermons/new')}>
          <span className="material-symbols-outlined">add</span>
          <span>{t('list.new_study_btn')}</span>
        </button>
      </aside>

      {/* Main Workspace */}
      <main className="editor-main-workspace">
        {/* Editor Top Bar */}
        <header className="editor-header-sacred">
          <div className="verse-input-aligned-group">
            <div className="verse-input-wrapper">
              <span className="material-symbols-outlined verse-icon">auto_awesome</span>
              <input 
                type="text" 
                className="verse-input-sacred"
                placeholder={t('editor.verse_placeholder')}
                value={sermon.main_passage}
                onChange={(e) => setSermon({...sermon, main_passage: e.target.value})}
              />
            </div>
            <button 
              className="btn-generate-sacred" 
              onClick={handleGenerateAnalysis}
              disabled={loading || !!id}
            >
              {loading ? '...' : t('editor.analyze_btn')}
            </button>
            
            <button 
              className="btn-save-top-sacred" 
              onClick={handleSave}
              disabled={isSaving}
            >
              <span className="material-symbols-outlined">save</span>
              {isSaving ? '...' : language === 'es' ? 'Guardar' : 'Save'}
            </button>
          </div>

          <div className="editor-user-info-box">
            <span className="user-name-header">{formatUserName(user?.full_name, user?.email)}</span>
          </div>
        </header>

        <div className="editor-dashboard-integrated">
          {/* Studio Content Canvas */}
          <div className="editor-canvas-container">
            <div className="studio-main-card">
              <div className="card-top-header">
                <input 
                  type="text" 
                  className="editor-title-input"
                  placeholder={t('list.col_reference')}
                  value={sermon.title}
                  onChange={(e) => setSermon({...sermon, title: e.target.value})}
                />
                <div className="save-status">
                  <span className="material-symbols-outlined">cloud_done</span>
                  {lastSavedLabel}
                </div>
              </div>

              <div className="analysis-grid-uniform">
                <div className="analysis-text-pure">
                  {sermon.content || t('editor.write_here')}
                </div>
              </div>

              <div className="editor-notes-section">
                <label className="notes-label">{t('editor.write_here')}</label>
                <textarea 
                  className="editor-textarea-sacred"
                  placeholder="..."
                  value={sermon.additional_notes}
                  onChange={(e) => setSermon({...sermon, additional_notes: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Tools - Integrated Column */}
          <aside className="editor-right-tools-integrated">
            <div className="tools-header-sacred">
              <span className="material-symbols-outlined">construction</span>
              {t('editor.resources')}
            </div>

            <div className="tool-actions-vertical">
              <a 
                href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(sermon.main_passage || '')}&version=${language === 'es' ? 'RVR1960' : 'NIV'}`} 
                target="_blank" 
                rel="noreferrer"
                className="tool-btn-sacred-link"
              >
                <span className="material-symbols-outlined">auto_stories</span>
                <span>{t('editor.bible_versions')}</span>
              </a>
              
              <a 
                href={getBLBLink(sermon.main_passage || '')} 
                target="_blank" 
                rel="noreferrer"
                className="tool-btn-sacred-link"
              >
                <span className="material-symbols-outlined">menu_book</span>
                <span>{t('editor.strong_lexicon')}</span>
              </a>

              <div className="maps-resource-group">
                <p className="resource-sublabel">{t('editor.biblical_maps')}</p>
                {sermon.key_locations && sermon.key_locations.length > 0 ? (
                  sermon.key_locations.map((loc, idx) => (
                    <a 
                      key={idx}
                      href={getMapLink(loc)} 
                      target="_blank" 
                      rel="noreferrer"
                      className="map-link-item"
                    >
                      <span className="material-symbols-outlined">map</span>
                      <span>{loc}</span>
                    </a>
                  ))
                ) : (
                  <p className="no-resource-text">{language === 'es' ? 'No hay lugares' : 'No locations'}</p>
                )}
              </div>
            </div>

            <div className="export-section-sacred">
              <p className="section-subtitle-sacred">EXPORTAR</p>
              <div className="export-grid">
                <button className="export-icon-btn">
                  <span className="material-symbols-outlined">picture_as_pdf</span>
                  PDF
                </button>
                <button className="export-icon-btn">
                  <span className="material-symbols-outlined">present_to_all</span>
                  PPTX/Keynote
                </button>
              </div>
            </div>

            <button className="btn-share-integrated">
              <span className="material-symbols-outlined">share</span>
              <span>{t('editor.share_btn')}</span>
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SermonEditor;
