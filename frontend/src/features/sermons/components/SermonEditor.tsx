import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { sermonService } from '../services/sermonService';
import type { Sermon } from '../services/sermonService';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useAuthStore } from '../../../store/authStore';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import './SermonEditor.css';

const SermonEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotificationStore();
  const { user, logout } = useAuthStore();
  const { t, language, toggleLanguage } = useLanguage();

  const initialState = {
    title: '', main_passage: '', content: '', additional_notes: '', key_locations: []
  };

  const [sermon, setSermon] = useState<Partial<Sermon>>(initialState);
  const [userProfile, setUserProfile] = useState<{full_name?: string, is_admin?: boolean, credits_remaining?: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedLabel, setLastSavedLabel] = useState<string>('');

  // RESET ESTADO SI CAMBIA A NUEVO ESTUDIO
  useEffect(() => {
    if (!id) {
      setSermon(initialState);
      setLastSavedLabel('');
    } else {
      loadSermon(id);
    }
  }, [id, location.pathname]);

  const loadProfile = async () => {
    try {
      const response = await api.get('/profile/');
      setUserProfile(response.data);
    } catch (err) {
      console.error("Error perfil:", err);
    }
  };

  const userEmail = user?.email?.toLowerCase() || '';
  const isAdmin = userProfile?.is_admin || userEmail === 'diazzabala@gmail.com';
  const credits = userProfile?.credits_remaining ?? 0;

  const formatRelativeTime = (updatedAt?: string) => {
    if (!updatedAt) return language === 'es' ? 'Nuevo' : 'New';
    const diffMs = new Date().getTime() - new Date(updatedAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return language === 'es' ? 'Recién guardado' : 'Just saved';
    if (diffMins < 60) return `${t('editor.saved_ago')} ${diffMins}m`;
    const h = Math.floor(diffMins / 60);
    if (h < 24) return `${t('editor.saved_ago')} ${h}h ${diffMins % 60}m`;
    const d = Math.floor(h / 24);
    return `${t('editor.saved_ago')} ${d}d ${h % 24}h`;
  };

  useEffect(() => {
    loadProfile();
    const timer = setInterval(() => setLastSavedLabel(formatRelativeTime(sermon.updated_at)), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLastSavedLabel(formatRelativeTime(sermon.updated_at));
  }, [sermon.updated_at, language]);

  const loadSermon = async (sermonId: string) => {
    try {
      setLoading(true);
      const data = await sermonService.getById(sermonId);
      setSermon({ ...data, additional_notes: data.additional_notes || '' });
    } catch (error) {
      addNotification('Error al cargar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnalysis = async () => {
    if (!sermon.main_passage) {
      addNotification('Ingresa un versículo.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await sermonService.generateAnalysis(sermon.main_passage);
      
      const fullExegesis = `VERSIÓN RVR1960:
${res.version_rv1960}

VERSIÓN NTV (O NVI):
${res.version_nvi}

1. TIPO LITERARIO:
${res.literary_type}

2. AUTORÍA:
${res.author}

3. PROPÓSITO ORIGINAL:
${res.purpose}

4. CONTEXTO HISTÓRICO:
${res.historical_context}

5. CONTEXTO DE SIGNIFICANCIA:
${res.significance_context}

6. IDIOMAS ORIGINALES (GRIEGO/HEBREO):
${res.original_languages}

7. ATRIBUCIÓN Y FUENTES:
${res.source_attribution}`;

      const newSermon = {
        ...sermon,
        title: `${t('editor.exegesis')} - ${sermon.main_passage}`,
        content: fullExegesis,
        key_locations: res.key_locations
      };

      setSermon(newSermon);
      
      // AUTO-GUARDADO
      if (id) {
        await sermonService.update(id, newSermon);
      } else {
        const created = await sermonService.create(newSermon);
        navigate(`/sermons/${created.id}`);
      }
      
      addNotification('Análisis generado y guardado.', 'success');
    } catch (error) {
      addNotification('Error al generar.', 'error');
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
        addNotification('Actualizado.', 'success');
      } else {
        const created = await sermonService.create(sermon);
        setSermon(created);
        navigate(`/sermons/${created.id}`);
      }
    } catch (error) {
      addNotification('Error al guardar.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Los lugares ahora vienen en inglés directamente desde la IA
  const getMapLink = (location: string) => {
    const formatted = location.trim().replace(/\s+/g, '_').toLowerCase();
    return `https://biblehub.com/atlas/${formatted}.htm`;
  };

  if (loading && !sermon.content) return (
    <div className="loading-screen-editor"><div className="loader-ministerial"></div><p>{t('list.loading')}</p></div>
  );

  return (
    <div className="sermon-editor-page">
      <aside className="sacred-sidebar-editor">
        <div className="sidebar-brand">
          <div className="brand-icon-box"><span className="material-symbols-outlined">menu_book</span></div>
          <div><h1 className="brand-text-pulp">Preacher Studio</h1><p className="brand-tagline-sm">{t('auth.inspired_prep')}</p></div>
        </div>
        <nav className="sacred-nav">
          <Link to="/sermons" className="nav-item"><span className="material-symbols-outlined nav-icon">book_2</span><span>{t('nav.library')}</span></Link>
          <Link to="/sermons/new" className="nav-item active"><span className="material-symbols-outlined nav-icon">edit_note</span><span>{t('nav.sermon_prep')}</span></Link>
          <Link to="/settings" className="nav-item"><span className="material-symbols-outlined nav-icon">settings</span><span>{t('nav.settings')}</span></Link>
        </nav>
        <div className="sidebar-footer-sacred">
          <div className="sidebar-user-stats">
            <div className="credits-display">
              <span className="material-symbols-outlined credits-icon">stars</span>
              <div className="credits-text-stack">
                <span className="credits-label">{t('nav.credits')}</span>
                <span className="credits-value">{isAdmin ? t('nav.unlimited') : credits}</span>
              </div>
            </div>
            <button className="lang-toggle-sidebar" onClick={toggleLanguage}>
              <span className="material-symbols-outlined">language</span>
              <span>{language === 'es' ? 'ES' : 'EN'}</span>
            </button>
          </div>
          <button className="logout-btn-sidebar" onClick={() => { logout(); navigate('/login'); }}>
            <span className="material-symbols-outlined">logout</span>
            <span>{t('nav.logout')}</span>
          </button>
        </div>
        <button className="new-study-btn-sidebar" onClick={() => navigate('/sermons/new')}><span className="material-symbols-outlined">add</span><span>{t('list.new_study_btn')}</span></button>
      </aside>

      <main className="editor-main-workspace">
        <header className="editor-header-sacred">
          <div className="header-column-left-aligned">
            <div className="verse-input-wrapper-aligned">
              <span className="material-symbols-outlined verse-icon">auto_awesome</span>
              <input type="text" className="verse-input-sacred" placeholder={t('editor.verse_placeholder')} value={sermon.main_passage} disabled={loading || !!id} onChange={(e) => setSermon({...sermon, main_passage: e.target.value})} />
            </div>
          </div>
          <div className="header-column-center">
            <div className="header-button-group">
              <button className="btn-generate-sacred" onClick={handleGenerateAnalysis} disabled={loading || !!id}>{loading ? '...' : t('editor.analyze_btn')}</button>
              <button className="btn-save-top-sacred" onClick={handleSave} disabled={isSaving}><span className="material-symbols-outlined">save</span>{isSaving ? '...' : language === 'es' ? 'Guardar' : 'Save'}</button>
            </div>
          </div>
          <div className="header-column-right">
            <span className="user-name-display-header">{userProfile?.full_name || 'Admin'}</span>
          </div>
        </header>

        <div className="editor-dashboard-integrated">
          <div className="editor-canvas-container">
            <div className="studio-main-card">
              <div className="card-top-header">
                <input type="text" className="editor-title-input" placeholder={t('list.col_reference')} value={sermon.title} onChange={(e) => setSermon({...sermon, title: e.target.value})} />
                <div className="save-status"><span className="material-symbols-outlined">cloud_done</span>{lastSavedLabel}</div>
              </div>
              <div className="analysis-grid-uniform"><div className="analysis-text-pure">{sermon.content || '...'}</div></div>
              <div className="editor-notes-section">
                <label className="notes-label">{t('editor.write_here')}</label>
                <textarea className="editor-textarea-sacred" placeholder="..." value={sermon.additional_notes} onChange={(e) => setSermon({...sermon, additional_notes: e.target.value})}></textarea>
              </div>
            </div>
          </div>

          <aside className="editor-right-tools-integrated">
            <div className="tools-header-sacred"><span className="material-symbols-outlined">construction</span>{t('editor.resources')}</div>
            <div className="tool-actions-vertical">
              <a href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(sermon.main_passage || '')}&version=${language === 'es' ? 'RVR1960' : 'NIV'}`} target="_blank" rel="noreferrer" className="tool-btn-sacred-link"><span className="material-symbols-outlined">auto_stories</span><span>{t('editor.bible_versions')}</span></a>
              <a href={`https://www.blueletterbible.org/search/preSearch.cfm?Criteria=${(sermon.main_passage || '').replace(/\s+/g, '+')}&t=KJV`} target="_blank" rel="noreferrer" className="tool-btn-sacred-link"><span className="material-symbols-outlined">menu_book</span><span>{t('editor.strong_lexicon')}</span></a>
              <div className="maps-resource-group">
                <p className="resource-sublabel">{t('editor.biblical_maps')}</p>
                {sermon.key_locations?.length ? sermon.key_locations.map((loc, idx) => (
                  <a key={idx} href={getMapLink(loc)} target="_blank" rel="noreferrer" className="map-link-item"><span className="material-symbols-outlined">map</span><span>{loc}</span></a>
                )) : <p className="no-resource-text">{language === 'es' ? 'No hay lugares' : 'No locations'}</p>}
              </div>
            </div>
            <div className="export-section-sacred">
              <p className="section-subtitle-sacred">EXPORTAR</p>
              <div className="export-grid">
                <button className="export-icon-btn-sacred"><span className="material-symbols-outlined">picture_as_pdf</span>PDF</button>
                <button className="export-icon-btn-sacred"><span className="material-symbols-outlined">present_to_all</span>PPTX/Keynote</button>
              </div>
            </div>
            <button className="btn-share-integrated"><span className="material-symbols-outlined">share</span><span>{t('editor.share_btn')}</span></button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SermonEditor;
