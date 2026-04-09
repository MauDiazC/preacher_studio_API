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
    exegesis: '',
    homiletics: '',
    application: '',
    additional_notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedLabel, setLastSavedLabel] = useState<string>('');

  // Formatear nombre: Mauricio Diaz -> Mauricio D. (Sin icono)
  const formatUserName = (fullName?: string) => {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    if (parts.length < 2) return parts[0];
    return `${parts[0]} ${parts[1][0]}.`;
  };

  // Calcular tiempo relativo de guardado
  const updateSavedLabel = (updatedAt?: string) => {
    if (!updatedAt) {
      setLastSavedLabel(language === 'es' ? 'Sin guardar' : 'Not saved');
      return;
    }
    const diff = Math.floor((new Date().getTime() - new Date(updatedAt).getTime()) / 60000);
    if (diff < 1) setLastSavedLabel(language === 'es' ? 'Recién guardado' : 'Just saved');
    else setLastSavedLabel(`${t('editor.saved_ago')} ${diff} min`);
  };

  useEffect(() => {
    const timer = setInterval(() => updateSavedLabel(sermon.updated_at), 60000);
    return () => clearInterval(timer);
  }, [sermon.updated_at, language]);

  const isAdmin = user?.role === 'admin' || user?.email === 'diazzabala@gmail.com';
  const credits = 25;

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
      updateSavedLabel(data.updated_at);
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
      setSermon(prev => ({
        ...prev,
        title: `${t('editor.exegesis')} - ${sermon.main_passage}`,
        exegesis: analysis.exegesis,
        homiletics: analysis.homiletics,
        application: analysis.application,
        key_locations: analysis.key_locations,
        historical_context: analysis.historical_context
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
        updateSavedLabel(updated.updated_at);
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

  if (loading && !sermon.exegesis) return (
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
                {isAdmin ? t('nav.unlimited') : credits}
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
        {/* Editor Top Bar - Fixed size inputs */}
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
              disabled={loading}
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

          <div className="editor-user-info">
            <span className="user-name-display">{formatUserName(user?.full_name)}</span>
          </div>
        </header>

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
              <section className="analysis-box">
                <h4 className="analysis-label">{t('editor.exegesis')}</h4>
                <div className="analysis-text">{sermon.exegesis || t('editor.write_here')}</div>
              </section>

              <section className="analysis-box">
                <h4 className="analysis-label">{t('editor.homiletics')}</h4>
                <div className="analysis-text">{sermon.homiletics || t('editor.write_here')}</div>
              </section>

              <section className="analysis-box">
                <h4 className="analysis-label">{t('editor.application')}</h4>
                <div className="analysis-text">{sermon.application || t('editor.write_here')}</div>
              </section>
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
      </main>

      {/* Right Tools Panel - Fixed */}
      <aside className="editor-right-tools">
        <div className="tools-header-sacred">
          <span className="material-symbols-outlined">construction</span>
          {t('editor.resources')}
        </div>

        <div className="tool-actions-vertical">
          <button className="tool-btn-sacred">
            <span className="material-symbols-outlined">auto_stories</span>
            <span>Versiones Bíblicas</span>
          </button>
          
          <button className="tool-btn-sacred">
            <span className="material-symbols-outlined">menu_book</span>
            <span>Léxicos Strong</span>
          </button>
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

        <button className="btn-share-bottom">
          <span className="material-symbols-outlined">share</span>
          <span>{language === 'es' ? 'Compartir' : 'Share'}</span>
        </button>
      </aside>
    </div>
  );
};

export default SermonEditor;
