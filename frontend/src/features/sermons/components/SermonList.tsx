import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import { sermonService } from '../services/sermonService';
import type { Sermon } from '../services/sermonService';
import { useLanguage } from '../../../context/LanguageContext';
import { useNotificationStore } from '../../../store/useNotificationStore';
import './SermonList.css';

const SermonList: React.FC = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  // Cambiado a 'list' por defecto como solicitaste
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const navigate = useNavigate();
  const { t } = useLanguage();
  const { addNotification } = useNotificationStore();

  const fetchSermons = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const response = await sermonService.getAll(limit, offset);
      setSermons(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar este estudio permanentemente?')) {
      try {
        await sermonService.delete(id);
        addNotification('Estudio eliminado.', 'success');
        fetchSermons();
      } catch (error) {
        addNotification('Error al eliminar.', 'error');
      }
    }
  };

  useEffect(() => {
    fetchSermons();
  }, [page]);

  if (loading && sermons.length === 0) return <div className="loading-screen">Cargando estudios...</div>;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="sermon-list-container">
      <div className="sermon-list-header">
        <div className="header-info">
          <h1>{t('list.title')}</h1>
          <p className="total-count">{total} estudios encontrados</p>
        </div>
        
        <div className="list-actions">
          <div className="view-toggle">
            <button 
              className={viewMode === 'list' ? 'active' : ''} 
              onClick={() => setViewMode('list')}
              title="Vista de Lista"
            >
              ≡
            </button>
            <button 
              className={viewMode === 'grid' ? 'active' : ''} 
              onClick={() => setViewMode('grid')}
              title="Vista de Rejilla"
            >
              ⊞
            </button>
          </div>
          <Button onClick={() => navigate('/sermons/new')}>{t('list.new_btn')}</Button>
        </div>
      </div>

      <div className={`sermons-content ${viewMode}-view`}>
        {sermons.length === 0 && !loading && <p className="empty-msg">{t('list.empty')}</p>}
        
        {viewMode === 'grid' ? (
          <div className="sermon-grid">
            {sermons.map((sermon) => (
              <div key={sermon.id} className="sermon-card-compact">
                <div className="card-body">
                  <h3>{sermon.title}</h3>
                  <p className="card-date">{new Date(sermon.created_at).toLocaleDateString()}</p>
                </div>
                <div className="card-actions-compact">
                  <button onClick={() => navigate(`/sermons/${sermon.id}`)} className="edit-btn-compact">
                    {t('list.edit')}
                  </button>
                  <button onClick={(e) => handleDelete(sermon.id, e)} className="del-btn-compact">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="sermon-table">
            <div className="table-header">
              <span>Estudio</span>
              <span>Fecha</span>
              <span>Acciones</span>
            </div>
            {sermons.map((sermon) => (
              <div key={sermon.id} className="table-row">
                <span className="sermon-title-cell">{sermon.title}</span>
                <span className="sermon-date-cell">
                  {new Date(sermon.created_at).toLocaleDateString()}
                </span>
                <div className="table-row-actions">
                  <button onClick={() => navigate(`/sermons/${sermon.id}`)} className="sermon-edit-btn-small">
                    {t('list.edit')}
                  </button>
                  <button onClick={(e) => handleDelete(sermon.id, e)} className="delete-btn-icon-small">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <span className="page-info">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};

export default SermonList;
