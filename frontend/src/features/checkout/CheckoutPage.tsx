import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { useNotificationStore } from '../../store/useNotificationStore';
import './CheckoutPage.css';

const CheckoutPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { addNotification } = useNotificationStore();
  
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const plans: Record<string, any> = {
    'plan_sembrador': {
      name: t('plan.free'),
      price: 0,
      features: [
        { name: '3 Estudios/mes', icon: 'description' },
        { name: 'Análisis literario básico', icon: 'menu_book' }
      ]
    },
    'mentor': {
      name: t('plan.pro'),
      price: language === 'en' ? 9.99 : 180,
      features: [
        { name: t('pricing.includes_prev'), icon: 'auto_awesome' },
        { name: language === 'en' ? 'Access to Strong Lexicons' : 'Acceso a Léxicos Strong', icon: 'menu_book' },
        { name: language === 'en' ? 'Biblical Maps & Geography' : 'Mapas Bíblicos y Geografía', icon: 'map' }
      ]
    },
    'ministerio': {
      name: t('plan.unlimited'),
      price: language === 'en' ? 19.99 : 360,
      features: [
        { name: t('pricing.includes_all'), icon: 'auto_awesome' },
        { name: t('pricing.pptx_keynote'), icon: 'present_to_all' },
        { name: language === 'en' ? 'Priority Ministerial Support' : 'Soporte Ministerial Prioritario', icon: 'support_agent' }
      ]
    }
  };

  const currentPlanId = planId || 'mentor';
  const selectedPlan = plans[currentPlanId] || plans['mentor'];

  const handleProceedToPayment = async () => {
    if (currentPlanId === 'plan_sembrador') {
      navigate('/sermons');
      return;
    }

    try {
      setIsProcessing(true);
      addNotification(t('checkout.processing') || 'Iniciando conexión segura con la pasarela...', 'info');
      
      const response = await api.post('/stripe/create-checkout-session', { 
        plan_id: currentPlanId 
      });

      if (response.data?.checkout_url) {
        // Redirigir a la pasarela de Stripe
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('No se recibió la URL de pago');
      }
    } catch (error: any) {
      console.error('❌ Error en Checkout:', error);
      const msg = error.response?.data?.detail || t('checkout.error_payment') || 'Error al conectar con la pasarela de pago';
      addNotification(msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) return (
    <div className="loading-screen-ministerial">
      <div className="loader-ministerial"></div>
      <p style={{ marginTop: '1.5rem', opacity: 0.6, letterSpacing: '0.1em' }}>
        {language === 'es' ? 'CONECTANDO CON PASARELA SEGURA...' : 'CONNECTING TO SECURE GATEWAY...'}
      </p>
    </div>
  );

  return (
    <div className="checkout-page-container">
      {/* Celestial Background */}
      <div className="checkout-orbit-bg">
        <div className="checkout-orbit-1"></div>
        <div className="checkout-orbit-2"></div>
      </div>

      <header className="w-full top-0 sticky z-50 bg-[#111127]/80 backdrop-blur-xl">
        <nav className="flex justify-between items-center px-8 py-4 w-full max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-bold tracking-tight text-[#b0c6ff] font-serif no-underline">
            PREACHER STUDIO
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link className="text-[#c2c1ff]/60 hover:text-[#c2c1ff] transition-colors no-underline text-sm font-medium" to="/sermons">Biblioteca</Link>
            <Link className="text-[#c2c1ff]/60 hover:text-[#c2c1ff] transition-colors no-underline text-sm font-medium" to="/sermons/new">Estudio</Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#b0c6ff] cursor-pointer hover:opacity-80 transition-opacity">account_circle</span>
          </div>
        </nav>
      </header>

      <main className="checkout-main-content">
        <div className="checkout-grid">
          {/* Left Column: Plan Details */}
          <section className="checkout-plan-details">
            <div className="checkout-header" style={{ marginBottom: '3rem' }}>
              <h1>{t('checkout.confirm_plan')}</h1>
              <p>{t('checkout.step_desc')}</p>
            </div>

            <div className="selected-plan-card">
              <div className="plan-card-accent"></div>
              <span className="plan-card-label">{t('checkout.selected_sub')}</span>
              
              <div className="plan-card-title-row">
                <h2 className="plan-card-name">{selectedPlan.name}</h2>
                <div className="plan-card-price">
                  ${selectedPlan.price}<span>{t('pricing.month')}</span>
                </div>
              </div>

              <div className="plan-features-mini">
                {selectedPlan.features.map((feature: any, index: number) => (
                  <div key={index} className="plan-feature-item">
                    <div className="feature-icon-wrapper">
                      <span className="material-symbols-outlined">{feature.icon}</span>
                    </div>
                    <div>
                      <p className="font-medium">{feature.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="change-plan-zone">
                <p className="text-sm text-on-surface-variant" style={{ margin: 0 }}>
                  {t('checkout.change_plan')}
                </p>
                <button className="btn-text-link" onClick={() => navigate('/pricing')}>
                  {t('checkout.explore_others')}
                </button>
              </div>
            </div>

            <div className="trust-row-mini">
              <div className="trust-badge-mini">
                <span className="material-symbols-outlined">verified_user</span>
                <div>
                  <p className="font-label" style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.6 }}>{t('checkout.guarantee')}</p>
                  <p className="text-sm font-semibold">{t('checkout.secure_payment')}</p>
                </div>
              </div>
              <div className="trust-badge-mini">
                <span className="material-symbols-outlined">auto_awesome</span>
                <div>
                  <p className="font-label" style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.6 }}>{t('checkout.trust')}</p>
                  <p className="text-sm font-semibold">{t('checkout.ministerial_backing')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Summary & Payment */}
          <aside className="checkout-summary-panel">
            <h3 className="summary-title">{t('checkout.summary_title')}</h3>
            
            <div className="summary-row">
              <span>{language === 'es' ? `Subtotal Plan ${selectedPlan.name}` : `${selectedPlan.name} Plan Subtotal`}</span>
              <span className="text-on-surface font-medium">${selectedPlan.price.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>{t('checkout.taxes')}</span>
              <span className="text-on-surface font-medium">$0.00</span>
            </div>

            <div className="summary-divider"></div>

            <div className="total-row">
              <span className="total-label">{t('checkout.total_to_pay')}</span>
              <span className="total-amount">${selectedPlan.price.toFixed(2)} / {language === 'es' ? 'mes' : 'month'}</span>
            </div>

            <div className="promo-code-box">
              <input 
                type="text" 
                className="promo-input" 
                placeholder={t('checkout.promo_code')}
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button className="btn-apply-promo">{t('checkout.apply_btn')}</button>
            </div>

            <button className="btn-proceed-payment" onClick={handleProceedToPayment} disabled={isProcessing}>
              <span className="material-symbols-outlined">lock</span>
              {isProcessing ? '...' : t('checkout.proceed_btn')}
            </button>

            <div className="payment-methods-row">
              <div style={{ display: 'flex', gap: '1rem', opacity: 0.5 }}>
                <span className="material-symbols-outlined">credit_card</span>
                <span className="material-symbols-outlined">account_balance</span>
              </div>
              <p className="encryption-notice">
                {t('checkout.encrypted_notice')}
              </p>
            </div>

            <p className="quote-footer-checkout">
              {t('checkout.quote_preparation')}
            </p>
          </aside>
        </div>
      </main>

      <footer className="sacred-footer-checkout">
        <div className="footer-links-checkout">
          <a href="#" className="footer-link-checkout">{t('footer.privacy')}</a>
          <a href="#" className="footer-link-checkout">{t('footer.terms')}</a>
          <a href="#" className="footer-link-checkout">{t('footer.contact')}</a>
        </div>
        <p style={{ fontSize: '10px', opacity: 0.4 }}>
          © 2026 Preacher Studio. {t('auth.inspired_prep')}.
        </p>
      </footer>
    </div>
  );
};

export default CheckoutPage;
