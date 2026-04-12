import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { sermonService } from '../services/sermonService';
import { exportService } from '../services/exportService';
import type { Sermon } from '../services/sermonService';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useAuthStore } from '../../../store/authStore';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import Sidebar from '../../../components/common/Sidebar';
import './SermonEditor.css';

const SermonEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotificationStore();
  const { user } = useAuthStore();
  const { t, language } = useLanguage();

  const initialState = {
    title: '', main_passage: '', content: '', additional_notes: '', key_locations: []
  };

  const [sermon, setSermon] = useState<Partial<Sermon>>(initialState);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      setSermon(initialState);
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
  const currentPlan = userProfile?.plan_id || 'plan_sembrador';
  const hasNoCredits = !isAdmin && credits <= 0;

  // GATING DE FUNCIONES
  const canAccessPremiumResources = isAdmin || currentPlan === 'mentor' || currentPlan === 'ministerio';
  const canAccessExports = isAdmin || currentPlan === 'ministerio';

  useEffect(() => {
    loadProfile();
  }, []);

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
    if (hasNoCredits) {
      addNotification('Sin créditos disponibles.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await sermonService.generateAnalysis(sermon.main_passage || '');
      setSermon(prev => ({
        ...prev,
        title: `${t('editor.exegesis')} - ${sermon.main_passage}`,
        content: `VERSIÓN RVR1960:\n${res.version_rv1960}\n\nVERSIÓN NVI:\n${res.version_nvi}\n\n1. TIPO LITERARIO:\n${res.literary_type}\n\n2. AUTORÍA:\n${res.author}\n\n3. PROPÓSITO ORIGINAL:\n${res.purpose}\n\n4. CONTEXTO HISTÓRICO:\n${res.historical_context}\n\n5. CONTEXTO DE SIGNIFICANCIA:\n${res.significance_context}\n\n6. IDIOMAS ORIGINALES:\n${res.original_languages}\n\n7. ATRIBUCIÓN:\n${res.source_attribution}`,
        key_locations: res.key_locations
      }));
      addNotification('Análisis generado.', 'success');
      loadProfile(); 
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
        await sermonService.update(id, sermon);
        addNotification('Actualizado.', 'success');
      } else {
        const created = await sermonService.create(sermon);
        navigate(`/sermons/${created.id}`);
      }
    } catch (error) {
      addNotification('Error al guardar.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'pptx') => {
    if (!canAccessExports) {
      addNotification('Disponible en Plan Ministerio.', 'info');
      return;
    }
    try {
      addNotification('Iniciando exportación asíncrona...', 'info');
      if (format === 'pdf') {
        await exportService.exportToPDF(id!);
      } else {
        await exportService.exportToKeynote(id!);
      }
      addNotification('Exportación completada.', 'success');
    } catch (error) {
      console.error("Download error:", error);
      addNotification('Error al exportar.', 'error');
    }
  };

  if (loading && !sermon.content) return (
    <div className="loading-screen-editor"><div className="loader-ministerial"></div><p>{t('list.loading')}</p></div>
  );

  return (
    <div className="sermon-editor-page">
      <Sidebar />

      <main className="editor-main-workspace">
        <header className="editor-header-sacred">
          <div className="header-column-left-aligned">
            <div className="verse-input-wrapper-aligned">
              <span className="material-symbols-outlined verse-icon">auto_awesome</span>
              <input type="text" className="verse-input-sacred" placeholder={hasNoCredits ? 'SIN CRÉDITOS' : t('editor.verse_placeholder')} value={sermon.main_passage} disabled={loading || !!id || hasNoCredits} onChange={(e) => setSermon({...sermon, main_passage: e.target.value})} />
            </div>
          </div>
          <div className="header-column-center">
            <div className="header-button-group">
              <button className="btn-generate-sacred" onClick={handleGenerateAnalysis} disabled={loading || !!id || hasNoCredits}>{loading ? '...' : t('editor.analyze_btn')}</button>
              <button className="btn-save-top-sacred" onClick={handleSave} disabled={isSaving}><span className="material-symbols-outlined">save</span>{isSaving ? '...' : language === 'es' ? 'Guardar' : 'Save'}</button>
            </div>
          </div>
          <div className="header-column-right">
            <span className="user-name-display-header">{userProfile?.full_name || '...'}</span>
          </div>
        </header>

        <div className="editor-dashboard-integrated">
          <div className="editor-canvas-container">
            <div className="studio-main-card">
              <div className="card-top-header">
                <input type="text" className="editor-title-input" placeholder={t('list.col_reference')} value={sermon.title} onChange={(e) => setSermon({...sermon, title: e.target.value})} />
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
              {canAccessPremiumResources ? (
                <>
                  <a href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(sermon.main_passage || '')}&version=${language === 'es' ? 'RVR1960' : 'NIV'}`} target="_blank" rel="noreferrer" className="tool-btn-sacred-link"><span className="material-symbols-outlined">auto_stories</span><span>{t('editor.bible_versions')}</span></a>
                  <a href={`https://www.blueletterbible.org/search/preSearch.cfm?Criteria=${(sermon.main_passage || '').replace(/\s+/g, '+')}&t=KJV`} target="_blank" rel="noreferrer" className="tool-btn-sacred-link"><span className="material-symbols-outlined">menu_book</span><span>{t('editor.strong_lexicon')}</span></a>
                </>
              ) : (
                <div className="premium-lock-box" onClick={() => navigate('/pricing')}>
                  <span className="material-symbols-outlined">lock</span>
                  <p>Léxicos y Recursos Premium (Mentor)</p>
                </div>
              )}
            </div>
            <div className="export-section-sacred">
              <p className="section-subtitle-sacred">EXPORTAR</p>
              <div className="export-grid">
                <button className="export-icon-btn-sacred" onClick={() => handleDownload('pdf')} disabled={!canAccessExports}><span className="material-symbols-outlined">picture_as_pdf</span>PDF</button>
                <button className="export-icon-btn-sacred" onClick={() => handleDownload('pptx')} disabled={!canAccessExports}><span className="material-symbols-outlined">present_to_all</span>PPTX/Keynote</button>
              </div>
              {!canAccessExports && <p className="premium-notice-sm">Exportación disponible en Plan Ministerio</p>}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SermonEditor;
