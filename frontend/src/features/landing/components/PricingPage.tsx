import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuthStore } from '../../../store/authStore';
import './PricingPage.css';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuthStore();

  const isEn = language === 'en';
  const currency = isEn ? 'USD' : 'MXN';
  
  const plans = [
    {
      id: 'plan_sembrador',
      name: t('plan.free'),
      price: 0,
      description: t('plan.free_desc'),
      features: [
        isEn ? 'Basic literary analysis' : 'Análisis literario básico',
        isEn ? 'Personal study library' : 'Biblioteca de estudios personal'
      ],
      buttonText: t('btn.start_free'),
      recommended: false
    },
    {
      id: 'mentor',
      name: t('plan.pro'),
      price: isEn ? 9.99 : 180,
      description: t('plan.pro_desc'),
      features: [
        t('pricing.includes_prev'),
        isEn ? 'Access to Strong Lexicons' : 'Acceso a Léxicos Strong',
        isEn ? 'Biblical Maps & Geography' : 'Mapas Bíblicos y Geografía'
      ],
      buttonText: t('btn.choose'),
      recommended: true
    },
    {
      id: 'ministerio',
      name: t('plan.unlimited'),
      price: isEn ? 19.99 : 360,
      description: t('plan.unlimited_desc'),
      features: [
        t('pricing.includes_all'),
        t('pricing.pptx_keynote'),
        isEn ? 'Priority Ministerial Support' : 'Soporte Ministerial Prioritario'
      ],
      buttonText: t('pricing.start_now'),
      recommended: false
    }
  ];

  const handlePlanSelection = (planId: string) => {
    if (planId === 'plan_sembrador') {
      navigate('/register');
      return;
    }

    if (isAuthenticated) {
      navigate(`/checkout/${planId}`);
    } else {
      navigate(`/register?plan=${planId}`);
    }
  };

  return (
    <div className="pricing-page-container">
      <div className="pricing-orbit-bg">
        <div className="pricing-orbit-1"></div>
        <div className="pricing-orbit-2"></div>
      </div>

      <div className="pricing-content-wrapper">
        <header className="pricing-hero-section">
          <h1 className="pricing-hero-title">
            <span className="highlight">{t('pricing.title')}</span> {t('pricing.title_gradient')}
          </h1>
          <p className="pricing-hero-desc">{t('pricing.subtitle')}</p>
        </header>

        <div className="pricing-main-grid">
          {plans.map((plan) => (
            <div key={plan.id} className={`pricing-card-sacred ${plan.recommended ? 'recommended' : ''}`}>
              {plan.recommended && <div className="recommended-badge">{t('plan.popular')}</div>}
              <div className="card-header">
                <span className="card-label">{t('pricing.badge')}</span>
                <h2 className="card-plan-name">{plan.name}</h2>
                <div className="card-price-row">
                  <span className="price-amount">
                    {plan.price === 0 ? t('plan.free_price') : `$${plan.price}`}
                  </span>
                  {plan.price !== 0 && <span className="price-period">{currency}{t('pricing.month')}</span>}
                </div>
                <p style={{ color: '#c2c6d7', fontSize: '0.875rem' }}>{plan.description}</p>
              </div>

              <ul className="card-features-list">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="feature-item">
                    <span className="material-symbols-outlined feature-icon">check_circle</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`plan-btn ${plan.recommended ? 'btn-primary-gradient' : 'btn-outline'}`}
                onClick={() => handlePlanSelection(plan.id)}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Bento Details */}
        <div className="pricing-bento-section">
          <div className="bento-item bento-library">
            <img src="https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=2070&auto=format&fit=crop" alt="Library" className="bento-bg-img" />
            <div className="bento-content">
              <h3 className="bento-title-lg">{t('pricing.bento_library_title')}</h3>
              <p className="text-sm opacity-70">{t('pricing.bento_library_desc')}</p>
            </div>
          </div>
          <div className="bento-item bento-sync">
            <div className="bento-sync-content">
              <div className="bento-icon-wrapper"><span className="material-symbols-outlined" style={{fontSize: '2rem'}}>sync_saved_locally</span></div>
              <div>
                <h3 className="font-bold">{t('pricing.bento_sync_title')}</h3>
                <p className="text-xs opacity-60">{t('pricing.bento_sync_desc')}</p>
              </div>
            </div>
          </div>
          <div className="bento-item bento-stats">
            <span className="stats-value">99.9%</span>
            <span className="stats-label">{t('pricing.bento_uptime')}</span>
          </div>
          <div className="bento-item bento-stats">
            <span className="stats-value">+10k</span>
            <span className="stats-label">{t('pricing.bento_pastors')}</span>
          </div>
        </div>

        <div className="admin-note-section">
          <p>{language === 'es' ? '¿Necesita un plan para su organización?' : 'Need a plan for your organization?'} <span className="link">{t('pricing.contact_sales')}</span></p>
        </div>
      </div>

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
