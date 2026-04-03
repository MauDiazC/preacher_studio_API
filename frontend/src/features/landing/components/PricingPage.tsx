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
      description: 'Ideal para la preparación básica del mensaje dominical.',
      features: [
        '3 Estudios exegéticos al mes',
        'Análisis literario y de autores',
        '1 Estudio guardado en la nube',
        'Formato de lectura estándar'
      ],
      buttonText: t('btn.start_free'),
      isPopular: false
    },
    {
      name: t('plan.pro'),
      price: '$9.99',
      period: '/mes',
      description: 'La herramienta diaria esencial para el pastor activo.',
      features: [
        t('plan.includes_all'),
        '25 Estudios exegéticos al mes',
        'Contexto histórico y de significancia',
        'Estudios guardados ilimitados',
        'Exportación profesional a PDF',
        'Historial de versiones (Snapshots)'
      ],
      buttonText: t('btn.choose'),
      isPopular: true
    },
    {
      name: t('plan.unlimited'),
      price: '$19.99',
      period: '/mes',
      description: 'Profundidad académica total para predicadores veteranos.',
      features: [
        t('plan.includes_all'),
        'Estudios exegéticos ILIMITADOS',
        'Exportación a Keynote y PowerPoint',
        'Personalización de estilo ministerial',
        'Mentoría homilética avanzada',
        'Soporte ministerial prioritario'
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
        <p>*Sujeto a política de uso justo para garantizar alta disponibilidad a todos los ministerios.</p>
        <div className="admin-access-note">
          ¿Eres administrador? <span className="link" onClick={() => navigate('/login')}>Inicia sesión</span> para acceso bypass.
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
