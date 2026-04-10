import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sermonService } from '../services/sermonService';
import type { Sermon } from '../services/sermonService';
import { useNotificationStore } from '../../../store/useNotificationStore';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import Sidebar from '../../../components/common/Sidebar';
import './SermonList.css';

const SermonList: React.FC = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [thisMonthCount, setThisMonthCount] = useState(0);
  const [page] = useState(1); 
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 50; 
  
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const { t } = useLanguage();

  const fetchThisMonthCount = async () => {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const response = await api.get(`/sermons/?from_date=${firstDay}&limit=1`);
      setThisMonthCount(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching month count:", error);
    }
  };

  useEffect(() => { 
    fetchThisMonthCount();
  }, []);

  const fetchSermons = useCallback(async (query: string = '') => {
    try {
      setLoading(true);
      const currentOffset = (page - 1) * limit;
      const data = await sermonService.getAll(limit, currentOffset, query);
      setSermons(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      addNotification('Error al cargar estudios.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSermons(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchSermons]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este estudio?')) return;
    try {
      await sermonService.delete(id);
      addNotification('Eliminado.', 'success');
      fetchSermons(searchTerm);
      fetchThisMonthCount();
    } catch (error) {
      addNotification('Error.', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (loading && sermons.length === 0 && !searchTerm) return (
    <div className="loading-screen-ministerial">
      <div className="loader-ministerial"></div>
      <p style={{ marginTop: '1.5rem', opacity: 0.6, letterSpacing: '0.1em' }}>{t('list.loading').toUpperCase()}</p>
    </div>
  );

  return (
    <div className="sermon-list-page">
      <Sidebar />

      <main className="sermon-list-main">
        <header className="list-top-bar">
          <div className="top-bar-title-clean">
            <h2>{t('list.title')}</h2>
            <p>{t('list.subtitle')}</p>
          </div>
          <div className="list-search-wrapper-blinded">
            <span className="material-symbols-outlined search-icon-sacred">search</span>
            <input 
              className="search-input-sacred" 
              type="text" 
              placeholder={t('list.search_placeholder')} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </header>

        <div className="list-content-padding-clean">
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
                <span className="stat-number">{thisMonthCount}</span>
                <span className="material-symbols-outlined stat-icon">calendar_month</span>
              </div>
            </div>
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
