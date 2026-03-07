import React, { useEffect, useState } from 'react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { sermonService } from '../services/sermonService';
import type { Sermon } from '../services/sermonService';
import './SermonList.css';

const SermonList: React.FC = () => {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const data = await sermonService.getAll();
        setSermons(data);
      } catch (error) {
        console.error('Error fetching sermons:', error);
        // Fallback mock data for demo if API fails
        setSermons([
          { 
            id: '1', 
            title: 'El Poder de la Fe', 
            description: 'Un estudio sobre Hebreos 11', 
            content: '...', 
            created_at: new Date().toISOString(), 
            updated_at: new Date().toISOString() 
          },
          { 
            id: '2', 
            title: 'Gracia sobre Gracia', 
            description: 'Explorando el evangelio de Juan', 
            content: '...', 
            created_at: new Date().toISOString(), 
            updated_at: new Date().toISOString() 
          },
        ]);
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
        <Button>Nuevo Sermón</Button>
      </div>
      <div className="sermon-grid">
        {sermons.map((sermon) => (
          <Card key={sermon.id} title={sermon.title}>
            <p className="card-content">{sermon.description || 'Sin descripción'}</p>
            <div className="sermon-card-footer">
              <span className="sermon-date">{new Date(sermon.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <a href={`/sermons/${sermon.id}`} className="sermon-edit-link">EDITAR</a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SermonList;
