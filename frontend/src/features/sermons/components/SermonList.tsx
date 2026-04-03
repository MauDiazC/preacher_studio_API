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
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const data = await sermonService.getAll();
        setSermons(data);
      } catch (error) {
        console.error('Error fetching studies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, []);

  if (loading) return <div className="loading-screen">{t('nav.my_sermons')}...</div>;

  return (
    <div className="sermon-list-container">
      <div className="sermon-list-header">
        <h1>{t('list.title')}</h1>
        <Button onClick={() => navigate('/sermons/new')}>{t('list.new_btn')}</Button>
      </div>
      <div className="sermon-grid">
        {sermons.length === 0 && <p className="empty-msg">{t('list.empty')}</p>}
        {sermons.map((sermon) => (
          <Card key={sermon.id} title={sermon.title}>
            <p className="card-content">
              {sermon.content ? sermon.content.substring(0, 120) + '...' : t('list.empty')}
            </p>
            <div className="sermon-card-footer">
              <span className="sermon-date">
                {new Date(sermon.created_at).toLocaleDateString()}
              </span>
              <Link to={`/sermons/${sermon.id}`} className="sermon-edit-link">{t('list.edit')}</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SermonList;
