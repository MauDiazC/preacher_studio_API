import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sermonService } from '../services/sermonService';
import type { Sermon } from '../services/sermonService';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useAuthStore } from '../../../store/authStore';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import './SermonList.css';

const SermonList: React.FC = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page] = useState(1); 
  const [searchTerm, setSearchText] = useState('');
  const [userProfile, setUserProfile] = useState<{full_name?: string, is_admin?: boolean, credits_remaining?: number} | null>(null);
  const limit = 10;
  
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { t, language, toggleLanguage } = useLanguage();
  const { logout, user } = useAuthStore();

  const loadProfile = async () => {
    try {
      const response = await api.get('/profile/');
      setUserProfile(response.data);
    } catch (err) {
      console.error("Error perfil:", err);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const userEmail = user?.email?.toLowerCase() || '';
  const isAdmin = userProfile?.is_admin || userEmail === 'diazzabala@gmail.com';
  const credits = userProfile?.credits_remaining ?? 0;

  const handleLogout = () => { logout(); navigate('/login'); };

  const fetchSermons = async () => {
    try {
      setLoading(true);
      const currentOffset = (page - 1) * limit;
      const data = await sermonService.getAll(limit, currentOffset);
      setSermons(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      addNotification('Error al cargar estudios.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSermons(); }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este estudio?')) return;
    try {
      await sermonService.delete(id);
      addNotification('Eliminado.', 'success');
      fetchSermons();
    } catch (error) {
      addNotification('Error.', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (loading && sermons.length === 0) return (
    <div className="loading-screen" style={{ backgroundColor: '#111127', color: '#b0c6ff' }}>{t('list.loading')}</div>
  );

  return (
    <div className="sermon-list-page">
      <aside className="sacred-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon-box"><span className="material-symbols-outlined">menu_book</span></div>
          <div><h1 className="brand-text-pulp">Preacher Studio</h1><p className="brand-tagline-sm">{t('auth.inspired_prep')}</p></div>
        </div>
        <nav className="sacred-nav">
          <Link to="/sermons" className="nav-item active"><span className="material-symbols-outlined nav-icon">book_2</span><span>{t('nav.library')}</span></Link>
          <Link to="/sermons/new" className="nav-item"><span className="material-symbols-outlined nav-icon">edit_note</span><span>{t('nav.sermon_prep')}</span></Link>
          <Link to="/settings" className="nav-item"><span className="material-symbols-outlined nav-icon">settings</span><span>{t('nav.settings')}</span></Link>
        </nav>
        <div className="sidebar-footer-sacred">
          <div className="sidebar-user-stats">
            <div className="credits-display-clean">
              <span className="credits-label-small">{t('nav.credits')}</span>
              <span className="credits-value-small">{isAdmin ? t('nav.unlimited') : credits}</span>
            </div>
            <button className="lang-toggle-minimal" onClick={toggleLanguage}>
              <span className="material-symbols-outlined">language</span>
              <span className="lang-text-small">{language.toUpperCase()}</span>
            </button>
          </div>
          <button className="logout-btn-sidebar" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            <span>{t('nav.logout')}</span>
          </button>
        </div>
        <button className="new-study-btn-sidebar" onClick={() => navigate('/sermons/new')}><span className="material-symbols-outlined">add</span><span>{t('list.new_study_btn')}</span></button>
      </aside>

      <main className="sermon-list-main">
        <header className="list-top-bar">
          <div className="top-bar-title-clean">
            <h2>{t('list.title')}</h2>
            <p>{t('list.subtitle')}</p>
          </div>
          <div className="list-search-wrapper-blinded">
            <span className="material-symbols-outlined search-icon-sacred">search</span>
            <input className="search-input-sacred" type="text" placeholder={t('list.search_placeholder')} value={searchTerm} onChange={(e) => setSearchText(e.target.value)} />
          </div>
        </header>

        <div className="list-content-padding-clean">
          <div className="sacred-stats-grid">
            <div className="stat-card-sacred primary"><span className="stat-label">{t('list.total_studies')}</span><div className="stat-value-row"><span className="stat-number">{total}</span><span className="material-symbols-outlined stat-icon">history_edu</span></div></div>
            <div className="stat-card-sacred secondary"><span className="stat-label">{t('list.this_month')}</span><div className="stat-value-row"><span className="stat-number">--</span><span className="material-symbols-outlined stat-icon">calendar_month</span></div></div>
          </div>

          <div className="sacred-list-header">
            <div className="col-ref-header">{t('list.col_reference')}</div>
            <div className="col-date-header">{t('list.col_last_edit')}</div>
            <div className="col-actions-header">{t('list.col_actions')}</div>
          </div>

          <div className="sacred-list-container">
            {sermons.length === 0 ? <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: '#c2c6d7' }}>{t('list.empty')}</div> :
              sermons.map((s) => (
                <div key={s.id} className="study-item-sacred group">
                  <div className="item-accent-bar"></div>
                  <div className="col-info-main">
                    <div className="item-icon-box"><span className="material-symbols-outlined">menu_book</span></div>
                    <div className="item-text-stack">
                      <h3 className="item-title-sacred">{s.title}</h3>
                      <p className="item-excerpt">{s.main_passage}</p>
                    </div>
                  </div>
                  <div className="col-date-main">
                    <span className="item-date-text">{formatDate(s.updated_at || s.created_at)}</span>
                  </div>
                  <div className="col-actions-main">
                    <button className="action-btn-sacred btn-edit-sacred" onClick={() => navigate(`/sermons/${s.id}`)} title={t('list.edit')}><span className="material-symbols-outlined">edit</span></button>
                    <button className="action-btn-sacred btn-delete-sacred" onClick={() => handleDelete(s.id)} title="Eliminar"><span className="material-symbols-outlined">delete</span></button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SermonList;
