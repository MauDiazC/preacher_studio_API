import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import './PricingPage.css';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const plans = [
    {
      label: t('pricing.essential'),
      name: t('plan.free'),
      price: '$0',
      period: t('pricing.month'),
      features: [
        'Hasta 3 bosquejos mensuales',
        'Biblioteca de referencias básica',
        'Exportación en PDF'
      ],
      disabledFeatures: ['Colaboración en equipo'],
      buttonText: t('btn.start_free'),
      recommended: false
    },
    {
      label: t('pricing.advanced'),
      name: t('plan.pro'),
      price: '$19',
      period: t('pricing.month'),
      tagline: t('pricing.deep_prep'),
      features: [
        'Bosquejos ilimitados',
        'Acceso a Lexicones Griegos y Hebreos',
        'Nube de almacenamiento segura',
        'Soporte prioritario 24/7',
        'Modo "Lectura en Púlpito"'
      ],
      buttonText: t('hero.start'),
      recommended: true
    },
    {
      label: t('pricing.teams'),
      name: t('auth.ministerio'),
      price: '$49',
      period: t('pricing.month'),
      features: [
        'Hasta 10 usuarios incluidos',
        'Espacios de trabajo compartidos',
        'Control administrativo de roles',
        'Integración con presentaciones'
      ],
      buttonText: t('pricing.contact_sales'),
      recommended: false
    }
  ];

  return (
    <div className="pricing-page-container">
      {/* Background Decorative Orbits */}
      <div className="pricing-orbit-bg">
        <div className="pricing-orbit-1"></div>
        <div className="pricing-orbit-2"></div>
      </div>

      <main className="pricing-content-wrapper">
        {/* Header Section */}
        <div className="pricing-hero-section">
          <h1 className="pricing-hero-title">
            {t('pricing.investment')} <span className="highlight">{t('pricing.ministerio')}</span>
          </h1>
          <p className="pricing-hero-desc">
            {t('pricing.investment_desc')}
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="pricing-main-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card-sacred ${plan.recommended ? 'recommended' : ''}`}>
              {plan.recommended && (
                <div className="recommended-badge">{t('plan.popular')}</div>
              )}
              
              <div className="card-header">
                <span className="card-label">{plan.label}</span>
                <h3 className="card-plan-name">{plan.name}</h3>
                <div className="card-price-row">
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">{plan.period}</span>
                </div>
                {plan.tagline && (
                  <p style={{ color: '#b0c6ff', fontSize: '0.875rem', marginTop: '-1rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                    {plan.tagline}
                  </p>
                )}
              </div>

              <ul className="card-features-list">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="feature-item">
                    <span className="material-symbols-outlined feature-icon">
                      {plan.recommended ? 'auto_awesome' : 'check_circle'}
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.disabledFeatures?.map((feature, dIndex) => (
                  <li key={dIndex} className="feature-item" style={{ opacity: 0.4 }}>
                    <span className="material-symbols-outlined feature-icon" style={{ color: 'inherit' }}>block</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`plan-btn ${plan.recommended ? 'btn-primary-gradient' : 'btn-outline'}`}
                onClick={() => navigate('/register')}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Bento Grid - Why choose us */}
        <div className="pricing-bento-section">
          <div className="bento-item bento-library">
            <img 
              className="bento-bg-img" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBc6QB3jgAw13LZExCBs_FoQXVc0DyMB8ac6uzzbRoEdqJUleuIeBIwSD_W3KJ7HO5aZczcPImK8r546e-RMNTT3mwDqjyPmEV7CerIWWE1lKfvQdcfifLAZqSkX-zrkH2_AFU1PXI6TsLjMhTkrJ8DDlfyZCtwdDZJw8kRjs8ZakTDDZs4Cw2PN2vpAO9gfOzza6FXPrpKAvM9VH5JhNjYpEUqfPCCHl0hlc_9uWgQnGlRRBiS68krU7GW6jv3VDpZBlPCILjlo4A" 
              alt="Library" 
            />
            <div className="bento-content">
              <h4 className="bento-title-lg">{t('pricing.bento_library_title')}</h4>
              <p style={{ color: '#c2c6d7' }}>{t('pricing.bento_library_desc')}</p>
            </div>
          </div>

          <div className="bento-item bento-sync">
            <div className="bento-sync-content">
              <div className="bento-icon-wrapper">
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem' }}>cloud_sync</span>
              </div>
              <div>
                <h5 style={{ fontFamily: 'Noto Serif', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {t('pricing.bento_sync_title')}
                </h5>
                <p style={{ color: '#c2c6d7', fontSize: '0.875rem' }}>{t('pricing.bento_sync_desc')}</p>
              </div>
            </div>
          </div>

          <div className="bento-item bento-stats">
            <span className="stats-value">99.9%</span>
            <span className="stats-label">{t('pricing.bento_uptime')}</span>
          </div>

          <div className="bento-item bento-stats">
            <span className="stats-value">+5k</span>
            <span className="stats-label">{t('pricing.bento_pastors')}</span>
          </div>
        </div>

        {/* Admin Note Section */}
        <div className="admin-note-section">
          <p>
            ¿Eres administrador? <span className="link" onClick={() => navigate('/login')}>Inicia sesión</span> para acceso bypass.
          </p>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="sacred-footer-pricing">
        <div className="sacred-footer-content">
          <p className="sacred-footer-copy">© 2026 Preacher Studio. {t('auth.inspired_prep')}.</p>
          <div className="sacred-footer-links">
            <a href="#" className="sacred-footer-link">{t('footer.privacy')}</a>
            <a href="#" className="sacred-footer-link">{t('footer.terms')}</a>
            <a href="#" className="sacred-footer-link">{t('footer.contact')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
