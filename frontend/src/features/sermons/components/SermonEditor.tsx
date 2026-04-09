import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  
  const [userProfile, setUserProfile] = useState<{full_name?: string, is_admin?: boolean} | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedLabel, setLastSavedLabel] = useState<string>('');

  // Cargar Perfil Real (Corregido el endpoint a /profile/)
  const loadProfile = async () => {
    try {
      const response = await api.get('/profile/');
      setUserProfile(response.data);
    } catch (err) {
      console.error("Error cargando perfil:", err);
    }
  };

  // Lógica de Admin y Créditos
  const userEmail = user?.email?.toLowerCase() || '';
  const isAdmin = userProfile?.is_admin || userEmail === 'diazzabala@gmail.com';

  // Formatear tiempo relativo
  const formatRelativeTime = (updatedAt?: string) => {
    if (!updatedAt) return language === 'es' ? 'Estudio nuevo' : 'New study';
    const diffMs = new Date().getTime() - new Date(updatedAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return language === 'es' ? 'Recién guardado' : 'Just saved';
    const mins = diffMins % 60;
    const hoursTotal = Math.floor(diffMins / 60);
    const hours = hoursTotal % 24;
    const days = Math.floor(hoursTotal / 24);
    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0 || parts.length === 0) parts.push(`${mins}m`);
    return `${t('editor.saved_ago')} ${parts.join(' ')}`;
  };

  useEffect(() => {
    loadProfile();
    const timer = setInterval(() => setLastSavedLabel(formatRelativeTime(sermon.updated_at)), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLastSavedLabel(formatRelativeTime(sermon.updated_at));
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
      setSermon({
        ...data,
        additional_notes: data.additional_notes || ''
      });
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
      addNotification('Error al generar el análisis.', 'error');
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

  const anglicizeLocation = (loc: string) => {
    const translations: Record<string, string> = {
      'jerusalén': 'jerusalem', 'jerusalen': 'jerusalem', 'belén': 'bethlehem', 'belen': 'bethlehem',
      'nazaret': 'nazareth', 'galilea': 'galilee', 'judea': 'judea', 'samaria': 'samaria',
      'antioquía': 'antioch', 'antioquia': 'antioch', 'éfeso': 'ephesus', 'efeso': 'ephesus',
      'corinto': 'corinth', 'filipos': 'philippi', 'tesalónica': 'thessalonica', 'tesalonica': 'thessalonica',
      'colosas': 'colossae', 'damasco': 'damascus', 'babilonia': 'babylon', 'nínive': 'nineveh',
      'tiro': 'tyre', 'sidón': 'sidon', 'cesarea': 'caesarea', 'jericó': 'jericho',
      'hebrón': 'hebron', 'siquem': 'shechem', 'betel': 'bethel', 'gabaón': 'gibeon',
      'sion': 'zion', 'carmelo': 'carmel', 'hermón': 'hermon', 'sinaí': 'sinai',
      'horeb': 'horeb', 'nilo': 'nile', 'éufrates': 'euphrates', 'tigris': 'tigris',
      'jordán': 'jordan', 'roma': 'rome', 'egipto': 'egypt'
    };
    const key = loc.toLowerCase().trim();
    return translations[key] || key.replace(/\s+/g, '_');
  };

  const getMapLink = (location: string) => {
    const englishName = anglicizeLocation(location);
    return `https://biblehub.com/atlas/${englishName}.htm`;
  };

  if (loading && !sermon.content) return (
    <div className="loading-screen-editor">
      <div className="loader-ministerial"></div>
      <p>{t('list.loading')}</p>
    </div>
  );

  return (
    <div className="sermon-editor-page">
      <aside className="sacred-sidebar-editor">
        <div className="sidebar-brand">
          <div className="brand-icon-box"><span className="material-symbols-outlined">menu_book</span></div>
          <div>
            <h1 className="brand-text-pulp">Preacher Studio</h1>
            <p className="brand-tagline-sm">{t('auth.inspired_prep')}</p>
          </div>
        </div>
        <nav className="sacred-nav">
          <Link to="/sermons" className="nav-item"><span className="material-symbols-outlined nav-icon">book_2</span><span>{t('nav.library')}</span></Link>
          <Link to="/sermons/new" className="nav-item active"><span className="material-symbols-outlined nav-icon">edit_note</span><span>{t('nav.sermon_prep')}</span></Link>
          <a href="#" className="nav-item"><span className="material-symbols-outlined nav-icon">settings</span><span>{t('nav.settings')}</span></a>
        </nav>
        <div className="sidebar-footer-sacred">
          <div className="sidebar-user-stats">
            <div className="credits-display">
              <span className="credits-label">{t('nav.credits')}</span>
              <span className="credits-value">{isAdmin ? t('nav.unlimited') : '25'}</span>
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

      <main className="editor-main-workspace">
        <header className="editor-header-sacred">
          <div className="header-grid-absolute">
            <div className="header-cell-left">
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
            </div>
            <div className="header-cell-center">
              <div className="header-button-group">
                <button className="btn-generate-sacred" onClick={handleGenerateAnalysis} disabled={loading || !!id}>
                  {loading ? '...' : t('editor.analyze_btn')}
                </button>
                <button className="btn-save-top-sacred" onClick={handleSave} disabled={isSaving}>
                  <span className="material-symbols-outlined">save</span>
                  {isSaving ? '...' : language === 'es' ? 'Guardar' : 'Save'}
                </button>
              </div>
            </div>
            <div className="header-cell-right">
              <span className="user-name-display-header">
                {userProfile?.full_name || user?.email?.split('@')[0] || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        <div className="editor-dashboard-integrated">
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
                <div className="analysis-text-pure">{sermon.content || t('editor.write_here')}</div>
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

          <aside className="editor-right-tools-integrated">
            <div className="tools-header-sacred"><span className="material-symbols-outlined">construction</span>{t('editor.resources')}</div>
            <div className="tool-actions-vertical">
              <a href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(sermon.main_passage || '')}&version=${language === 'es' ? 'RVR1960' : 'NIV'}`} target="_blank" rel="noreferrer" className="tool-btn-sacred-link">
                <span className="material-symbols-outlined">auto_stories</span><span>{t('editor.bible_versions')}</span>
              </a>
              <a href={`https://www.blueletterbible.org/search/preSearch.cfm?Criteria=${(sermon.main_passage || '').replace(/\s+/g, '+')}&t=KJV`} target="_blank" rel="noreferrer" className="tool-btn-sacred-link">
                <span className="material-symbols-outlined">menu_book</span><span>{t('editor.strong_lexicon')}</span>
              </a>
              <div className="maps-resource-group">
                <p className="resource-sublabel">{t('editor.biblical_maps')}</p>
                {sermon.key_locations && sermon.key_locations.length > 0 ? (
                  sermon.key_locations.map((loc, idx) => (
                    <a key={idx} href={getMapLink(loc)} target="_blank" rel="noreferrer" className="map-link-item">
                      <span className="material-symbols-outlined">map</span><span>{loc}</span>
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
