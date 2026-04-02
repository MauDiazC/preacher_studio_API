import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import Button from '../../../components/common/Button';
import './PricingPage.css';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const plans = [
    {
      name: t('plan.free'),
      price: t('plan.free_price'),
      description: 'Ideal para probar la potencia de la IA en tus estudios.',
      features: [
        '3 Consultas exegéticas/mes',
        '1 Proyecto de sermón activo',
        'Acceso a la comunidad',
        'Soporte básico'
      ],
      buttonText: t('btn.start_free'),
      isPopular: false
    },
    {
      name: t('plan.pro'),
      price: '$9.99',
      period: '/mes',
      description: 'La herramienta diaria del pastor moderno.',
      features: [
        t('plan.includes_all'),
        '50 Consultas exegéticas/mes',
        'Sermones ilimitados',
        'Exportar a PDF profesional',
        'Historial de snapshots',
        'Mentoría homilética IA'
      ],
      buttonText: t('btn.choose'),
      isPopular: true
    },
    {
      name: t('plan.unlimited'),
      price: '$19.99',
      period: '/mes',
      description: 'Para aquellos que profundizan sin límites.',
      features: [
        t('plan.includes_all'),
        'Consultas ILIMITADAS*',
        'Exportar a Keynote/PowerPoint',
        'Personalización de estilo',
        'Soporte prioritario 1-on-1',
        'Acceso a funciones Beta'
      ],
      buttonText: t('btn.be_exegete'),
      isPopular: false
    }
  ];

  return (
    <div className="pricing-container">
      <div className="pricing-background-glow"></div>
      
      <div className="pricing-header">
        <div className="badge">{t('pricing.badge')}</div>
        <h1 className="pricing-title">{t('pricing.title')} <span className="text-gradient">{t('pricing.title_gradient')}</span></h1>
        <p className="pricing-subtitle">
          {t('pricing.subtitle')}
        </p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <div key={index} className={`pricing-card ${plan.isPopular ? 'popular' : ''}`}>
            {plan.isPopular && <div className="popular-badge">{t('plan.popular')}</div>}
            <h3 className="plan-name">{plan.name}</h3>
            <div className="plan-price">
              <span className="amount">{plan.price}</span>
              {plan.period && <span className="period">{plan.period}</span>}
            </div>
            <p className="plan-description">{plan.description}</p>
            
            <ul className="plan-features">
              {plan.features.map((feature, fIndex) => (
                <li key={fIndex}>
                  <span className="check-icon">✓</span> {feature}
                </li>
              ))}
            </ul>

            <Button 
              variant={plan.isPopular ? 'primary' : 'outline'} 
              style={{ width: '100%', marginTop: 'auto' }}
              onClick={() => navigate('/register')}
            >
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>

      <div className="pricing-footer">
        <p>*Sujeto a política de uso justo. Gemini 1.5 Flash garantiza alta disponibilidad.</p>
        <div className="admin-access-note">
          ¿Eres administrador? <span className="link" onClick={() => navigate('/login')}>Inicia sesión</span> para acceso bypass.
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
