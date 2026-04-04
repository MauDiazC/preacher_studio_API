import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { sermonService } from '../services/sermonService';
import type { Sermon } from '../services/sermonService';
import { useLanguage } from '../../../context/LanguageContext';
import './SermonList.css';

const SermonList: React.FC = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Paginación
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const navigate = useNavigate();
  const { t } = useLanguage();

  const fetchSermons = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const response = await sermonService.getAll(limit, offset);
      setSermons(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching studies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, [page]);

  if (loading && sermons.length === 0) return <div className="loading-screen">{t('nav.my_sermons')}...</div>;

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
              className={viewMode === 'grid' ? 'active' : ''} 
              onClick={() => setViewMode('grid')}
              title="Vista de Rejilla"
            >
              ⊞
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''} 
              onClick={() => setViewMode('list')}
              title="Vista de Lista"
            >
              ≡
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
              <Card key={sermon.id} title={sermon.title}>
                <div className="sermon-card-footer">
                  <span className="sermon-date">
                    {new Date(sermon.created_at).toLocaleDateString()}
                  </span>
                  <Link to={`/sermons/${sermon.id}`} className="sermon-edit-link">{t('list.edit')}</Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="sermon-table">
            <div className="table-header">
              <span>Estudio</span>
              <span>Fecha</span>
              <span>Acción</span>
            </div>
            {sermons.map((sermon) => (
              <div key={sermon.id} className="table-row">
                <span className="sermon-title-cell">{sermon.title}</span>
                <span className="sermon-date-cell">
                  {new Date(sermon.created_at).toLocaleDateString()}
                </span>
                <Link to={`/sermons/${sermon.id}`} className="sermon-edit-btn-small">Editar</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <span className="page-info">Página {page} de {totalPages}</span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === totalPages} 
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};

export default SermonList;
