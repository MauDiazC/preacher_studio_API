import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { sermonService } from '../services/sermonService';
import type { Sermon } from '../services/sermonService';
import './SermonList.css';

const SermonList: React.FC = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const data = await sermonService.getAll();
        setSermons(data);
      } catch (error) {
        console.error('Error fetching sermons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, []);

  if (loading) return <p>Cargando sermones...</p>;

  return (
    <div className="sermon-list-container">
      <div className="sermon-list-header">
        <h1>Mis Sermones</h1>
        <Button onClick={() => navigate('/sermons/new')}>Nuevo Sermón</Button>
      </div>
      <div className="sermon-grid">
        {sermons.length === 0 && <p>No tiene sermones guardados.</p>}
        {sermons.map((sermon) => (
          <Card key={sermon.id} title={sermon.title}>
            <p className="card-content">{sermon.description || 'Sin descripción'}</p>
            <div className="sermon-card-footer">
              <span className="sermon-date">{new Date(sermon.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <Link to={`/sermons/${sermon.id}`} className="sermon-edit-link">EDITAR</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SermonList;
