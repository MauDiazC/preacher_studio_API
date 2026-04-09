import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sermonService } from '../services/sermonService';
import type { Sermon } from '../services/sermonService';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useAuthStore } from '../../../store/authStore';
import { useLanguage } from '../../../context/LanguageContext';
import './SermonList.css';

const SermonList: React.FC = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchText] = useState('');
  const limit = 10;
  
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { t, language, toggleLanguage } = useLanguage();
  const { logout, user } = useAuthStore();

  // Créditos dummy para visualización
  const credits = 25; 
  const isAdmin = user?.role === 'admin' || user?.email === 'diazzabala@gmail.com'; // Fallback por si el rol no viene explícito

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  useEffect(() => {
    fetchSermons();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este estudio permanentemente?')) return;
    try {
      await sermonService.delete(id);
      addNotification('Estudio eliminado.', 'success');
      fetchSermons();
    } catch (error) {
      addNotification('Error al eliminar.', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && sermons.length === 0) return (
    <div className="loading-screen" style={{ backgroundColor: '#111127', color: '#b0c6ff' }}>
      {t('list.loading')}
    </div>
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="sermon-list-page">
      {/* Side Navigation */}
      <aside className="sacred-sidebar">
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
          <Link to="/sermons" className="nav-item active">
            <span className="material-symbols-outlined nav-icon">book_2</span>
            <span>{t('nav.library')}</span>
          </Link>
          <Link to="/sermons/new" className="nav-item">
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

      {/* Main Content */}
      <main className="sermon-list-main">
        {/* Background Accents */}
        <div className="celestial-bg-list">
          <div className="list-glow-1"></div>
          <div className="list-glow-2"></div>
        </div>

        {/* Top Bar */}
        <header className="list-top-bar">
          <div className="top-bar-title">
            <h2>{t('list.title')}</h2>
            <p>{t('list.subtitle')}</p>
          </div>

          <div className="list-search-wrapper">
            <span className="material-symbols-outlined search-icon-sacred">search</span>
            <input 
              className="search-input-sacred"
              type="text" 
              placeholder={t('list.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </header>

        <div className="list-content-padding">
          {/* Stats Grid */}
          <div className="sacred-stats-grid">
            <div className="stat-card-sacred primary">
              <span className="stat-label">{t('list.total_studies')}</span>
              <div className="stat-value-row">
                <span className="stat-number">{total}</span>
                <span className="material-symbols-outlined stat-icon">history_edu</span>
              </div>
            </div>
            <div className="stat-card-sacred secondary">
              <span className="stat-label">{t('list.this_month')}</span>
              <div className="stat-value-row">
                <span className="stat-number">--</span>
                <span className="material-symbols-outlined stat-icon">calendar_month</span>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="sacred-list-header">
            <div style={{ width: '35%' }}>{t('list.col_reference')}</div>
            <div style={{ width: '20%' }}>{t('list.col_last_edit')}</div>
            <div style={{ width: '25%' }}>{t('list.col_tags')}</div>
            <div style={{ width: '20%', textAlign: 'right' }}>{t('list.col_actions')}</div>
          </div>

          {/* List Container */}
          <div className="sacred-list-container">
            {sermons.length === 0 ? (
              <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: '#c2c6d7' }}>
                {t('list.empty')}
              </div>
            ) : (
              sermons.map((sermon) => (
                <div key={sermon.id} className="study-item-sacred group">
                  <div className="item-accent-bar"></div>
                  
                  <div className="col-info">
                    <div className="item-icon-box">
                      <span className="material-symbols-outlined">menu_book</span>
                    </div>
                    <div>
                      <h3 className="item-title-sacred">{sermon.title}</h3>
                      <p className="item-excerpt">
                        {sermon.main_passage || 'Preparación ministerial en curso...'}
                      </p>
                    </div>
                  </div>

                  <div className="col-date">
                    <span className="item-date-text">{formatDate(sermon.updated_at || sermon.created_at)}</span>
                    <span className="item-time-text">{formatTime(sermon.updated_at || sermon.created_at)}</span>
                  </div>

                  <div className="col-tags">
                    <span className="sacred-tag tag-secondary">Estudio</span>
                    {sermon.key_locations?.slice(0, 1).map((loc, i) => (
                      <span key={i} className="sacred-tag tag-neutral">{loc}</span>
                    ))}
                  </div>

                  <div className="col-actions">
                    <button 
                      className="action-btn-sacred btn-edit-sacred"
                      onClick={() => navigate(`/sermons/${sermon.id}`)}
                      title={t('list.edit')}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button 
                      className="action-btn-sacred btn-delete-sacred"
                      onClick={() => handleDelete(sermon.id)}
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="sacred-pagination">
              <div className="pagination-ribbon">
                <button 
                  className="page-arrow" 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                
                <div className="page-numbers-sacred">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button 
                      key={p} 
                      className={`page-num-btn ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button 
                  className="page-arrow" 
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Decorative Image Accent */}
        <div className="list-bottom-accent">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJWsl7BwpEf_hzrJEaVwmabdF8r2xl90XaMbYTlaZQaeqpPOv74RflzmMWmpMVPOU7OZfM3jP8dLrSEZEs9idiDz43XJrkK562XGpT09_ALoeh7RlgXcn1HM85MaYyt-OSP5wMfPFT6_yt1LM4KqF8SFAhSZDBu_z77uGTQsnLNl2tYWP7mk4N24-zXy2uz627LZox_2jQCIxZBehPmSxTuAGAjtIchjbDxkbWKVnFrmG9whou7blTTUGFa7QVbxSA885AZ5MhqfY" alt="Nebula" />
        </div>
      </main>
    </div>
  );
};

export default SermonList;
