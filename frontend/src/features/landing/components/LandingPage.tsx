import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import Button from '../../../components/common/Button';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background-glow"></div>
        <div className="hero-content">
          <div className="badge">{t('hero.badge')}</div>
          <h1 className="hero-title">
            {t('hero.title')} <br /> 
            <span className="text-gradient">{t('hero.title_gradient')}</span>
          </h1>
          <p className="hero-description">
            {t('hero.description')}
          </p>
          <div className="hero-actions">
            <Button size="lg" onClick={() => navigate('/register')}>
              {t('hero.start')}
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
              {t('hero.login')}
            </Button>
          </div>
        </div>

        {/* Visual Element inspirado en el mockup */}
        <div className="hero-visual">
          <div className="orbit-container">
            <div className="orbit-circle orbit-1"></div>
            <div className="orbit-circle orbit-2"></div>
            <div className="orbit-circle orbit-3"></div>
            <div className="central-node">
              <div className="inner-glow"></div>
              <span className="node-icon">📖</span>
            </div>
            {/* Flotantes que representan los 5 puntos exegéticos */}
            <div className="floating-tag tag-1">{t('tag.literary')}</div>
            <div className="floating-tag tag-2">{t('tag.authorship')}</div>
            <div className="floating-tag tag-3">{t('tag.historical')}</div>
            <div className="floating-tag tag-4">{t('tag.significance')}</div>
            <div className="floating-tag tag-5">{t('tag.purpose')}</div>
          </div>
        </div>
      </section>

      {/* Trust Bar (similar al mockup) */}
      <div className="trust-bar">
        <span>PREACHER STUDIO</span>
        <span>•</span>
        <span>EXÉGESIS AVANZADA</span>
        <span>•</span>
        <span>IA HOMILÉTICA</span>
        <span>•</span>
        <span>BIBLIA & HISTORIA</span>
      </div>
    </div>
  );
};

export default LandingPage;
